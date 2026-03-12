import { getItemName, getItemColor } from '../world/BlockTypes.js';

export class Inventory {
  constructor(container) {
    this.container = container;
    this.slots = new Array(36).fill(null); // 27 inventory + 9 hotbar
    this.hotbarSlots = this.slots.slice(27);
    this.isOpen = false;
    this.dragItem = null;
    this.dragFromSlot = -1;
    this._onClose = null;
    this._onChange = null;

    // Actual internal storage
    this._items = new Array(36).fill(null);

    this._build();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = 'inventory-overlay';
    this.el.style.display = 'none';
    this.el.innerHTML = `
      <div id="inventory-panel">
        <div class="inv-title">Inventory</div>
        <div id="inv-grid" class="inv-grid">
          ${Array.from({length:27},(_,i)=>`
            <div class="inv-slot" data-slot="${i}">
              <div class="slot-item"></div>
              <div class="slot-count"></div>
            </div>
          `).join('')}
        </div>
        <div class="inv-separator"></div>
        <div id="inv-hotbar" class="inv-grid">
          ${Array.from({length:9},(_,i)=>`
            <div class="inv-slot hotbar-inv-slot" data-slot="${i+27}">
              <div class="slot-item"></div>
              <div class="slot-count"></div>
            </div>
          `).join('')}
        </div>
      </div>
      <div id="drag-ghost" class="drag-ghost" style="display:none;position:fixed;pointer-events:none;z-index:9999"></div>
    `;

    this.container.appendChild(this.el);
    this._allSlotEls = this.el.querySelectorAll('.inv-slot');
    this._ghost = this.el.querySelector('#drag-ghost');

    this._bindEvents();
  }

  _bindEvents() {
    this._allSlotEls.forEach(slotEl => {
      slotEl.addEventListener('mousedown', (e) => this._onSlotMouseDown(e, slotEl));
      slotEl.addEventListener('contextmenu', (e) => { e.preventDefault(); this._onSlotRightClick(e, slotEl); });
    });

    document.addEventListener('mousemove', (e) => {
      if (this.dragItem) {
        this._ghost.style.left = e.clientX - 20 + 'px';
        this._ghost.style.top = e.clientY - 20 + 'px';
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (this.dragItem) {
        const target = e.target.closest('.inv-slot');
        if (target) {
          const toSlot = parseInt(target.dataset.slot);
          this._dropItem(toSlot);
        } else {
          // Drop outside - cancel
          this._cancelDrag();
        }
      }
    });
  }

  _onSlotMouseDown(e, slotEl) {
    if (e.button !== 0) return;
    e.preventDefault();
    const slot = parseInt(slotEl.dataset.slot);
    const item = this._items[slot];
    if (!item || item.count <= 0) return;

    this.dragItem = { ...item };
    this.dragFromSlot = slot;
    this._items[slot] = null;
    this._renderSlot(slot);

    this._ghost.style.background = getItemColor(this.dragItem.id);
    this._ghost.style.display = 'block';
    this._ghost.style.left = e.clientX - 20 + 'px';
    this._ghost.style.top = e.clientY - 20 + 'px';
    this._ghost.textContent = this.dragItem.count > 1 ? this.dragItem.count : '';
  }

  _onSlotRightClick(e, slotEl) {
    const slot = parseInt(slotEl.dataset.slot);
    const item = this._items[slot];
    if (item && item.count > 0) {
      item.count = Math.max(0, item.count - 1);
      if (item.count <= 0) this._items[slot] = null;
    }
    this._renderSlot(slot);
    if (this._onChange) this._onChange(this._items);
  }

  _dropItem(toSlot) {
    const existing = this._items[toSlot];
    if (existing && existing.id === this.dragItem.id) {
      existing.count += this.dragItem.count;
    } else {
      if (existing) {
        // Swap back to from slot
        this._items[this.dragFromSlot] = existing;
        this._renderSlot(this.dragFromSlot);
      }
      this._items[toSlot] = this.dragItem;
    }
    this._renderSlot(toSlot);
    this.dragItem = null;
    this.dragFromSlot = -1;
    this._ghost.style.display = 'none';
    if (this._onChange) this._onChange(this._items);
  }

  _cancelDrag() {
    if (this.dragFromSlot >= 0) {
      this._items[this.dragFromSlot] = this.dragItem;
      this._renderSlot(this.dragFromSlot);
    }
    this.dragItem = null;
    this.dragFromSlot = -1;
    this._ghost.style.display = 'none';
  }

  _renderSlot(i) {
    const slotEl = this._allSlotEls[i];
    if (!slotEl) return;
    const item = this._items[i];
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
  }

  render() {
    for (let i = 0; i < 36; i++) this._renderSlot(i);
  }

  open() {
    this.isOpen = true;
    this.el.style.display = 'flex';
    this.render();
  }

  close() {
    this.isOpen = false;
    this.el.style.display = 'none';
    if (this._onClose) this._onClose();
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  getItems() {
    return this._items;
  }

  setItems(items) {
    this._items = items.slice(0, 36);
    while (this._items.length < 36) this._items.push(null);
    if (this.isOpen) this.render();
  }

  addItem(id, count = 1) {
    // Try to stack
    for (let i = 0; i < 36; i++) {
      const it = this._items[i];
      if (it && it.id === id && it.count < 64) {
        const space = 64 - it.count;
        const add = Math.min(space, count);
        it.count += add;
        count -= add;
        this._renderSlot(i);
        if (count <= 0) { if (this._onChange) this._onChange(this._items); return true; }
      }
    }
    // Find empty slot
    for (let i = 0; i < 36; i++) {
      if (!this._items[i]) {
        this._items[i] = { id, count: Math.min(count, 64) };
        count -= Math.min(count, 64);
        this._renderSlot(i);
        if (count <= 0) { if (this._onChange) this._onChange(this._items); return true; }
      }
    }
    if (this._onChange) this._onChange(this._items);
    return count <= 0;
  }

  getHotbar() {
    return this._items.slice(27, 36);
  }

  onClose(fn) { this._onClose = fn; }
  onChange(fn) { this._onChange = fn; }
}
