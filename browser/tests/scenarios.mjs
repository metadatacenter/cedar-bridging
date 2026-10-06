// Each scenario opens one registered surface, signed in, with the bridge answering as the
// surface needs.
import { expect } from '@playwright/test';
import { fixture, signedIn } from './backend.mjs';

const sourceArtifactId = 'https://repo.metadatacenter.org/templates/7c1e2b5a-0d4f-4e8b-9a36-2f5d8c1b7e94';
const doiPage = `/doi/datacite/${encodeURIComponent(sourceArtifactId)}`;

// When the DOI form opens, the bridge returns the DataCite template, the artifact the DOI is for,
// and the draft DOI already started for it, if there is one. No metadata is pre-filled, so the form
// opens with only the template's defaults.
const start = (answer = {}) => () => [200, {
  sourceArtifactType: 'template',
  sourceArtifact: { '@id': sourceArtifactId, 'schema:name': 'Study Metadata' },
  dataCiteTemplate: fixture('datacite-template'),
  existingDataCiteMetadata: null,
  draftDoi: null,
  ...answer,
}];

// The form has drawn once the embedded editor shows the template's title.
const formDrawn = (page) => expect(page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 })).toBeVisible();

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
    await signedIn(page, { 'datacite/create-doi': start() });
    await page.goto(doiPage);
    await formDrawn(page);
    await expect(page.getByRole('button', { name: 'Create DOI' })).toBeVisible();
  },
  // A draft DOI already started for the artifact is named above the form.
  'draft-doi-page': async (page) => {
    await signedIn(page, { 'datacite/create-doi': start({ draftDoi: '10.82658/7xq2-k9d4' }) });
    await page.goto(doiPage);
    await formDrawn(page);
    await expect(page.locator('.draft-doi-container')).toBeVisible();
  },
  // An artifact with a findable DOI gets no form, only the DOI it already has.
  'doi-exists-page': async (page) => {
    const doi = 'https://doi.org/10.82658/3fz8-q1m6';
    await signedIn(page, {
      'datacite/create-doi': () => [409, {
        errorKey: 'doiAlreadyExists',
        message: `The template(${sourceArtifactId}) already has a DOI: ${doi}`,
        parameters: { doi },
      }],
    });
    await page.goto(doiPage);
    await expect(page.locator('.error-doi-container')).toBeVisible();
  },
};
