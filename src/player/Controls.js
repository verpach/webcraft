export class Controls {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseButtons = new Set();
    this._mouseDx = 0;
    this._mouseDy = 0;
    this._pointerLocked = false;

    this._onKeyDown = (e) => {
      this.keys.add(e.code);
      this.keys.add(e.key.toLowerCase());
    };
    this._onKeyUp = (e) => {
      this.keys.delete(e.code);
      this.keys.delete(e.key.toLowerCase());
    };
    this._onMouseDown = (e) => {
      this.mouseButtons.add(e.button);
    };
    this._onMouseUp = (e) => {
      this.mouseButtons.delete(e.button);
    };
    this._onMouseMove = (e) => {
      if (!this._pointerLocked) return;
      this._mouseDx += e.movementX;
      this._mouseDy += e.movementY;
    };
    this._onPointerLockChange = () => {
      this._pointerLocked = document.pointerLockElement === canvas;
    };

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
  }

  isKey(code) {
    return this.keys.has(code);
  }

  isMouseButton(btn) {
    return this.mouseButtons.has(btn);
  }

  consumeMouseButton(btn) {
    const had = this.mouseButtons.has(btn);
    this.mouseButtons.delete(btn);
    return had;
  }

  getMouseDelta() {
    const dx = this._mouseDx;
    const dy = this._mouseDy;
    this._mouseDx = 0;
    this._mouseDy = 0;
    return { dx, dy };
  }

  lockPointer() {
    this.canvas.requestPointerLock();
  }

  isPointerLocked() {
    return this._pointerLocked;
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
  }
}
