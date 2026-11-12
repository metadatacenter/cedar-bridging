import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { surfaceCases } from './surface-contracts.generated.mjs';
import { scenarios } from './scenarios.mjs';
import { ACTIONS, OPENINGS, OUTCOMES, answered, doi, form, formDrawn, openWith, pending, started } from './doi.mjs';

// axe checks every state the other specs reach against WCAG. A rule engine decides names, roles, ARIA
// validity, the contrast it can compute and target sizes. It cannot decide focus order or what a
// screen reader announces, so those would need assertions of their own.

const registry = JSON.parse(readFileSync(new URL('../../.ui-surfaces.json', import.meta.url), 'utf8'));

/**
 * CEE draws the DOI form in its own shadow root, and `cedar-embeddable-field` draws a single field.
 * CEE's own gate assesses both, so this one leaves them out.
 */
const EMBEDDED = ['cedar-embeddable-editor', 'cedar-embeddable-field'];

/**
 * WCAG 2.1's Label in Name, criterion 2.5.3: a control's accessible name contains the text it shows.
 * axe-core's rule for it is experimental, and a tag selection leaves experimental rules out, so it
 * runs by name, as in Workspace's, the designer's, the term picker's and CEE's gates.
 */
const LABEL_IN_NAME = 'label-content-name-mismatch';

/**
 * Wait until the page's animations finish, so contrast is read at full opacity. A click renders on a
 * later frame, so the fade it starts may not exist for two frames, and a ripple starts to fade out
 * only once it has faded in. The wait ends when two frames pass with no animation running. Chromium
 * lists a shadow tree's animations on its root and not on the document.
 */
async function still(page) {
  await page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    for (let attempts = 0; attempts < 20; attempts++) {
      await frame();
      await frame();
      const roots = [document];
      for (const element of document.querySelectorAll('*')) if (element.shadowRoot) roots.push(element.shadowRoot);
      const running = roots
        .flatMap((root) => root.getAnimations())
        .filter((animation) => animation.playState === 'running' && animation.effect?.getTiming().iterations !== Infinity);
      if (!running.length) break;
      await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
    }
    await document.fonts.ready;
  });
}

/**
 * axe's verdict on the page: the results that fail, and the results it could not decide. The rules
 * are every rule axe-core tags for WCAG 2.0, 2.1 and 2.2 at levels A and AA, and Label in Name.
 */
async function audit(page) {
  await still(page);
  const builders = [
    new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']),
    new AxeBuilder({ page }).withRules([LABEL_IN_NAME]),
  ];
  const verdicts = [];
  // axe runs one analysis at a time in a page.
  for (const builder of builders) {
    for (const selector of EMBEDDED) builder.exclude(selector);
    verdicts.push(await builder.analyze());
  }
  // A builder that lost the rule would check nothing and fail nothing, so the scan must report it.
  const evaluated = ['passes', 'violations', 'incomplete', 'inapplicable'].flatMap((kind) => verdicts[1][kind]);
  expect(evaluated.some((result) => result.id === LABEL_IN_NAME), `${LABEL_IN_NAME} did not run`).toBe(true);
  const nodes = (kind) =>
    verdicts.flatMap((verdict) => verdict[kind].flatMap((result) => result.nodes.map((node) => ({ rule: result.id, node }))));
  return { violations: nodes('violations'), undecided: nodes('incomplete') };
}

/** Each state the gate scans. */
const states = {};

// Every registered surface, opened as the surface suite opens it and at each width it takes.
for (const { surface, width } of surfaceCases(registry, scenarios))
  states[`${surface.id} at ${width}px`] = async (page) => {
    await page.setViewportSize({ width, height: 1000 });
    await scenarios[surface.scenario](page);
  };

// The DOI form opened with each answer the bridge can give, and with the editor failing to load.
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

// Each action while the bridge has yet to answer, and after it has reported a DOI or an error. Every
// failure draws the same notice, so one stands for all of them. Each notice is scanned inside the
// window, where the page scrolls it, since axe decides the contrast of text out of view differently
// from one run to the next.
for (const action of Object.keys(ACTIONS)) {
  states[`${action} in progress`] = (page) => pending(page, action);
  for (const [outcome, answer] of Object.entries({ success: OUTCOMES.success, 'an error': OUTCOMES['500 with a message'] })) {
    states[`${action} answered with ${outcome}`] = (page) => answered(page, action, answer);
    states[`${action} answered with ${outcome} at 375px`] = async (page) => {
      await page.setViewportSize({ width: 375, height: 720 });
      await answered(page, action, answer);
    };
  }
}

