import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { VIEWPORTS, check } from './layout-resilience.generated.mjs';
import { scenarios } from './scenarios.mjs';
import { ACTIONS, OPENINGS, OUTCOMES, answered, formDrawn, openWith, pending, started } from './doi.mjs';

// These tests check whether Bridging's pages survive a narrow window, a zoomed window and wider text,
// and whether their placeholders, field boundaries, icons, focus indicators and selection marks can
// be seen. The checks are the shared ones the token package generates into
// `layout-resilience.generated.mjs`, which says what WCAG asks and how each check measures it. This
// spec reaches each state the accessibility spec scans and records what Bridging excuses. The hovered
// and focused states are not repeated, because the indicators check focuses every control itself.

const registry = JSON.parse(readFileSync(new URL('../../.ui-surfaces.json', import.meta.url), 'utf8'));

/** CEE draws the DOI form and `cedar-embeddable-field` a single field. CEE's own suite checks both. */
const EMBEDDED = ['cedar-embeddable-editor', 'cedar-embeddable-field'];

/** Each state the checks open. */
const states = {};
for (const surface of registry.surfaces.filter((surface) => surface.contract))
  states[surface.id] = scenarios[surface.scenario];
for (const [name, answer] of Object.entries(OPENINGS))
  states[`DOI form opened with ${name}`] = async (page) => {
    await openWith(page, () => answer);
    if (answer[0] === 200) await formDrawn(page);
    else await expect(page.locator('.error-doi-container')).toBeVisible();
  };
states['DOI form whose editor failed to load'] = async (page) => {
  await page.route('**/cedar-embeddable-editor.host-fonts.js', (route) => route.abort());
  await openWith(page, () => started());
  await expect(page.locator('.error-doi-container')).toBeVisible();
};
for (const action of Object.keys(ACTIONS)) {
  states[`${action} in progress`] = (page) => pending(page, action);
  states[`${action} answered with success`] = (page) => answered(page, action, OUTCOMES.success);
  states[`${action} answered with an error`] = (page) => answered(page, action, OUTCOMES['500 with a message']);
}

/**
 * What the checks find that is left as it is, each with the visible change that would remove it.
 * Each entry gives its check, kind, selector, states and why, as `Exception` in the generated
 * declaration says. An entry no listed state produces fails.
 */
const EXCEPTIONS = [];

/** Each layout check by the name its tests carry. */
const conditions = { reflow: 'reflow', resize: 'resize', 'text spacing': 'spacing' };

for (const [state, open] of Object.entries(states)) {
  /** Set the viewport `name` measures in, reach the state, and move the pointer out of the way. */
  const reach = async (page, name) => {
    await page.setViewportSize(VIEWPORTS[name]);
    await open(page);
    await page.mouse.move(0, 0);
  };
  const request = (name) => ({ check: name, state, scope: null, exclude: EMBEDDED, exceptions: EXCEPTIONS });

  for (const [condition, name] of Object.entries(conditions))
    test(`${state} survives ${condition}`, async ({ page }) => {
      await reach(page, name);
      const { measured } = await check(page, expect, request(name));
      // The toolbar's title shows in every state, so a check that measured no text excluded too much.
      expect(measured.texts, 'texts measured').toBeGreaterThan(0);
    });

  // Every placeholder and field boundary on these pages is CEE's. A count above none means Bridging
  // has drawn one of its own, which the check then measures.
  test(`${state} draws its placeholders at 4.5:1`, async ({ page }) => {
    await reach(page, 'placeholder');
    const { measured } = await check(page, expect, request('placeholder'));
    expect(measured.placeholder, 'placeholders of its own').toBe(0);
  });
  test(`${state} draws its field boundaries at 3:1`, async ({ page }) => {
    await reach(page, 'boundary');
    const { measured } = await check(page, expect, request('boundary'));
    expect(measured.boundary, 'field boundaries of its own').toBe(0);
  });

  test(`${state} draws its icons, focus indicators and selection marks at 3:1`, async ({ page }) => {
    await reach(page, 'indicators');
    const { measured } = await check(page, expect, { ...request('indicators'), selected: [] });
    // A selector that stops matching would let the check pass by measuring nothing. The toolbar's
    // Home and User buttons are each identified by an icon alone.
    expect(measured.icon, 'icons').toBeGreaterThanOrEqual(2);
    expect(measured.focus, 'focus indicators').toBeGreaterThanOrEqual(2);
  });
}
