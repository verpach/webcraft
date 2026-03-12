import { getItemName, getItemColor } from '../world/BlockTypes.js';
import { CraftingSystem } from '../crafting/CraftingSystem.js';

export class CraftingUI {
  constructor(container, inventory) {
    this.container = container;
    this.inventory = inventory;
    this.crafting = new CraftingSystem();
    this.isOpen = false;
    this.gridSize = 2; // 2 for 2x2, 3 for 3x3
    this.grid = new Array(4).fill(null); // 2x2 default
    this.result = null;
    this._onClose = null;

    this._build();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = 'crafting-overlay';
    this.el.style.display = 'none';
    this.el.innerHTML = `
      <div id="crafting-panel">
        <div class="crafting-title">Crafting</div>
        <div class="crafting-main">
          <div id="crafting-grid" class="crafting-grid grid-2x2"></div>
          <div class="crafting-arrow">➜</div>
          <div id="crafting-result" class="crafting-slot result-slot">
            <div class="slot-item"></div>
            <div class="slot-count"></div>
          </div>
        </div>
        <button id="crafting-close" class="mc-btn">Close</button>
      </div>
    `;
    this.container.appendChild(this.el);

    this._gridEl = this.el.querySelector('#crafting-grid');
    this._resultEl = this.el.querySelector('#crafting-result');

    this._rebuildGrid();

    this._resultEl.addEventListener('click', () => this._craft());
    this.el.querySelector('#crafting-close').addEventListener('click', () => this.close());
  }

  _rebuildGrid() {
    this._gridEl.innerHTML = '';
    this._gridEl.className = `crafting-grid grid-${this.gridSize}x${this.gridSize}`;
    this.grid = new Array(this.gridSize * this.gridSize).fill(null);

    for (let i = 0; i < this.grid.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'crafting-slot';
      slot.dataset.index = i;
      slot.innerHTML = `<div class="slot-item"></div><div class="slot-count"></div>`;

      slot.addEventListener('click', (e) => {
        // Get item from hotbar/inventory to place
        const hotbar = this.inventory.getHotbar();
        const selected = this._selectedHotbar || 0;
        const item = hotbar[selected];
        if (item && item.count > 0) {
          const existing = this.grid[i];
          if (existing && existing.id === item.id) {
            existing.count++;
          } else {
            this.grid[i] = { id: item.id, count: 1 };
          }
          this._renderGrid();
          this._updateResult();
        }
      });

      slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.grid[i] = null;
        this._renderGrid();
        this._updateResult();
      });

      this._gridEl.appendChild(slot);
    }
  }

  _renderGrid() {
    const slots = this._gridEl.querySelectorAll('.crafting-slot');
    slots.forEach((slotEl, i) => {
      const item = this.grid[i];
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

  _updateResult() {
    this.result = this.crafting.craft(this.grid, this.gridSize);
    const itemEl = this._resultEl.querySelector('.slot-item');
    const countEl = this._resultEl.querySelector('.slot-count');
    if (this.result) {
      itemEl.style.background = getItemColor(this.result.id);
      itemEl.style.display = 'block';
      countEl.textContent = this.result.count > 1 ? this.result.count : '';
    } else {
      itemEl.style.display = 'none';
      countEl.textContent = '';
    }
  }

  _craft() {
    if (!this.result) return;
    this.inventory.addItem(this.result.id, this.result.count);
    this.crafting.consumeIngredients(this.grid, this.gridSize);
    this._renderGrid();
    this._updateResult();
  }

  open(gridSize = 2) {
    this.isOpen = true;
    this.gridSize = gridSize;
    this._rebuildGrid();
    this.el.style.display = 'flex';
  }

  close() {
    this.isOpen = false;
    this.el.style.display = 'none';
    if (this._onClose) this._onClose();
  }

  setSelectedHotbar(i) {
    this._selectedHotbar = i;
  }

  onClose(fn) { this._onClose = fn; }
}
