import { test, expect } from '@playwright/test';
import { ACTIONS, OUTCOMES, formDrawn, openWith, started } from './doi.mjs';

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
        await expect(page.getByRole('button', { name: action, exact: true })).toBeFocused();
      });

// Success contains the returned DOI, so it remains available without a reading-time limit.
for (const action of Object.keys(ACTIONS))
  test(`${action}'s success remains until dismissed or replaced by another request`, async ({ page }) => {
    await page.clock.install();
    let answer = OUTCOMES.success;
    await openWith(page, () => started(), () => answer);
    await formDrawn(page);
    const live = page.locator('.doi-notices [aria-live="polite"]');
    await expect(live).toHaveCount(2);
    await expect(live).toHaveText(['', '']);
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    const button = page.getByRole('button', { name: action, exact: true });
    await button.click();
    const notice = page.locator('.notify-success');
    await expect(notice).toBeVisible();
    await expect(notice.locator('xpath=ancestor::*[@aria-live="polite"]')).toContainText('DOI');
    await page.clock.runFor(60_000);
    await expect(notice).toBeVisible();
    answer = OUTCOMES['500 with a message'];
    await button.click();
    await expect(notice).toHaveCount(0);
    await expect(page.locator('.notify-error')).toBeVisible();
    await expect(page.locator('.notify-error').locator('xpath=ancestor::*[@aria-live="polite"]')).toContainText('Error');
  });
