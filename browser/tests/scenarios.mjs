// Each scenario opens one registered surface, signed in, with the bridge answering as the
// surface needs.
import { expect } from '@playwright/test';
import { signedIn } from './backend.mjs';
import { formDrawn, openWith, started } from './doi.mjs';

const sourceArtifactId = 'https://repo.metadatacenter.org/templates/7c1e2b5a-0d4f-4e8b-9a36-2f5d8c1b7e94';

// Preserve the same response for opening the form and taking an action.
const openDoi = (page, answer) => openWith(page, answer, answer);

export const scenarios = {
  'dashboard-page': async (page) => {
    await signedIn(page);
    await page.goto('/');
    await expect(page.locator('mat-card-title')).toBeVisible();
  },
  'user-menu': async (page) => {
    await signedIn(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'User' }).click();
    await expect(page.getByRole('menuitem').first()).toBeVisible();
  },
  'datacite-page': async (page) => {
    await openDoi(page, () => started());
    await formDrawn(page);
    await expect(page.getByRole('button', { name: 'Create DOI' })).toBeVisible();
  },
  // A draft DOI already started for the artifact is named above the form.
  'draft-doi-page': async (page) => {
    await openDoi(page, () => started({ draftDoi: '10.82658/7xq2-k9d4' }));
    await formDrawn(page);
    await expect(page.locator('.draft-doi-container')).toBeVisible();
  },
  // An artifact with a findable DOI gets no form, only the DOI it already has.
  'doi-exists-page': async (page) => {
    const doi = 'https://doi.org/10.82658/3fz8-q1m6';
    await openDoi(page, () => [409, {
      errorKey: 'doiAlreadyExists',
      message: `The template(${sourceArtifactId}) already has a DOI: ${doi}`,
      parameters: { doi },
    }]);
    await expect(page.locator('.error-doi-container')).toBeVisible();
  },
};