/**
 * One control of each kind, found in the state that shows it. Each is scanned once with the pointer
 * resting on it and once focused from the keyboard, since both change how it is drawn.
 */
const controls = {
  'toolbar button': [scenarios['dashboard-page'], (page) => page.getByRole('button', { name: 'Home', exact: true })],
  'toolbar link': [scenarios['dashboard-page'], (page) => page.locator('mat-toolbar .header-title a')],
  'menu item': [scenarios['user-menu'], (page) => page.getByRole('menuitem', { name: 'CEDAR', exact: true })],
  'action button': [(page) => form(page), (page) => page.getByRole('button', { name: 'Create DOI', exact: true })],
  'dismiss button': [
    (page) => answered(page, 'Create DOI', OUTCOMES['500 with a message']),
    (page) => page.getByRole('button', { name: 'Dismiss notification', exact: true }),
  ],
  'notice link': [
    (page) => openWith(page, () => OPENINGS['a DOI already findable']),
    (page) => page.locator('.error-doi-container').getByRole('link', { name: doi, exact: true }),
  ],
};
for (const [kind, [open, find]] of Object.entries(controls)) {
  states[`hovered ${kind}`] = async (page) => {
    await open(page);
    const control = find(page);
    await control.hover();
    await expect.poll(() => control.evaluate((element) => element.matches(':hover'))).toBe(true);
  };
  states[`focused ${kind}`] = async (page) => {
    await open(page);
    const control = find(page);
    // A key press first, so focus is drawn as it is for someone using the keyboard.
    await page.keyboard.press(kind === 'menu item' ? 'ArrowDown' : 'Tab');
    await control.focus();
    await expect.poll(() => control.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  };
}

/** An axe target without the attributes Angular names after a build's components. */
const normalized = (node) => node.target.join(' ').replace(/\[_ng(content|host)-[^\]]*\]/g, '');
const element = (page, node) => page.locator('css=' + node.target.join(' ')).first();

/**
 * The lowest contrast between a text's colour and what is painted under the parts of it that show,
 * as WCAG computes it, or null when none of it shows. Two screenshots of the element, with its text
 * and with its text transparent, give where the glyphs are and the background at each. A pixel counts
 * as a glyph's only when the text changes it markedly, since an edge the glyph barely covers says
 * nothing its core does not. Glyphs something opaque covers are drawn in neither screenshot, so they
 * do not count. Workspace's gate measures the same way.
 */
async function textContrast(page, node) {
  const text = element(page, node);
  // Text out of view, as a notice drawn past the window's edge can be, is scrolled into view for the
  // measurement and put back afterwards.
  const scrolled = await text.evaluate((element) => {
    const box = element.getBoundingClientRect();
    if (box.left >= 0 && box.top >= 0 && box.right <= innerWidth && box.bottom <= innerHeight) return false;
    window.__contrastScroll = { x: scrollX, y: scrollY };
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    return true;
  });
  const box = await text.boundingBox();
  const clip = {
    x: Math.floor(box.x),
    y: Math.floor(box.y),
    width: Math.ceil(box.x + box.width) - Math.floor(box.x),
    height: Math.ceil(box.y + box.height) - Math.floor(box.y),
  };
  const shot = () => page.screenshot({ clip, animations: 'disabled', caret: 'hide', scale: 'css' });
  const color = await text.evaluate((element) => getComputedStyle(element).color);
  const shown = await shot();
  await text.evaluate((element) => {
    element.dataset.contrastProbe = element.style.cssText;
    element.style.setProperty('color', 'transparent', 'important');
    element.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
  });
  const hidden = await shot();
  await text.evaluate((element) => {
    element.style.cssText = element.dataset.contrastProbe;
    delete element.dataset.contrastProbe;
  });
  if (scrolled)
    await page.evaluate(() => {
      scrollTo(window.__contrastScroll.x, window.__contrastScroll.y);
      delete window.__contrastScroll;
    });
  return page.evaluate(async ({ shown, hidden, color }) => {
    const pixels = async (png) => {
      const image = new Image();
      image.src = 'data:image/png;base64,' + png;
      await image.decode();
      const context = new OffscreenCanvas(image.width, image.height).getContext('2d');
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height).data;
    };
    const canvas = new OffscreenCanvas(1, 1).getContext('2d');
    canvas.fillStyle = color;
    canvas.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data;
    const luminance = (channels) => channels
      .map((value) => value / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const [withText, without] = await Promise.all([pixels(shown), pixels(hidden)]);
    let lowest = Infinity;
    for (let i = 0; i < withText.length; i += 4) {
      if ([0, 1, 2].every((channel) => Math.abs(withText[i + channel] - without[i + channel]) < 32)) continue;
      const background = [without[i], without[i + 1], without[i + 2]];
      const foreground = [r, g, b].map((value, channel) => (value * a + background[channel] * (255 - a)) / 255);
      const [light, dark] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
      lowest = Math.min(lowest, (light + 0.05) / (dark + 0.05));
    }
    return lowest === Infinity ? null : Math.floor(lowest * 100) / 100;
  }, { shown: shown.toString('base64'), hidden: hidden.toString('base64'), color });
}

