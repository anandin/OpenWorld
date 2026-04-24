import { createNoise2D } from 'simplex-noise';
import { mulberry32 } from '@core/math/rng';

export interface HeightFieldOptions {
  readonly seed: number;
  readonly amplitude: number;     // peak height in meters
  readonly baseFrequency: number; // 1/meters for the largest octave
  readonly octaves: number;
  readonly persistence: number;   // amplitude falloff per octave
  readonly lacunarity: number;    // frequency growth per octave
  readonly islandRadius: number;  // meters before island falloff begins
  readonly islandFalloff: number; // meters over which the falloff happens
}

export const DEFAULT_HEIGHTFIELD: HeightFieldOptions = {
  seed: 1337,
  amplitude: 80,
  baseFrequency: 1 / 480,
  octaves: 5,
  persistence: 0.5,
  lacunarity: 2.05,
  islandRadius: 380,
  islandFalloff: 220,
};

/**
 * Deterministic, pure heightmap. Same (x,z,seed) always returns the same height.
 * Cheap enough to call per-vertex on the main thread for a single chunk; will
 * move into a worker once we stream chunks (M1).
 */
export class HeightField {
  private readonly noise: (x: number, y: number) => number;
  private readonly opts: HeightFieldOptions;

  constructor(opts: Partial<HeightFieldOptions> = {}) {
    this.opts = { ...DEFAULT_HEIGHTFIELD, ...opts };
    this.noise = createNoise2D(mulberry32(this.opts.seed));
  }

  height(x: number, z: number): number {
    const { amplitude, baseFrequency, octaves, persistence, lacunarity } = this.opts;
    let amp = 1;
    let freq = baseFrequency;
    let sum = 0;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += this.noise(x * freq, z * freq) * amp;
      norm += amp;
      amp *= persistence;
      freq *= lacunarity;
    }
    const base = (sum / norm) * amplitude;
    return base * this.islandMask(x, z);
  }

  /**
   * Smooth radial falloff so the terrain forms a bounded island instead of
   * stretching to infinity. Returns 1 at center, ~0 past islandRadius+falloff.
   */
  private islandMask(x: number, z: number): number {
    const { islandRadius, islandFalloff } = this.opts;
    const r = Math.sqrt(x * x + z * z);
    if (r <= islandRadius) return 1;
    const t = Math.min(1, (r - islandRadius) / islandFalloff);
    // smoothstep-style ease-out
    return 1 - t * t * (3 - 2 * t);
  }
}
