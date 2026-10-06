import { test, expect } from '@playwright/test';
import { NETWORK_FAILURE, fixture, signedIn } from './backend.mjs';

// The DOI form against each answer the bridge can give: first when the form opens, then when the
// user creates the DOI or saves a draft. Opening shows the form, the draft already started, the DOI
// that already exists, or why the form could not be opened. Each action reports the DOI the bridge
// returned, or the error in the bridge's own words. A failure without words is reported by its status.

const uuid = '7c1e2b5a-0d4f-4e8b-9a36-2f5d8c1b7e94';
const sourceArtifactId = `https://repo.metadatacenter.org/templates/${uuid}`;
const doiPage = `/doi/datacite/${encodeURIComponent(sourceArtifactId)}`;
const doi = 'https://doi.org/10.82658/3fz8-q1m6';

const started = (answer = {}) => [200, {
  sourceArtifactType: 'template',
  sourceArtifact: { '@id': sourceArtifactId, 'schema:name': 'Study Metadata' },
  dataCiteTemplate: fixture('datacite-template'),
  existingDataCiteMetadata: null,
  draftDoi: null,
  ...answer,
}];

/** What the page says about a failed request, as `serverErrorText` words it. */
const said = (status, body) =>
  status === NETWORK_FAILURE ? 'the server could not be reached'
    : body?.message ?? body?.errorMessage ?? `the server answered with status ${status}`;

// The bridge answers the opening GET and the action's POST at one path. Each request it receives is
// kept, so a test can say what the page asked for.
async function openWith(page, open, act = () => [500, {}]) {
  const requests = [];
  await signedIn(page, {
    'datacite/create-doi': (request) => {
      const query = new URL(request.url()).searchParams;
      requests.push({ method: request.method(), state: query.get('state'), id: query.get('source_artifact_id') });
      return request.method() === 'GET' ? open() : act();
    },
  });
  await page.goto(doiPage);
  return requests;
}
const formDrawn = (page) => expect(page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 })).toBeVisible();

const OPENINGS = {
  'nothing started': started(),
  'a draft DOI already started': started({ draftDoi: '10.82658/7xq2-k9d4' }),
  'a DOI already findable': [409, { errorKey: 'doiAlreadyExists', message: `The template(${sourceArtifactId}) already has a DOI: ${doi}`, parameters: { doi } }],
  401: [401, {}],
  403: [403, { message: 'You do not have permission to create a DOI for this artifact' }],
  404: [404, {}],
  409: [409, { errorKey: 'somethingElse', message: 'The artifact is locked' }],
  500: [500, { message: 'The bridge could not reach DataCite' }],
  [NETWORK_FAILURE]: [NETWORK_FAILURE, null],
};

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

const ACTIONS = {
  'Create DOI': { state: 'publish', success: 'DOI created successfully! The DOI is:  ', failure: 'Error Creating A DOI - ' },
  'Save Draft': { state: 'draft', success: 'Draft DOI saved successfully! The DOI is:  ', failure: 'Error Saving A Draft DOI - ' },
};
const OUTCOMES = {
  success: [200, { doiName: '10.82658/9kq4-2zt7' }],
  'a validation error': [400, { message: 'The title is required' }],
  401: [401, {}],
  403: [403, { message: 'You do not have permission to create a DOI for this artifact' }],
  409: [409, { errorKey: 'doiAlreadyExists', message: `The template(${sourceArtifactId}) already has a DOI: ${doi}` }],
  '500 with a message': [500, { message: 'DataCite is unavailable' }],
  '500 without a message': [500, {}],
  [NETWORK_FAILURE]: [NETWORK_FAILURE, null],
};

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
      expect(posted[0].id).toBe(`templates/${uuid}`);
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