/**
 * The measure for each rule's undecided results. Each returns the value it finds and whether that
 * value passes. A rule without a measure has no undecided result this gate can settle.
 */
const measures = {
  'color-contrast': async (page, node) => {
    const ratio = await textContrast(page, node);
    if (ratio === null) return { value: 'covered', passes: true };
    // WCAG takes 3:1 for large text: 24px, or 18.66px at a bold weight.
    const required = parseFloat(node.any[0]?.data?.expectedContrastRatio) || await element(page, node).evaluate((text) => {
      const { fontSize, fontWeight } = getComputedStyle(text);
      return parseFloat(fontSize) >= (parseInt(fontWeight, 10) >= 700 ? 18.66 : 24) ? 3 : 4.5;
    });
    return { value: `${ratio.toFixed(2)}:1`, passes: ratio >= required };
  },
  // A target is measured by its size. One under 24 px would need its spacing measured instead.
  'target-size': async (page, node) => {
    const box = await element(page, node).boundingBox();
    return { value: `${Math.round(box.width)} × ${Math.round(box.height)} px`, passes: Math.min(box.width, box.height) >= 24 };
  },
  'aria-valid-attr-value': (page, node) =>
    element(page, node).evaluate((control) => {
      const targets = control.getAttribute('aria-controls').split(/\s+/).map((id) => [id, document.getElementById(id)]);
      return {
        value: targets.map(([id, target]) => (target ? `${target.getAttribute('role') ?? target.localName} #${id}` : `missing #${id}`)).join(', '),
        passes: targets.every(([, target]) => target),
      };
    }),
  // Criterion 2.5.3 concerns text a control shows as its label. A control that shows only symbols,
  // with no letter or digit, shows no such text.
  [LABEL_IN_NAME]: (page, node) =>
    element(page, node).evaluate((control) => {
      const shown = control.innerText.trim();
      return { value: `shows “${shown}”, named “${control.getAttribute('aria-label')}”`, passes: !/[\p{L}\p{N}]/u.test(shown) };
    }),
};

/** The states that show the open user menu. */
const menuStates = ['bridging.user-menu at 1440px', 'bridging.user-menu at 375px', 'hovered menu item', 'focused menu item'];
/** Text the open user menu draws on its own surface. */
const menuItem = (text, states, measured, tint = '') => ({
  rule: 'color-contrast',
  target: '.mat-mdc-menu-item-text > span',
  text,
  states,
  measured,
  reason: `axe reports the menu's ${text} item overlapped, and cannot tell what lies under it. Nothing lies over its text, which meets 4.5:1 against the menu${tint}.`,
});
/** The states that show a success or error notice, each with its dismiss button. */
const noticeStates = Object.keys(ACTIONS).flatMap((action) => ['success', 'an error'].flatMap((outcome) =>
  [`${action} answered with ${outcome}`, `${action} answered with ${outcome} at 375px`]));

