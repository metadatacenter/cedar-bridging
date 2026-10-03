// Bridging reads its configuration, signs in through Keycloak, and calls the bridge and, through
// the embedded editor, the terminology server. This module answers all of them inside the browser.
// The configuration points the application at hosts that cannot resolve. Keycloak signs a test
// user in through the check-sso exchange a real server runs, and the services answer from
// fixtures. Every other request that would leave the machine is refused.
import { readFileSync } from 'node:fs';
import { test } from '@playwright/test';

export const fixture = (name) => JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'));

const config = fixture('app-config');
const realm = new URL('realms/CEDAR', config.keycloakUrl).pathname;
const session = 'b1e5f0d2-3c47-4a8e-9d61-7f2a4c8e0b93';
const user = {
  id: '6d2c9a1e-4b7f-4e3a-8c05-1f9b2d7e4a60',
  username: 'test1@test.com',
  firstName: 'Test',
  lastName: 'User',
  email: 'test1@test.com',
  emailVerified: true,
};

// The tokens are unsigned JWTs. The client decodes their claims and never checks a signature.
const jwt = (claims) =>
  [{ alg: 'none', typ: 'JWT' }, claims].map((part) => Buffer.from(JSON.stringify(part)).toString('base64url')).join('.') + '.';

const html = (script) => ({ contentType: 'text/html', body: `<!doctype html><script>${script}</script>` });

// The application calls each service from another origin with a bearer token or a cookie, so every
// answer allows the calling origin and its credentials.
const cors = (request) => ({
  'access-control-allow-origin': request.headers().origin ?? '*',
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'authorization, content-type, accept',
  'access-control-allow-methods': 'GET, POST, PUT, OPTIONS',
});

function keycloak(route) {
  const request = route.request();
  const url = new URL(request.url());
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors(request) });
  switch (url.pathname) {
    // Before it trusts the session iframe and the silent check, the client asks whether the
    // browser keeps third-party cookies.
    case `${realm}/protocol/openid-connect/3p-cookies/step1.html`:
      return route.fulfill(html(`parent.postMessage('supported', '*');`));
    // The session iframe receives "<clientId> <sessionId>". Before sign-in there is no session, so
    // it reports a change and the client runs the silent check. Afterwards it reports no change.
    case `${realm}/protocol/openid-connect/login-status-iframe.html`:
      return route.fulfill(html(
        `addEventListener('message', (e) => e.source.postMessage(String(e.data).split(' ')[1] ? 'unchanged' : 'changed', e.origin));`,
      ));
    // The silent check loads the authorization endpoint in a hidden iframe, and a signed-in session
    // redirects straight back with a code. The code carries the request's nonce, so the token
    // exchange can return it as the client requires.
    case `${realm}/protocol/openid-connect/auth`: {
      const query = url.searchParams;
      const answer = new URLSearchParams({ state: query.get('state'), session_state: session, code: `stub.${query.get('nonce')}` });
      return route.fulfill({ status: 302, headers: { location: `${query.get('redirect_uri')}#${answer}` } });
    }
    case `${realm}/protocol/openid-connect/token`: {
      const code = new URLSearchParams(request.postData() ?? '').get('code') ?? '';
      const now = Math.floor(Date.now() / 1000);
      const claims = {
        exp: now + 3600, iat: now, auth_time: now, iss: new URL(realm, config.keycloakUrl).href,
        aud: 'cedar-frontend-bridging', azp: 'cedar-frontend-bridging', sub: user.id, typ: 'Bearer',
        nonce: code.replace(/^stub\./, ''), session_state: session, sid: session, scope: 'openid email profile',
        realm_access: { roles: [] }, resource_access: {},
        name: `${user.firstName} ${user.lastName}`, preferred_username: user.username,
        given_name: user.firstName, family_name: user.lastName, email: user.email, email_verified: true,
      };
      return route.fulfill({
        headers: cors(request),
        json: {
          access_token: jwt(claims), refresh_token: jwt({ ...claims, typ: 'Refresh' }), id_token: jwt({ ...claims, typ: 'ID' }),
          token_type: 'Bearer', expires_in: 3600, refresh_expires_in: 3600, session_state: session, scope: claims.scope,
        },
      });
    }
    // Every page loads the signed-in user's profile.
    case `${realm}/account`:
      return route.fulfill({ headers: cors(request), json: user });
    default:
      return route.fulfill({ status: 404, headers: cors(request), json: {} });
  }
}

// The embedded editor asks the terminology server for each controlled field's values as the form
// draws. A field constrained to a list of classes is offered those classes, as the server would
// offer them. A branch or an ontology is offered nothing.
function terminology(route) {
  const request = route.request();
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors(request) });
  const classes = request.postDataJSON()?.parameterObject?.valueConstraints?.classes ?? [];
  const collection = classes.map((term) => ({
    '@id': term.uri, id: term.uri, type: term.type, prefLabel: term.prefLabel ?? term.label,
    notation: {}, definition: '', source: term.source,
  }));
  return route.fulfill({
    headers: cors(request),
    json: { page: 1, pageCount: 1, pageSize: 50, totalCount: collection.length, prevPage: null, nextPage: null, collection },
  });
}

// This signs the page in and answers the services. Each entry of `bridge` identifies a path under
// the bridge and gives a function of the request that returns a status and a body. The bridge
// answers any other path with a 404.
export async function signedIn(page, bridge = {}) {
  const app = new URL(test.info().project.use.baseURL).host;
  await page.route((url) => url.host !== app, (route) => route.abort());
  await page.route('**/assets/data/appConfig.json', (route) => route.fulfill({ json: config }));
  await page.route((url) => url.origin === new URL(config.keycloakUrl).origin, keycloak);
  await page.route(`${config.terminologyBaseUrl}bioportal/integrated-search`, terminology);
  await page.route((url) => url.origin === new URL(config.bridgeUrl).origin, (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors(request) });
    const answer = bridge[new URL(request.url()).pathname.slice(1)];
    const [status, body] = answer ? answer(request) : [404, {}];
    return route.fulfill({ status, headers: cors(request), json: body });
  });
}
