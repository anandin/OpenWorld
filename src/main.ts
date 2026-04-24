import * as THREE from 'three';
import { Engine } from '@engine/Engine';
import { HeightField, DEFAULT_HEIGHTFIELD } from '@world/HeightField';
import { buildTerrainMesh } from '@world/Terrain';
import { log } from '@core/logger';

declare global {
  interface Window {
    __game?: {
      readonly readyAt: number;
      readonly framesRendered: number;
      readonly engine: Engine;
    };
  }
}

function bootMessage(text: string): void {
  const p = document.querySelector('#boot p');
  if (p) p.textContent = text;
}

function hideBoot(): void {
  document.getElementById('boot')?.classList.add('hidden');
}

function buildOcean(): THREE.Mesh {
  const geom = new THREE.PlaneGeometry(2400, 2400);
  geom.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a4a6c,
    roughness: 0.3,
    metalness: 0.1,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = -0.5;
  mesh.name = 'ocean';
  mesh.receiveShadow = true;
  return mesh;
}

function main(): void {
  const app = document.getElementById('app');
  if (!app) throw new Error('missing #app host');

  bootMessage('initializing renderer…');
  const engine = new Engine(app);

  bootMessage('generating terrain…');
  const field = new HeightField();
  const terrain = buildTerrainMesh(field, { size: 1024, resolution: 257 });
  engine.scene.add(terrain.mesh);
  engine.scene.add(buildOcean());

  bootMessage('starting…');
  engine.start();

  const game = {
    readyAt: performance.now(),
    engine,
    get framesRendered() {
      return engine.frameCount;
    },
  };
  window.__game = game;

  requestAnimationFrame(() => requestAnimationFrame(hideBoot));
  log.info('game: ready', { seed: DEFAULT_HEIGHTFIELD.seed });
}

try {
  main();
} catch (err) {
  log.error('fatal:', err);
  bootMessage(`fatal: ${err instanceof Error ? err.message : String(err)}`);
}
