import { chromium } from '@playwright/test';

const URL = process.env.URL ?? 'https://open-world-two.vercel.app/';

async function capture(args, label, outFile) {
  const browser = await chromium.launch({ args, ignoreHTTPSErrors: true });
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  await page.goto(URL, { waitUntil: 'load', timeout: 20_000 }).catch((e) => {
    errors.push(`[goto] ${e.message}`);
  });
  await page.waitForTimeout(4_000);

  const bootText = await page.locator('#boot p').textContent().catch(() => null);
  const hasCanvas = (await page.locator('#app canvas').count()) > 0;
  const framesRendered = await page
    .evaluate(() => window.__game?.framesRendered ?? 0)
    .catch(() => 0);
  const webglInfo = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    if (!gl) return null;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown';
    const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : 'unknown';
    return { vendor, renderer };
  });

  await page.screenshot({ path: outFile, fullPage: false });
  await browser.close();
  return { label, errors, bootText, hasCanvas, framesRendered, webglInfo };
}

const cases = [
  { args: [], label: 'default-headless', file: '/tmp/cap-default.png' },
  { args: ['--disable-webgl', '--disable-webgl2'], label: 'webgl-off', file: '/tmp/cap-webgl-off.png' },
  { args: ['--use-gl=swiftshader'], label: 'swiftshader', file: '/tmp/cap-swiftshader.png' },
];

for (const c of cases) {
  const r = await capture(c.args, c.label, c.file);
  console.log(`\n=== ${r.label} ===`);
  console.log(`  bootText: ${JSON.stringify(r.bootText)}`);
  console.log(`  hasCanvas: ${r.hasCanvas}`);
  console.log(`  frames: ${r.framesRendered}`);
  console.log(`  webgl: ${JSON.stringify(r.webglInfo)}`);
  console.log(`  errors (${r.errors.length}):`);
  for (const e of r.errors) console.log(`    - ${e}`);
}
