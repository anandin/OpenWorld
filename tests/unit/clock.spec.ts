import { describe, it, expect } from 'vitest';
import { Clock, FIXED_STEP_MS } from '@core/time/Clock';

describe('Clock', () => {
  it('first tick produces no delta', () => {
    const c = new Clock();
    const t = c.tick(1000);
    expect(t.frameMs).toBe(0);
    expect(t.fixedSteps).toBe(0);
  });

  it('accumulates fixed steps when frames are larger than the step', () => {
    const c = new Clock();
    c.tick(1000);
    const t = c.tick(1000 + FIXED_STEP_MS * 2.5);
    expect(t.fixedSteps).toBe(2);
    expect(t.alpha).toBeGreaterThan(0);
    expect(t.alpha).toBeLessThan(1);
  });

  it('caps substeps to avoid spiral of death', () => {
    const c = new Clock();
    c.tick(0);
    const t = c.tick(1000); // 1 full second of catch-up
    expect(t.fixedSteps).toBeLessThanOrEqual(5);
  });
});
