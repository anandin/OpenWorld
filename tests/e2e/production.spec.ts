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

const PROD_URL = process.env['PROD_URL'];

test.use({ ignoreHTTPSErrors: true });

test.skip(!PROD_URL, 'set PROD_URL=https://… to run');

test('production deploy: boots, canvas renders frames, no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(PROD_URL!, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#app canvas')).toBeVisible({ timeout: 15_000 });

  await page.waitForFunction(() => typeof window.__game !== 'undefined', null, {
    timeout: 15_000,
  });

  await page.waitForFunction(
    () => (window.__game?.framesRendered ?? 0) >= 30,
    null,
    { timeout: 10_000 },
  );

  const debug = await page.evaluate(() => window.__game?.engine.debug());
  expect(debug, 'engine.debug() returned no value').toBeDefined();
  expect(debug!.drawCalls).toBeGreaterThan(0);
  expect(debug!.triangles).toBeGreaterThan(0);

  await page.waitForTimeout(2_000);

  const filtered = errors.filter((e) => !/WebGL|Lost|Extension/i.test(e));
  expect(filtered, `console errors:\n${filtered.join('\n')}`).toEqual([]);

  console.info(`production smoke: fps=${debug!.fps.toFixed(1)} calls=${debug!.drawCalls} tris=${debug!.triangles}`);
});
