import * as THREE from 'three';
import { Clock, FIXED_STEP_S } from '@core/time/Clock';
import { log } from '@core/logger';
import { Renderer } from './Renderer';
import { FreeFlyCamera } from './Camera';
import { Input } from './Input';
import { buildSky, type SkyHandles } from './Sky';

export interface EngineDebug {
  fps: number;
  drawCalls: number;
  triangles: number;
  cameraPos: { x: number; y: number; z: number };
}

export class Engine {
  readonly scene: THREE.Scene;
  readonly camera: FreeFlyCamera;
  readonly renderer: Renderer;
  readonly input: Input;
  readonly sky: SkyHandles;

  private readonly clock = new Clock();
  private rafId = 0;
  private running = false;
  private fpsAvg = 0;
  private frames = 0;
  private readonly hudEl: HTMLElement | null;
  private hudTimer = 0;

  get frameCount(): number {
    return this.frames;
  }

  constructor(host: HTMLElement) {
    const canvas = document.createElement('canvas');
    host.appendChild(canvas);

    this.renderer = new Renderer(canvas);
    this.scene = new THREE.Scene();
    this.camera = new FreeFlyCamera(host.clientWidth / Math.max(1, host.clientHeight));
    this.input = new Input(canvas);
    this.sky = buildSky();
    this.sky.apply(this.scene);

    this.hudEl = document.getElementById('hud');
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    log.info('engine: start');
    const loop = (now: number): void => {
      this.frame(now);
      if (this.running) this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.input.dispose();
    this.sky.dispose();
    this.renderer.dispose();
  }

  /** Read-only snapshot for debug overlay / e2e hooks. */
  debug(): EngineDebug {
    const info = this.renderer.renderer.info.render;
    const p = this.camera.camera.position;
    return {
      fps: this.fpsAvg,
      drawCalls: info.calls,
      triangles: info.triangles,
      cameraPos: { x: p.x, y: p.y, z: p.z },
    };
  }

  private frame(now: number): void {
    const t = this.clock.tick(now);
    if (t.frameMs > 0) {
      const inst = 1000 / t.frameMs;
      this.fpsAvg = this.fpsAvg === 0 ? inst : this.fpsAvg * 0.92 + inst * 0.08;
    }

    // Variable-rate camera (for now movement is per-frame; M1 will move it to fixed).
    this.camera.update(t.frameMs / 1000, this.input);

    // Run fixed-step systems (none yet beyond the clock advancing). Kept here
    // so adding physics/AI later is a one-liner.
    for (let i = 0; i < t.fixedSteps; i++) {
      this.fixedUpdate(FIXED_STEP_S);
    }

    this.renderer.render(this.scene, this.camera.camera);
    this.frames++;

    this.hudTimer += t.frameMs;
    if (this.hudTimer >= 250 && this.hudEl) {
      this.hudTimer = 0;
      const d = this.debug();
      this.hudEl.textContent =
        `fps ${d.fps.toFixed(0)}  calls ${d.drawCalls}  tris ${d.triangles}\n` +
        `pos ${d.cameraPos.x.toFixed(1)}, ${d.cameraPos.y.toFixed(1)}, ${d.cameraPos.z.toFixed(1)}`;
    }
  }

  private fixedUpdate(_dt: number): void {
    // Reserved for AI / physics / weapons in later milestones.
  }

  private onResize = (): void => {
    const host = this.renderer.renderer.domElement.parentElement;
    if (!host) return;
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    this.renderer.resize(w, h);
    this.camera.setAspect(w / Math.max(1, h));
  };
}
