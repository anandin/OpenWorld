import { describe, it, expect } from 'vitest';
import { HeightField } from '@world/HeightField';

describe('HeightField', () => {
  it('returns identical values for the same (x,z,seed) across instances', () => {
    const a = new HeightField({ seed: 99 });
    const b = new HeightField({ seed: 99 });
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        const x = i * 37.3;
        const z = j * 41.7;
        expect(a.height(x, z)).toBeCloseTo(b.height(x, z), 10);
      }
    }
  });

  it('returns different values for different seeds at the same coord', () => {
    const a = new HeightField({ seed: 1 });
    const b = new HeightField({ seed: 2 });
    let differences = 0;
    for (let i = 0; i < 50; i++) {
      if (Math.abs(a.height(i * 5, i * 7) - b.height(i * 5, i * 7)) > 1e-6) differences++;
    }
    expect(differences).toBeGreaterThan(40);
  });

  it('falls off near the island radius', () => {
    const f = new HeightField({ seed: 5, islandRadius: 100, islandFalloff: 50 });
    // far outside falloff -> ~0
    expect(Math.abs(f.height(500, 500))).toBeLessThan(0.01);
    // inside radius -> non-zero in general
    let nonZero = 0;
    for (let i = -5; i <= 5; i++) {
      if (Math.abs(f.height(i * 5, i * 7)) > 0.5) nonZero++;
    }
    expect(nonZero).toBeGreaterThan(0);
  });

  it('respects amplitude bound', () => {
    const f = new HeightField({ seed: 11, amplitude: 50 });
    let max = 0;
    for (let x = -200; x <= 200; x += 10) {
      for (let z = -200; z <= 200; z += 10) {
        max = Math.max(max, Math.abs(f.height(x, z)));
      }
    }
    expect(max).toBeLessThanOrEqual(50 + 1e-6);
  });
});
