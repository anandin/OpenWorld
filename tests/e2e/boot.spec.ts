import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    __game?: {
      readonly framesRendered: number;
      readonly engine: {
        debug(): { fps: number; drawCalls: number; triangles: number };
      };
    };
  }
}

test('the page boots and renders frames with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(process.env['VITE_BASE'] ?? '/');

  // The canvas exists.
  const canvas = page.locator('#app canvas');
  await expect(canvas).toBeVisible({ timeout: 10_000 });

  // The game-state hook is exposed.
  await page.waitForFunction(() => typeof window.__game !== 'undefined', null, {
    timeout: 10_000,
  });

  // We render at least 5 frames within 5 seconds.
  await page.waitForFunction(
    () => (window.__game?.framesRendered ?? 0) >= 5,
    null,
    { timeout: 5_000 },
  );

  const debug = await page.evaluate(() => window.__game?.engine.debug());
  expect(debug, 'engine.debug() returned no value').toBeDefined();
  expect(debug!.drawCalls).toBeGreaterThan(0);
  expect(debug!.triangles).toBeGreaterThan(0);

  // Idle 2s, then assert clean console.
  await page.waitForTimeout(2_000);

  const filtered = errors.filter(
    (e) => !/WebGL|Lost|Extension/i.test(e), // ignore platform-driver chatter
  );
  expect(filtered, `console errors:\n${filtered.join('\n')}`).toEqual([]);
});
