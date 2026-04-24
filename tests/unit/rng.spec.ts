import { describe, it, expect } from 'vitest';
import { mulberry32, hash2 } from '@core/math/rng';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces values in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('different seeds produce different sequences', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const va = Array.from({ length: 10 }, () => a());
    const vb = Array.from({ length: 10 }, () => b());
    expect(va).not.toEqual(vb);
  });
});

describe('hash2', () => {
  it('is stable for the same coords', () => {
    expect(hash2(3, 5)).toBe(hash2(3, 5));
    expect(hash2(-12, 7)).toBe(hash2(-12, 7));
  });

  it('typically differs for swapped coords', () => {
    expect(hash2(3, 5)).not.toBe(hash2(5, 3));
  });
});
