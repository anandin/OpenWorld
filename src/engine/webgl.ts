export interface WebGLProbe {
  readonly ok: boolean;
  /** Highest WebGL version we managed to create a context for. */
  readonly version: 0 | 1 | 2;
  readonly vendor: string | null;
  readonly renderer: string | null;
  /** Reason a context could not be created, if applicable. */
  readonly reason: string | null;
}

/**
 * Try to create a real WebGL context on a throwaway canvas. Cheaper than
 * letting Three.js throw, and lets us show a helpful diagnostic instead
 * of a fatal error string.
 */
export function probeWebGL(): WebGLProbe {
  if (typeof document === 'undefined') {
    return { ok: false, version: 0, vendor: null, renderer: null, reason: 'no document' };
  }
  const canvas = document.createElement('canvas');
  let reason: string | null = null;
  canvas.addEventListener(
    'webglcontextcreationerror',
    (e) => {
      reason = (e as WebGLContextEvent).statusMessage || reason;
    },
    { once: true },
  );

  const opts: WebGLContextAttributes = {
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'default',
  };

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let version: 0 | 1 | 2 = 0;
  try {
    gl = canvas.getContext('webgl2', opts) as WebGL2RenderingContext | null;
    if (gl) version = 2;
  } catch {
    /* fall through to webgl1 */
  }
  if (!gl) {
    try {
      gl = (canvas.getContext('webgl', opts) ??
        canvas.getContext('experimental-webgl', opts)) as WebGLRenderingContext | null;
      if (gl) version = 1;
    } catch {
      /* leave gl null */
    }
  }

  if (!gl) {
    return {
      ok: false,
      version: 0,
      vendor: null,
      renderer: null,
      reason: reason ?? 'WebGL context request returned null',
    };
  }

  let vendor: string | null = null;
  let renderer: string | null = null;
  try {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) as string;
      renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
    } else {
      vendor = gl.getParameter(gl.VENDOR) as string;
      renderer = gl.getParameter(gl.RENDERER) as string;
    }
  } catch {
    /* leave nullish */
  }

  // Release the test context so the engine's renderer can take its own.
  const lose = gl.getExtension('WEBGL_lose_context');
  lose?.loseContext();

  return { ok: true, version, vendor, renderer, reason: null };
}