/**
 * Results axe could not decide, each settled by a measurement this spec repeats. A state that leaves
 * a result undecided which no entry here names fails, and so does an entry a listed state no longer
 * produces, so the list says exactly what the gate has settled. Each entry gives a selector its
 * element matches, the text the element starts with, and the value measured.
 */
const SETTLED = [
  {
    rule: 'aria-valid-attr-value',
    target: 'button[aria-label="User"]',
    text: '',
    states: menuStates,
    measured: 'menu #mat-menu-panel-0',
    reason: "axe cannot tell whether a popup button's aria-controls names its popup. The User button names its open menu.",
  },
  menuItem('CEDAR', menuStates.filter((state) => !['hovered menu item', 'focused menu item'].includes(state)), '5.30:1'),
  menuItem('CEDAR', ['focused menu item'], '4.89:1', ' under the keyboard focus tint'),
  menuItem('CEDAR', ['hovered menu item'], '4.91:1', ' under the hover tint'),
  menuItem('Logout', menuStates, '5.30:1'),
  {
    rule: LABEL_IN_NAME,
    target: 'button.close',
    text: '×',
    states: [...noticeStates, 'hovered dismiss button', 'focused dismiss button'],
    measured: 'shows “×”, named “Dismiss notification”',
    reason: 'axe cannot tell whether a symbol is a label. The dismiss button shows the multiplication sign and no word, so its name has no shown text to contain.',
  },
];

/**
 * Failures only a visible change can fix. Each is kept here with the change it needs, so that the
 * gate passes until that change is made. An entry names the rule, a selector its element matches and
 * the states that produce it. An entry a listed state no longer produces fails, so a fix must remove
 * it.
 */
const EXCEPTIONS = [];

/** The entries of `list` that the result of `rule` at `node` matches. */
async function matching(page, rule, node, list) {
  const candidates = list.filter((entry) => entry.rule === rule);
  if (!candidates.length) return [];
  const matches = await element(page, node).evaluate(
    (found, entries) => entries.map(({ target, text }) =>
      found.matches(target) && (found.textContent ?? '').trim().startsWith(text ?? '')),
    candidates.map(({ target, text }) => ({ target, text })),
  );
  return candidates.filter((_, index) => matches[index]);
}

/**
 * Every finding of `state` that neither a measurement settles nor an exception records, and every
 * entry listed for the state that it no longer produces.
 */
async function unresolved(page, state, { violations, undecided }) {
  const settled = SETTLED.filter((entry) => entry.states.includes(state));
  const exceptions = EXCEPTIONS.filter((entry) => entry.states.includes(state));
  const produced = new Set();
  const failures = [];
  const label = async (rule, node) =>
    `${rule} ${normalized(node)} “${((await element(page, node).textContent()) ?? '').trim().slice(0, 40)}”`;
  const excepted = async (rule, node) => {
    const recorded = await matching(page, rule, node, exceptions);
    for (const entry of recorded) produced.add(entry);
    return recorded.length > 0;
  };
  for (const { rule, node } of violations)
    if (!(await excepted(rule, node))) failures.push(`${await label(rule, node)} fails: ${node.failureSummary}`);
  for (const { rule, node } of undecided) {
    const [entry] = await matching(page, rule, node, settled);
    if (entry) produced.add(entry);
    const measured = measures[rule] ? await measures[rule](page, node) : null;
    const least = entry?.measured.startsWith('at least ') && parseFloat(entry.measured.slice('at least '.length));
    if (!measured?.passes) {
      if (!(await excepted(rule, node)))
        failures.push(`${await label(rule, node)} is undecided and ${measured ? `measures ${measured.value}` : 'has no measure'}`);
    } else if (!entry) failures.push(`${await label(rule, node)} is undecided, measures ${measured.value} and is not settled`);
    else if (least ? parseFloat(measured.value) < least : measured.value !== entry.measured)
      failures.push(`${await label(rule, node)} measures ${measured.value}, not the settled ${entry.measured}`);
  }
  for (const entry of [...settled, ...exceptions])
    if (!produced.has(entry)) failures.push(`${entry.rule} ${entry.target} “${entry.text ?? ''}” is listed, and ${state} no longer produces it`);
  return failures;
}

for (const [name, state] of Object.entries(states))
  test(`accessible ${name}`, async ({ page }) => {
    await state(page);
    expect(await unresolved(page, name, await audit(page))).toEqual([]);
  });
