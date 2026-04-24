import * as THREE from 'three';
import type { HeightField } from './HeightField';

export interface TerrainOptions {
  /** Side length in meters. */
  readonly size: number;
  /** Vertices per side (must be >=2). 129 is a common LOD0 choice. */
  readonly resolution: number;
}

export interface TerrainMesh {
  readonly mesh: THREE.Mesh;
  dispose(): void;
}

export function buildTerrainMesh(field: HeightField, opts: TerrainOptions): TerrainMesh {
  const { size, resolution } = opts;
  if (resolution < 2) throw new Error('terrain resolution must be >= 2');

  const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(positions.count * 3);

  const grass = new THREE.Color(0x6b8a4a);
  const rock = new THREE.Color(0x6e6759);
  const sand = new THREE.Color(0xc8b173);
  const snow = new THREE.Color(0xe8edf2);

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const h = field.height(x, z);
    positions.setY(i, h);

    const c = colorForHeight(h, grass, rock, sand, snow);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  positions.needsUpdate = true;
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'terrain';
  mesh.castShadow = false;
  mesh.receiveShadow = true;

  return {
    mesh,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

function colorForHeight(
  h: number,
  grass: THREE.Color,
  rock: THREE.Color,
  sand: THREE.Color,
  snow: THREE.Color,
): THREE.Color {
  const out = new THREE.Color();
  if (h < 1) return out.copy(sand);
  if (h < 18) return out.copy(grass);
  if (h < 45) return out.copy(grass).lerp(rock, (h - 18) / 27);
  if (h < 65) return out.copy(rock).lerp(snow, (h - 45) / 20);
  return out.copy(snow);
}
