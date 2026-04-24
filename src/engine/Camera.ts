import * as THREE from 'three';
import type { Input } from './Input';

const FORWARD = new THREE.Vector3();
const RIGHT = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const TMP = new THREE.Vector3();

const BASE_SPEED = 12;
const SPRINT_MULT = 4;
const LOOK_SENS = 0.0022;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

export class FreeFlyCamera {
  readonly camera: THREE.PerspectiveCamera;
  private yaw = 0;
  private pitch = -0.25;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 4000);
    this.camera.position.set(0, 60, 80);
    this.applyRotation();
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update(dt: number, input: Input): void {
    if (input.isPointerLocked()) {
      const { dx, dy } = input.consumeMouseDelta();
      this.yaw -= dx * LOOK_SENS;
      this.pitch -= dy * LOOK_SENS;
      this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));
      this.applyRotation();
    } else {
      input.consumeMouseDelta();
    }

    const speed = (input.isDown('sprint') ? BASE_SPEED * SPRINT_MULT : BASE_SPEED) * dt;
    this.camera.getWorldDirection(FORWARD);
    RIGHT.crossVectors(FORWARD, UP).normalize();
    TMP.set(0, 0, 0);
    if (input.isDown('forward')) TMP.add(FORWARD);
    if (input.isDown('back')) TMP.sub(FORWARD);
    if (input.isDown('right')) TMP.add(RIGHT);
    if (input.isDown('left')) TMP.sub(RIGHT);
    if (input.isDown('up')) TMP.add(UP);
    if (input.isDown('down')) TMP.sub(UP);
    if (TMP.lengthSq() > 0) {
      TMP.normalize().multiplyScalar(speed);
      this.camera.position.add(TMP);
    }
  }

  private applyRotation(): void {
    const e = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(e);
  }
}
