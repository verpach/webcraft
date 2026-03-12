export class PauseMenu {
  constructor(container) {
    this.container = container;
    this.isOpen = false;
    this._onResume = null;
    this._onSave = null;
    this._onQuit = null;
    this._onSettingsChange = null;

    this.settings = {
      renderDistance: 6,
      fov: 75,
      sensitivity: 0.002,
    };

    this._build();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = 'pause-menu';
    this.el.style.display = 'none';
    this.el.innerHTML = `
      <div class="pause-panel">
        <h2 class="mc-title">Paused</h2>

        <button id="btn-resume" class="mc-btn">Resume Game</button>

        <div class="settings-group">
          <label>Render Distance: <span id="rd-val">${this.settings.renderDistance}</span></label>
          <input type="range" id="rd-slider" min="2" max="12" value="${this.settings.renderDistance}" step="1">
        </div>

        <div class="settings-group">
          <label>FOV: <span id="fov-val">${this.settings.fov}</span>°</label>
          <input type="range" id="fov-slider" min="50" max="120" value="${this.settings.fov}" step="1">
        </div>

        <div class="settings-group">
          <label>Mouse Sensitivity: <span id="sens-val">${(this.settings.sensitivity * 1000).toFixed(1)}</span></label>
          <input type="range" id="sens-slider" min="0.5" max="5" value="${this.settings.sensitivity * 1000}" step="0.1">
        </div>

        <button id="btn-save" class="mc-btn">Save World</button>
        <button id="btn-quit" class="mc-btn mc-btn-danger">Quit to Title</button>
      </div>
    `;
    this.container.appendChild(this.el);

    this.el.querySelector('#btn-resume').addEventListener('click', () => {
      if (this._onResume) this._onResume();
    });

    this.el.querySelector('#btn-save').addEventListener('click', () => {
      if (this._onSave) this._onSave();
    });

    this.el.querySelector('#btn-quit').addEventListener('click', () => {
      if (this._onQuit) this._onQuit();
    });

    const rdSlider = this.el.querySelector('#rd-slider');
    const rdVal = this.el.querySelector('#rd-val');
    rdSlider.addEventListener('input', () => {
      this.settings.renderDistance = parseInt(rdSlider.value);
      rdVal.textContent = this.settings.renderDistance;
      if (this._onSettingsChange) this._onSettingsChange(this.settings);
    });

    const fovSlider = this.el.querySelector('#fov-slider');
    const fovVal = this.el.querySelector('#fov-val');
    fovSlider.addEventListener('input', () => {
      this.settings.fov = parseInt(fovSlider.value);
      fovVal.textContent = this.settings.fov;
      if (this._onSettingsChange) this._onSettingsChange(this.settings);
    });

    const sensSlider = this.el.querySelector('#sens-slider');
    const sensVal = this.el.querySelector('#sens-val');
    sensSlider.addEventListener('input', () => {
      this.settings.sensitivity = parseFloat(sensSlider.value) / 1000;
      sensVal.textContent = parseFloat(sensSlider.value).toFixed(1);
      if (this._onSettingsChange) this._onSettingsChange(this.settings);
    });
  }

  open() {
    this.isOpen = true;
    this.el.style.display = 'flex';
  }

  close() {
    this.isOpen = false;
    this.el.style.display = 'none';
  }

  onResume(fn) { this._onResume = fn; }
  onSave(fn) { this._onSave = fn; }
  onQuit(fn) { this._onQuit = fn; }
  onSettingsChange(fn) { this._onSettingsChange = fn; }
}
