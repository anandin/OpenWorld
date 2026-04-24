export type Action =
  | 'forward'
  | 'back'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'sprint'
  | 'pause';

const DEFAULT_BINDINGS: Record<string, Action> = {
  KeyW: 'forward',
  KeyS: 'back',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'up',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
  ControlLeft: 'down',
  ControlRight: 'down',
  Escape: 'pause',
};

export class Input {
  private state: Record<Action, boolean> = {
    forward: false,
    back: false,
    left: false,
    right: false,
    up: false,
    down: false,
    sprint: false,
    pause: false,
  };

  private mouseDx = 0;
  private mouseDy = 0;
  private locked = false;

  constructor(private readonly target: HTMLElement) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    target.addEventListener('click', this.onClick);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.target.removeEventListener('click', this.onClick);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  isDown(action: Action): boolean {
    return this.state[action];
  }

  consumeMouseDelta(): { dx: number; dy: number } {
    const out = { dx: this.mouseDx, dy: this.mouseDy };
    this.mouseDx = 0;
    this.mouseDy = 0;
    return out;
  }

  isPointerLocked(): boolean {
    return this.locked;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const action = DEFAULT_BINDINGS[e.code];
    if (action) {
      this.state[action] = true;
      if (action !== 'pause') e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const action = DEFAULT_BINDINGS[e.code];
    if (action) this.state[action] = false;
  };

  private onBlur = (): void => {
    for (const k of Object.keys(this.state) as Action[]) this.state[k] = false;
  };

  private onClick = (): void => {
    if (!this.locked && this.target.requestPointerLock) {
      this.target.requestPointerLock();
    }
  };

  private onPointerLockChange = (): void => {
    this.locked = document.pointerLockElement === this.target;
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.locked) return;
    this.mouseDx += e.movementX;
    this.mouseDy += e.movementY;
  };
}
