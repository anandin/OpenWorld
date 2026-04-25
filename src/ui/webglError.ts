import type { WebGLProbe } from '@engine/webgl';

const FIX_HINTS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: 'Enable hardware acceleration',
    body:
      'Chrome/Edge: Settings → System → "Use hardware acceleration when available" → on, then restart the browser. ' +
      'Firefox: about:config → set webgl.disabled to false and gfx.webrender.all to true.',
  },
  {
    title: 'Update graphics drivers',
    body:
      'A very old or generic display driver can disable WebGL. Updating to your GPU vendor’s latest driver usually fixes it.',
  },
  {
    title: 'Open in a real browser',
    body:
      'In-app browsers inside TikTok, Instagram, X, Slack, etc. often disable WebGL. Tap the share menu and choose ' +
      '"Open in Safari" or "Open in Chrome".',
  },
  {
    title: 'Try a different device',
    body:
      'Some older phones, work laptops with locked-down policies, or remote-desktop sessions cannot run WebGL at all.',
  },
];

/**
 * Replace the boot screen with a friendly diagnostic. Used both when the
 * pre-render WebGL probe fails and when Three.js throws during construction.
 */
export function renderWebGLError(probe: WebGLProbe | { reason: string }): void {
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.classList.remove('hidden');
  boot.innerHTML = '';

  const heading = document.createElement('h1');
  heading.textContent = 'OPENWORLD';
  boot.appendChild(heading);

  const sub = document.createElement('p');
  sub.textContent = 'This browser cannot run WebGL.';
  sub.style.cssText = 'color:#e6edf3;font-size:14px;margin:6px 0 18px;';
  boot.appendChild(sub);

  const reasonNote = document.createElement('p');
  reasonNote.textContent = probe.reason ?? 'Unknown reason.';
  reasonNote.style.cssText = 'color:#8b95a7;font-size:11px;font-family:ui-monospace,Menlo,monospace;max-width:680px;text-align:center;';
  boot.appendChild(reasonNote);

  const list = document.createElement('div');
  list.style.cssText =
    'display:flex;flex-direction:column;gap:14px;max-width:680px;margin:18px 12px 0;';
  for (const hint of FIX_HINTS) {
    const card = document.createElement('div');
    card.style.cssText =
      'background:#111a2e;border:1px solid #1f2a44;border-radius:8px;padding:12px 14px;';
    const t = document.createElement('div');
    t.textContent = hint.title;
    t.style.cssText = 'color:#a8e063;font-size:12px;font-weight:600;letter-spacing:.06em;margin-bottom:4px;';
    const b = document.createElement('div');
    b.textContent = hint.body;
    b.style.cssText = 'color:#c2cad6;font-size:12px;line-height:1.55;';
    card.appendChild(t);
    card.appendChild(b);
    list.appendChild(card);
  }
  boot.appendChild(list);

  if ('vendor' in probe || 'renderer' in probe) {
    const detail = document.createElement('details');
    detail.style.cssText = 'margin-top:16px;color:#6e788c;font-size:11px;';
    const summary = document.createElement('summary');
    summary.textContent = 'technical detail';
    summary.style.cssText = 'cursor:pointer;';
    detail.appendChild(summary);
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(probe, null, 2);
    pre.style.cssText =
      'background:#0d1426;border:1px solid #1f2a44;border-radius:6px;padding:10px;margin-top:8px;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#9aa4b6;max-width:680px;overflow:auto;';
    detail.appendChild(pre);
    boot.appendChild(detail);
  }
}
