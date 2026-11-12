// The bridge answers the DOI form twice: when the form opens, and when the user creates the DOI or
// saves a draft. These tables give every answer it can give each time. The matrix spec asserts what
// each answer shows, and the accessibility spec scans the states the answers reach.
import { expect } from '@playwright/test';
import { NETWORK_FAILURE, fixture, signedIn } from './backend.mjs';

const uuid = '7c1e2b5a-0d4f-4e8b-9a36-2f5d8c1b7e94';
const sourceArtifactId = `https://repo.metadatacenter.org/templates/${uuid}`;
export const compactAddress = `templates/${uuid}`;
export const doiPage = `/doi/datacite/${encodeURIComponent(sourceArtifactId)}`;
export const doi = 'https://doi.org/10.82658/3fz8-q1m6';

export const started = (answer = {}) => [200, {
  sourceArtifactType: 'template',
  sourceArtifact: { '@id': sourceArtifactId, 'schema:name': 'Study Metadata' },
  dataCiteTemplate: fixture('datacite-template'),
  existingDataCiteMetadata: null,
  draftDoi: null,
  ...answer,
}];

/** The bridge's error body for a service behind it that failed. */
const upstreamFailure = (statusCode, message, parameters = {}) => ({
  status: statusCode === 404 ? 'NOT_FOUND' : 'BAD_GATEWAY', statusCode, errorKey: 'upstreamServerError',
  errorReasonKey: null, message, parameters, objects: {},
});

// The bridge answers the opening GET and the action's POST at one path. Each request it receives is
// kept, so a test can say what the page asked for.
export async function openWith(page, open, act = () => [500, {}]) {
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
export const formDrawn = (page) => expect(page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 })).toBeVisible();

/** Open the DOI form with nothing started, and wait until it is drawn. */
export async function form(page, act) {
  await openWith(page, () => started(), act);
  await formDrawn(page);
}

/**
 * Open the DOI form, take `action`, and wait until the notice that reports `outcome` shows inside the
 * window, where the page scrolls a new notice. A success notice stays up until the test ends.
 */
export async function answered(page, action, outcome) {
  await form(page, () => outcome);
  await page.getByRole('button', { name: action, exact: true }).click();
  await expect(page.locator(outcome[0] === 200 ? '.notify-success' : '.notify-error')).toBeInViewport({ ratio: 1 });
}

/** Open the DOI form and take `action`, which the bridge holds unanswered until the test ends. */
export async function pending(page, action) {
  await form(page);
  await page.route('**/datacite/create-doi?**', (route) =>
    route.request().method() === 'POST' ? new Promise(() => {}) : route.fallback());
  await page.getByRole('button', { name: action, exact: true }).click();
  await expect(page.locator('.notify-progress')).toBeInViewport({ ratio: 1 });
}

export const OPENINGS = {
  'nothing started': started(),
  'a draft DOI already started': started({ draftDoi: '10.82658/7xq2-k9d4' }),
  'a DOI already findable': [409, { errorKey: 'doiAlreadyExists', message: `The template(${sourceArtifactId}) already has a DOI: ${doi}`, parameters: { doi } }],
  401: [401, {}],
  403: [403, { message: 'You do not have permission to create a DOI for this artifact' }],
  404: [404, {}],
  409: [409, { errorKey: 'somethingElse', message: 'The artifact is locked' }],
  500: [500, { message: 'The bridge could not reach DataCite' }],
  'a resource read the bridge relays': [404, upstreamFailure(404,
    `The resource server answered HTTP 404 when asked for the template ${sourceArtifactId}.`)],
  [NETWORK_FAILURE]: [NETWORK_FAILURE, null],
};

export const ACTIONS = {
  'Create DOI': { state: 'publish', success: 'DOI created successfully! The DOI is:  ', failure: 'Error Creating A DOI - ' },
  'Save Draft': { state: 'draft', success: 'Draft DOI saved successfully! The DOI is:  ', failure: 'Error Saving A Draft DOI - ' },
};
export const OUTCOMES = {
  success: [200, { doiName: '10.82658/9kq4-2zt7' }],
  'a validation error': [400, { message: 'The title is required' }],
  401: [401, {}],
  403: [403, { message: 'You do not have permission to create a DOI for this artifact' }],
  409: [409, { errorKey: 'doiAlreadyExists', message: `The template(${sourceArtifactId}) already has a DOI: ${doi}` }],
  '500 with a message': [500, { message: 'DataCite is unavailable' }],
  '500 without a message': [500, {}],
  'DataCite refusing the registration': [409, upstreamFailure(409, 'DataCite refused the request with HTTP 409.',
    { upstreamStatusCode: 409, upstreamService: 'DataCite' })],
  'DataCite failing': [502, upstreamFailure(502, 'DataCite failed with HTTP 500.',
    { upstreamStatusCode: 500, upstreamService: 'DataCite' })],
  [NETWORK_FAILURE]: [NETWORK_FAILURE, null],
};
