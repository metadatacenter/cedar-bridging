import { test, expect } from '@playwright/test';
import { NETWORK_FAILURE, signedIn } from './backend.mjs';
import { ACTIONS, OPENINGS, OUTCOMES, compactAddress, doi, doiPage, formDrawn, openWith, started } from './doi.mjs';

// The DOI form against each answer the bridge can give: first when the form opens, then when the
// user creates the DOI or saves a draft. Opening shows the form, the draft already started, the DOI
// that already exists, or why the form could not be opened. Each action reports the DOI the bridge
// returned, or the error in the bridge's own words. A failure without words is reported by its status.

/**
 * What the page says about a failed request, as `serverErrorText` words it. A failure of a service behind
 * the bridge is reported by that service's status, as it was before the bridge explained it.
 */
const said = (status, body) =>
  status === NETWORK_FAILURE ? 'the server could not be reached'
    : body?.errorKey === 'upstreamServerError'
      ? `the server answered with status ${body.parameters?.upstreamStatusCode ?? status}`
      : body?.message ?? body?.errorMessage ?? `the server answered with status ${status}`;

test('the landing page defers CEE until a DOI form is opened', async ({ page }) => {
  const downloads = [];
  page.on('request', request => {
    if (/cedar-embeddable-editor.*\.js/.test(request.url())) downloads.push(request.url());
  });
  await signedIn(page, { 'datacite/create-doi': () => started() });
  await page.goto('/');
  await expect(page.locator('mat-card-title', { hasText: 'Create Datacite DOI' })).toBeVisible();
  expect(downloads).toEqual([]);
  await page.goto(doiPage);
  await formDrawn(page);
  expect(downloads).toHaveLength(1);
});

test('an editor download failure uses the existing form error and leaves actions absent', async ({ page }) => {
  await page.route('**/cedar-embeddable-editor.host-fonts.js', route => route.abort());
  await openWith(page, () => started());
  await expect(page.locator('.error-doi-container')).toHaveText('Error Opening The DataCite Form - the editor could not be loaded');
  await expect(page.getByRole('button', { name: 'Create DOI' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save Draft' })).toHaveCount(0);
});

for (const [name, answer] of Object.entries(OPENINGS))
  test(`the DOI form opened with ${name}`, async ({ page }) => {
    await openWith(page, () => answer);
    const [status, body] = answer;
    if (status === 200) {
      await formDrawn(page);
      await expect(page.getByRole('button', { name: 'Create DOI' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();
      await expect(page.locator('.draft-doi-container')).toHaveCount(body.draftDoi ? 1 : 0);
      if (body.draftDoi) await expect(page.locator('.draft-doi-container')).toContainText(body.draftDoi);
      await expect(page.locator('.error-doi-container')).toHaveCount(0);
      return;
    }
    await expect(page.locator('cedar-embeddable-editor')).toHaveCount(0);
    const notice = page.locator('.error-doi-container');
    await expect(notice).toHaveCount(1);
    if (name === 'a DOI already findable') {
      await expect(notice.getByRole('link', { name: doi })).toBeVisible();
      return;
    }
    await expect(notice).toHaveText(`Error Opening The DataCite Form - ${said(status, body)}`);
  });

for (const [action, { state, success, failure }] of Object.entries(ACTIONS))
  for (const [name, outcome] of Object.entries(OUTCOMES))
    test(`${action} answered with ${name}`, async ({ page }) => {
      const requests = await openWith(page, () => started(), () => outcome);
      await formDrawn(page);
      await page.getByRole('button', { name: action }).click();
      const [status, body] = outcome;
      if (status === 200) {
        await expect(page.locator('.notify-success')).toContainText(success + body.doiName);
        await expect(page.locator('.notify-error')).toHaveCount(0);
      } else {
        await expect(page.locator('.notify-error pre')).toHaveText(failure + said(status, body));
        await expect(page.locator('.notify-success')).toHaveCount(0);
      }
      await expect(page.locator('.notify-progress')).toHaveCount(0);
      // The action asks for the right state, for the artifact by its compact address.
      const posted = requests.filter((request) => request.method === 'POST');
      expect(posted).toHaveLength(1);
      expect(posted[0].state).toBe(state);
      expect(posted[0].id).toBe(compactAddress);
    });

for (const [action, { success, failure }] of Object.entries(ACTIONS))
  test(`${action} that fails and then succeeds clears its error`, async ({ page }) => {
    let attempt = 0;
    await openWith(page, () => started(), () => (++attempt === 1 ? [500, { message: 'DataCite is unavailable' }] : [200, { doiName: '10.82658/9kq4-2zt7' }]));
    await formDrawn(page);
    await page.getByRole('button', { name: action }).click();
    await expect(page.locator('.notify-error pre')).toHaveText(`${failure}DataCite is unavailable`);
    await page.getByRole('button', { name: action }).click();
    await expect(page.locator('.notify-success')).toContainText(`${success}10.82658/9kq4-2zt7`);
    await expect(page.locator('.notify-error')).toHaveCount(0);
  });
