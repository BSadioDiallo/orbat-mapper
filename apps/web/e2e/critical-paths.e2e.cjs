/**
 * End-to-end checks of the critical paths of the Angular app, run against a served build:
 *
 *   pnpm --filter @orbat-mapper/web build
 *   (serve apps/web/dist/web/browser with an SPA fallback on a port, then)
 *   node apps/web/e2e/critical-paths.e2e.cjs http://127.0.0.1:4301
 *
 * It uses the `playwright` package and the Chromium that come with the environment (it does not
 * install a browser). The base map is set to "No base map", so no tile server is needed.
 * Exit code 1 when a check fails.
 */
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://127.0.0.1:4301';
const results = [];

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
}

async function waitForEditor(page) {
  await page.waitForSelector('[data-testid=orbat-tree] [role=treeitem]', { timeout: 20000 });
}

async function goHome(page) {
  await page.click('[data-testid=main-menu]');
  await page.click('[role=menuitem]:has-text("Home")');
}

async function renameFirstUnit(page, name) {
  const first = page.locator('[role=treeitem]').first();
  await first.click();
  await page.waitForSelector('[data-testid=unit-details]');
  await page.click('[data-testid=edit-unit]');
  await page.fill('#unit-name-input', name);
  await page.click('[data-testid=unit-edit-form] button[type=submit]');
  await page.waitForTimeout(200);
  return (await first.textContent()).trim();
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(base + '/');
    await page.evaluate(() => localStorage.setItem('maplibreBaseLayerName', 'None'));
    await page.reload();

    // P-001, P-003: landing page and demo scenario.
    await page.waitForSelector('[data-testid=demo-narvik40]');
    check(
      'landing shows the three demos',
      (await page.locator('[data-testid^=demo-]').count()) === 3,
    );
    await page.click('[data-testid=demo-narvik40]');
    await waitForEditor(page);
    check(
      'demo opens with its name',
      (await page.textContent('[data-testid=scenario-name]')).includes('Narvik'),
    );

    // Time controls over the map.
    const t0 = (await page.textContent('[data-testid=scenario-time]')).trim();
    check('scenario time shown', t0.length > 0, t0);
    await page.click('[data-testid=inc-day]');
    await page.waitForTimeout(200);
    const t1 = (await page.textContent('[data-testid=scenario-time]')).trim();
    check('next day changes the time', t1 !== t0, `${t0} -> ${t1}`);
    await page.click('[data-testid=dec-day]');
    await page.waitForTimeout(200);
    // useScenarioTime().subtract(1, 'day', true) normalizes to noon, as in the Vue app.
    const t2 = (await page.textContent('[data-testid=scenario-time]')).trim();
    check('previous day goes back to noon of the first day', t2 === 'Apr 9, 1940, 12:00 PM', t2);

    // P-005, P-007, P-008: tree, selection, edit.
    const label = await renameFirstUnit(page, 'Renamed by e2e');
    check('edit updates the tree', label.endsWith('Renamed by e2e'), label);
    check(
      'edit updates the details',
      (await page.textContent('[data-testid=unit-name]')).trim() === 'Renamed by e2e',
    );
    check(
      'unsaved edit shows Save',
      (await page.locator('[data-testid=save-scenario]').count()) === 1,
    );

    // P-009: undo / redo, buttons and keyboard.
    await page.click('[data-testid=undo]');
    await page.waitForTimeout(200);
    const afterUndo = (await page.locator('[role=treeitem]').first().textContent()).trim();
    check('undo restores the name', !afterUndo.endsWith('Renamed by e2e'), afterUndo);
    await page.click('[data-testid=redo]');
    await page.waitForTimeout(200);
    check(
      'redo reapplies the name',
      (await page.locator('[role=treeitem]').first().textContent())
        .trim()
        .endsWith('Renamed by e2e'),
    );
    await page.locator('[data-testid=scenario-map]').click({ position: { x: 5, y: 5 } });
    await page.keyboard.down('Control');
    await page.keyboard.press('z');
    await page.keyboard.up('Control');
    await page.waitForTimeout(200);
    check(
      'Ctrl+Z undoes',
      !(await page.locator('[role=treeitem]').first().textContent())
        .trim()
        .endsWith('Renamed by e2e'),
    );
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(200);
    check(
      'Ctrl+Y redoes',
      (await page.locator('[role=treeitem]').first().textContent())
        .trim()
        .endsWith('Renamed by e2e'),
    );

    // P-006: units drawn on the map.
    check(
      'map canvas present',
      (await page.locator('[data-testid=scenario-map] canvas').count()) === 1,
    );

    // P-010, P-004: save, then reopen by URL.
    await page.click('[data-testid=save-scenario]');
    await page.waitForURL(/\/scenario\/(?!demo-)/);
    const savedUrl = page.url();
    check('save gives a stored scenario URL', /\/scenario\/[^/]+$/.test(savedUrl), savedUrl);
    check(
      'save shows the notification',
      (await page.locator('app-notifications').textContent()).includes('Scenario saved in browser'),
    );
    check(
      'save hides the Save button',
      (await page.locator('[data-testid=save-scenario]').count()) === 0,
    );
    await page.reload();
    await waitForEditor(page);
    check(
      'reload keeps the edit',
      (await page.locator('[role=treeitem]').first().textContent())
        .trim()
        .endsWith('Renamed by e2e'),
    );

    // Shell: scenario info, main menu.
    check(
      'scenario info shown on open',
      (await page.locator('[data-testid=scenario-info]').count()) === 1,
    );
    check(
      'scenario info counts units',
      Number(await page.textContent('[data-testid=scenario-unit-count]')) > 0,
    );
    await page.click('[data-testid=main-menu]');
    await page.click('[role=menuitem]:has-text("File")');
    await page.waitForSelector('[data-testid=file-menu]');
    check('File menu opens', true);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');

    // P-011: draft recovery after a reload with unsaved changes.
    await renameFirstUnit(page, 'Draft name');
    await page.waitForTimeout(2600); // draft debounce of io.ts is 2 s
    await page.goto(savedUrl);
    await waitForEditor(page);
    await page.waitForSelector('text=Recover draft', { timeout: 5000 });
    check('draft recovery is offered', true);
    await page.click('button:has-text("Restore draft")');
    await page.waitForTimeout(300);
    check(
      'restoring the draft brings the unsaved edit back',
      (await page.locator('[role=treeitem]').first().textContent()).trim().endsWith('Draft name'),
    );

    // P-012: leaving with unsaved changes asks first.
    await goHome(page);
    await page.waitForSelector('text=Unsaved changes', { timeout: 5000 });
    check('leave prompt appears', true);
    await page.click('[role=dialog] button:has-text("Cancel")');
    await page.waitForTimeout(200);
    check('cancel stays in the editor', page.url() === savedUrl, page.url());
    await goHome(page);
    await page.click('[role=dialog] button:has-text("Discard")');
    await page.waitForSelector('[data-testid=landing-scenarios]');
    check('discard leaves to the landing page', true);

    // P-002: the stored scenario is listed and opens.
    const listed = await page.locator('[data-testid=stored-scenario-link]').count();
    check('stored scenario listed on the landing page', listed >= 1, String(listed));
    await page.locator('[data-testid=stored-scenario-link]').first().click();
    await waitForEditor(page);
    check(
      'discarded draft is gone',
      (await page.locator('[role=treeitem]').first().textContent())
        .trim()
        .endsWith('Renamed by e2e'),
    );

    // P-013: new scenario.
    await page.goto(base + '/');
    await page.click('a:has-text("Create new")');
    await page.waitForSelector('[data-testid=new-scenario-form]');
    await page.fill('#name-input', 'E2E new scenario');
    await page.fill('#side-name-0', 'Blue');
    await page.click('[data-testid=create-scenario]');
    await waitForEditor(page);
    check(
      'new scenario opens in the editor',
      (await page.textContent('[data-testid=scenario-name]')).includes('E2E new scenario'),
    );
    const tree = await page.textContent('[data-testid=orbat-tree]');
    check(
      'new scenario has its sides and root units',
      tree.includes('Blue') && tree.includes('Side 2') && tree.includes('HQ'),
      tree.trim().slice(0, 80),
    );
    check(
      'new scenario starts with no undo',
      await page.locator('[data-testid=undo]').isDisabled(),
    );

    // Scenario events (Falklands demo has events).
    await page.goto(base + '/scenario/demo-falkland82');
    await waitForEditor(page);
    await page.click('[data-testid=tab-events]');
    await page.waitForSelector('[data-testid=scenario-event]');
    const eventCount = await page.locator('[data-testid=scenario-event]').count();
    check('events tab lists the scenario events', eventCount === 8, String(eventCount));
    const second = page.locator('[data-testid=scenario-event]').nth(1);
    const secondTitle = (
      await second.locator('[data-testid=scenario-event-title]').textContent()
    ).trim();
    const before = (await page.textContent('[data-testid=scenario-time]')).trim();
    await second.click();
    await page.waitForSelector('[data-testid=event-details]');
    check(
      'event details show the clicked event',
      (await page.textContent('[data-testid=event-title]')).trim() === secondTitle,
      secondTitle,
    );
    check(
      'clicking an event moves the clock',
      (await page.textContent('[data-testid=scenario-time]')).trim() !== before,
    );
    await page.click('[data-testid=next-event]');
    await page.waitForTimeout(300);
    const third = (
      await page
        .locator('[data-testid=scenario-event]')
        .nth(2)
        .locator('[data-testid=scenario-event-title]')
        .textContent()
    ).trim();
    check(
      'next event shows the following event',
      (await page.textContent('[data-testid=event-title]')).trim() === third,
      third,
    );
  } catch (error) {
    check('no unexpected failure', false, error.message.split('\n')[0]);
    await page.screenshot({ path: 'e2e-failure.png' });
  }
  check('no uncaught page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  for (const r of results)
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})();
