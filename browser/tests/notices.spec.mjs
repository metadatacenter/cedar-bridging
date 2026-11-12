import { test, expect } from '@playwright/test';
import { ACTIONS, DISMISSAL, OUTCOMES, formDrawn, holdDismissal, openWith, started } from './doi.mjs';

// After Create DOI or Save Draft, the notice reporting the bridge's answer takes a row of its own
// under the action buttons. The page scrolls it into view, does not scroll sideways for it, and gives
// its dismiss button the minimum target size, in a wide window and a narrow one.

const ANSWERS = { success: OUTCOMES.success, 'an error': OUTCOMES['500 with a message'] };
const WINDOWS = [{ width: 1280, height: 720 }, { width: 375, height: 720 }];
const BUTTONS = ['Close', 'Create DOI', 'Save Draft'];

for (const viewport of WINDOWS)
  for (const action of Object.keys(ACTIONS))
    for (const [name, answer] of Object.entries(ANSWERS))
      test(`${action} answered with ${name} at ${viewport.width}px shows its notice under the buttons`, async ({ page }) => {
        await page.setViewportSize(viewport);
        // A slow run must not lose the notice to its own dismissal before the checks end.
        if (answer[0] === 200) await holdDismissal(page);
        await openWith(page, () => started(), () => answer);
        await formDrawn(page);
        await page.getByRole('button', { name: action, exact: true }).click();
        const notice = page.locator(answer[0] === 200 ? '.notify-success' : '.notify-error');
        await expect(notice).toBeVisible();

        await expect(notice, 'the notice lies wholly inside the window').toBeInViewport({ ratio: 1 });
        const box = await notice.boundingBox();
        for (const label of BUTTONS) {
          const button = await page.getByRole('button', { name: label, exact: true }).boundingBox();
          expect(box.y, `the notice begins below ${label}`).toBeGreaterThanOrEqual(button.y + button.height);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
          'the page does not scroll sideways').toBeLessThanOrEqual(0);

        const dismiss = notice.getByRole('button', { name: 'Dismiss notification', exact: true });
        const target = await dismiss.boundingBox();
        expect(Math.min(target.width, target.height), 'the dismiss button is at least 24 by 24 px').toBeGreaterThanOrEqual(24);
        await dismiss.click();
        await expect(notice).toHaveCount(0);
      });

// The clock moves only when the test moves it, so the notice is checked just before its delay ends
// and just after, however slowly the run goes.
for (const action of Object.keys(ACTIONS))
  test(`${action}'s success notice dismisses itself after ${DISMISSAL / 1000} seconds`, async ({ page }) => {
    await page.clock.install();
    await openWith(page, () => started(), () => OUTCOMES.success);
    await formDrawn(page);
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await page.getByRole('button', { name: action, exact: true }).click();
    const notice = page.locator('.notify-success');
    await expect(notice).toBeVisible();
    await page.clock.runFor(DISMISSAL - 1);
    await expect(notice).toBeVisible();
    await page.clock.runFor(1);
    await expect(notice).toHaveCount(0);
  });
