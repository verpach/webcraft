import { getItemName, getItemColor, BLOCK_DATA, BLOCKS } from '../world/BlockTypes.js';

export class HUD {
  constructor(container) {
    this.container = container;
    this.selectedSlot = 0;
    this.hotbar = new Array(9).fill(null);
    this._debugMode = false;
    this._fps = 0;
    this._lookingAt = '';

    this._build();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = 'hud';
    this.el.innerHTML = `
      <div id="crosshair">+</div>

      <div id="health-bar" class="status-bar">
        <div class="bar-label">❤</div>
        <div id="hearts"></div>
      </div>

      <div id="hunger-bar" class="status-bar">
        <div class="bar-label">🍗</div>
        <div id="drumsticks"></div>
      </div>

      <div id="hotbar">
        ${Array.from({length:9},(_,i)=>`
          <div class="hotbar-slot ${i===0?'selected':''}" data-slot="${i}">
            <div class="slot-item"></div>
            <div class="slot-count"></div>
            <div class="slot-number">${i+1}</div>
          </div>
        `).join('')}
      </div>

      <div id="block-name"></div>
      <div id="debug-overlay" style="display:none"></div>
    `;
    this.container.appendChild(this.el);

    this._heartsEl = this.el.querySelector('#hearts');
    this._drumEl = this.el.querySelector('#drumsticks');
    this._hotbarSlots = this.el.querySelectorAll('.hotbar-slot');
    this._blockNameEl = this.el.querySelector('#block-name');
    this._debugEl = this.el.querySelector('#debug-overlay');

    this._renderHearts(20, 20);
    this._renderDrumsticks(20, 20);
  }

  _renderHearts(hp, maxHp) {
    this._heartsEl.innerHTML = '';
    for (let i = 0; i < maxHp / 2; i++) {
      const full = hp >= (i + 1) * 2;
      const half = !full && hp >= i * 2 + 1;
      const h = document.createElement('span');
      h.className = 'heart ' + (full ? 'full' : half ? 'half' : 'empty');
      h.textContent = full ? '❤' : half ? '❥' : '♡';
      this._heartsEl.appendChild(h);
    }
  }

  _renderDrumsticks(food, maxFood) {
    this._drumEl.innerHTML = '';
    for (let i = 0; i < maxFood / 2; i++) {
      const full = food >= (i + 1) * 2;
      const s = document.createElement('span');
      s.className = 'drumstick ' + (full ? 'full' : 'empty');
      s.textContent = full ? '🍗' : '🦴';
      this._drumEl.appendChild(s);
    }
  }

  setHealth(hp, maxHp) {
    this._renderHearts(hp, maxHp);
  }

  setHunger(food, maxFood) {
    this._renderDrumsticks(food, maxFood);
  }

  setHotbar(slots, selected) {
    this.hotbar = slots;
    this.selectedSlot = selected;
    this._renderHotbar();
  }

  _renderHotbar() {
    this._hotbarSlots.forEach((slotEl, i) => {
      slotEl.classList.toggle('selected', i === this.selectedSlot);
      const item = this.hotbar[i];
      const itemEl = slotEl.querySelector('.slot-item');
      const countEl = slotEl.querySelector('.slot-count');
      if (item && item.count > 0) {
        itemEl.style.background = getItemColor(item.id);
        itemEl.style.display = 'block';
        countEl.textContent = item.count > 1 ? item.count : '';
      } else {
        itemEl.style.display = 'none';
        countEl.textContent = '';
      }
    });
  }

  selectSlot(i) {
    this.selectedSlot = i;
    this._renderHotbar();
  }

  setLookingAt(blockName) {
    this._blockNameEl.textContent = blockName || '';
  }

  toggleDebug() {
    this._debugMode = !this._debugMode;
    this._debugEl.style.display = this._debugMode ? 'block' : 'none';
  }

  updateDebug(info) {
    if (!this._debugMode) return;
    this._debugEl.innerHTML = `
      <div>FPS: ${info.fps}</div>
      <div>XYZ: ${info.x.toFixed(1)} / ${info.y.toFixed(1)} / ${info.z.toFixed(1)}</div>
      <div>Chunk: ${info.cx}, ${info.cz}</div>
      <div>Biome: ${info.biome || '-'}</div>
      <div>Chunks loaded: ${info.chunksLoaded}</div>
      <div>Flying: ${info.flying}</div>
    `;
  }

  show() { this.el.style.display = 'block'; }
  hide() { this.el.style.display = 'none'; }
}
