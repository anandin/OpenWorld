export const FIXED_STEP_MS = 1000 / 60;
export const FIXED_STEP_S = FIXED_STEP_MS / 1000;
const MAX_FRAME_MS = 100;
const MAX_SUBSTEPS = 5;

export interface FrameTiming {
  readonly frameMs: number;
  readonly fixedSteps: number;
  readonly alpha: number;
}

export class Clock {
  private last = 0;
  private accumulator = 0;
  private started = false;

  start(now: number): void {
    this.last = now;
    this.accumulator = 0;
    this.started = true;
  }

  tick(now: number): FrameTiming {
    if (!this.started) {
      this.start(now);
      return { frameMs: 0, fixedSteps: 0, alpha: 0 };
    }
    const raw = now - this.last;
    this.last = now;
    const frameMs = Math.min(raw, MAX_FRAME_MS);
    this.accumulator += frameMs;
    let steps = 0;
    while (this.accumulator >= FIXED_STEP_MS && steps < MAX_SUBSTEPS) {
      this.accumulator -= FIXED_STEP_MS;
      steps++;
    }
    if (this.accumulator >= FIXED_STEP_MS) {
      // Spiral-of-death guard: drop the backlog, accept one frame of jitter.
      this.accumulator = 0;
    }
    const alpha = this.accumulator / FIXED_STEP_MS;
    return { frameMs, fixedSteps: steps, alpha };
  }
}
