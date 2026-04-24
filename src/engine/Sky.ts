import * as THREE from 'three';

export interface SkyHandles {
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  apply(scene: THREE.Scene): void;
  dispose(): void;
}

const SUN_COLOR = 0xfff2cc;
const HEMI_SKY = 0x9bb8ff;
const HEMI_GROUND = 0x4a4030;
const FOG_NEAR = 0x9fbed0;
const FOG_FAR = 0x6f8aa3;

export function buildSky(): SkyHandles {
  const hemi = new THREE.HemisphereLight(HEMI_SKY, HEMI_GROUND, 0.55);

  const sun = new THREE.DirectionalLight(SUN_COLOR, 1.6);
  sun.position.set(220, 320, 160);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 800;
  sun.shadow.camera.left = -250;
  sun.shadow.camera.right = 250;
  sun.shadow.camera.top = 250;
  sun.shadow.camera.bottom = -250;
  sun.shadow.bias = -0.0005;

  const fog = new THREE.Fog(FOG_NEAR, 220, 1500);

  let attachedScene: THREE.Scene | null = null;

  return {
    sun,
    hemi,
    apply(scene) {
      attachedScene = scene;
      scene.background = new THREE.Color(FOG_FAR);
      scene.fog = fog;
      scene.add(hemi);
      scene.add(sun);
      scene.add(sun.target);
    },
    dispose() {
      hemi.dispose();
      sun.dispose();
      if (attachedScene) {
        attachedScene.remove(hemi);
        attachedScene.remove(sun);
        attachedScene.remove(sun.target);
        attachedScene.fog = null;
      }
    },
  };
}
