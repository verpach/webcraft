export class MobileControls {
  constructor(container) {
    this.container = container;
    this.isActive = false;
    this._movement = { x: 0, y: 0 };
    this._look = { dx: 0, dy: 0 };
    this._buttons = { jump: false, place: false, break: false };

    this._joystickActive = false;
    this._joystickOrigin = { x: 0, y: 0 };
    this._joystickTouch = null;

    this._lookActive = false;
    this._lookLast = { x: 0, y: 0 };
    this._lookTouch = null;

    this._build();
    this._checkMobile();
  }

  _checkMobile() {
    const isMobile = /Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) this.show();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = 'mobile-controls';
    this.el.style.display = 'none';
    this.el.innerHTML = `
      <div id="joystick-zone" class="mobile-zone left-zone">
        <div id="joystick-base" class="joystick-base">
          <div id="joystick-knob" class="joystick-knob"></div>
        </div>
      </div>

      <div id="look-zone" class="mobile-zone right-zone"></div>

      <div id="mobile-btns">
        <button id="mob-jump" class="mob-btn">↑</button>
        <button id="mob-break" class="mob-btn mob-break">⛏</button>
        <button id="mob-place" class="mob-btn mob-place">□</button>
      </div>
    `;
    this.container.appendChild(this.el);

    this._joystickBase = this.el.querySelector('#joystick-base');
    this._joystickKnob = this.el.querySelector('#joystick-knob');
    this._lookZone = this.el.querySelector('#look-zone');

    this._bindJoystick();
    this._bindLook();
    this._bindButtons();
  }

  _bindJoystick() {
    const zone = this.el.querySelector('#joystick-zone');
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this._joystickTouch = touch.identifier;
      this._joystickOrigin = { x: touch.clientX, y: touch.clientY };
      this._joystickBase.style.left = touch.clientX - zone.getBoundingClientRect().left - 40 + 'px';
      this._joystickBase.style.top = touch.clientY - zone.getBoundingClientRect().top - 40 + 'px';
      this._joystickBase.style.display = 'block';
      this._joystickActive = true;
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this._joystickActive) return;
      for (const touch of e.changedTouches) {
        if (touch.identifier === this._joystickTouch) {
          const dx = touch.clientX - this._joystickOrigin.x;
          const dy = touch.clientY - this._joystickOrigin.y;
          const maxR = 40;
          const dist = Math.min(Math.sqrt(dx*dx+dy*dy), maxR);
          const angle = Math.atan2(dy, dx);
          const kx = Math.cos(angle) * dist;
          const ky = Math.sin(angle) * dist;
          this._joystickKnob.style.transform = `translate(${kx}px, ${ky}px)`;
          this._movement.x = kx / maxR;
          this._movement.y = ky / maxR;
        }
      }
    }, { passive: false });

    const endJoy = (e) => {
      this._joystickActive = false;
      this._movement = { x: 0, y: 0 };
      this._joystickKnob.style.transform = '';
    };
    zone.addEventListener('touchend', endJoy);
    zone.addEventListener('touchcancel', endJoy);
  }

  _bindLook() {
    this._lookZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this._lookTouch = touch.identifier;
      this._lookLast = { x: touch.clientX, y: touch.clientY };
      this._lookActive = true;
    }, { passive: false });

    this._lookZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === this._lookTouch) {
          this._look.dx += (touch.clientX - this._lookLast.x) * 1.5;
          this._look.dy += (touch.clientY - this._lookLast.y) * 1.5;
          this._lookLast = { x: touch.clientX, y: touch.clientY };
        }
      }
    }, { passive: false });

    const endLook = () => { this._lookActive = false; };
    this._lookZone.addEventListener('touchend', endLook);
    this._lookZone.addEventListener('touchcancel', endLook);
  }

  _bindButtons() {
    const jump = this.el.querySelector('#mob-jump');
    const brk = this.el.querySelector('#mob-break');
    const place = this.el.querySelector('#mob-place');

    const pressBtn = (btn, key) => {
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this._buttons[key] = true; }, { passive: false });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); this._buttons[key] = false; }, { passive: false });
    };
    pressBtn(jump, 'jump');
    pressBtn(brk, 'break');
    pressBtn(place, 'place');
  }

  getMovement() { return { ...this._movement }; }

  getLookDelta() {
    const d = { ...this._look };
    this._look = { dx: 0, dy: 0 };
    return d;
  }

  isJump() { return this._buttons.jump; }
  isBreak() { return this._buttons.break; }
  isPlace() { return this._buttons.place; }

  show() {
    this.isActive = true;
    this.el.style.display = 'block';
  }

  hide() {
    this.isActive = false;
    this.el.style.display = 'none';
  }
}
