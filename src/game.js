import * as THREE from 'three';
import { Renderer } from './rendering/Renderer.js';
import { TextureManager } from './rendering/TextureManager.js';
import { SkyBox } from './rendering/SkyBox.js';
import { World } from './world/World.js';
import { TerrainGenerator } from './world/TerrainGenerator.js';
import { Player } from './player/Player.js';
import { Camera } from './player/Camera.js';
import { Controls } from './player/Controls.js';
import { HUD } from './ui/HUD.js';
import { Inventory } from './ui/Inventory.js';
import { CraftingUI } from './ui/CraftingUI.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { MobileControls } from './ui/MobileControls.js';
import { WorldStorage } from './storage/WorldStorage.js';
import { BLOCKS, BLOCK_DATA, getItemName } from './world/BlockTypes.js';
import { CHUNK_SIZE, AUTOSAVE_INTERVAL } from './utils/constants.js';
import { worldToChunk, generateSeed } from './utils/helpers.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.uiOverlay = document.getElementById('ui-overlay');
    this.running = false;
    this.paused = false;
    this._lastTime = 0;
    this._fps = 0;
    this._frameCount = 0;
    this._fpsTimer = 0;
    this._lastAutosave = 0;

    this.worldName = 'world';
    this.seed = '';

    this.renderer = null;
    this.world = null;
    this.player = null;
    this.camera = null;
    this.controls = null;
    this.skybox = null;
    this.hud = null;
    this.inventory = null;
    this.craftingUI = null;
    this.pauseMenu = null;
    this.mobileControls = null;
    this.storage = new WorldStorage();

    this._selectedHotbarSlot = 0;
    this._breakingBlock = null;
    this._breakProgress = 0;
    this._breakTimers = new Map();
  }

  async init() {
    this._showTitleScreen();
  }

  _showTitleScreen() {
    const titleEl = document.createElement('div');
    titleEl.id = 'title-screen';
    titleEl.innerHTML = `
      <div class="title-content">
        <h1 class="game-title">WebCraft</h1>
        <p class="game-subtitle">A Minecraft-inspired browser game</p>
        <div class="title-buttons">
          <button class="mc-btn" id="btn-new-world">New World</button>
          <button class="mc-btn" id="btn-load-world">Load World</button>
        </div>
      </div>
    `;
    document.body.appendChild(titleEl);

    titleEl.querySelector('#btn-new-world').addEventListener('click', () => {
      const name = prompt('Enter world name:', 'My World') || 'My World';
      const seed = generateSeed();
      titleEl.remove();
      this.start(name, seed);
    });

    titleEl.querySelector('#btn-load-world').addEventListener('click', async () => {
      const worlds = await this.storage.listWorlds();
      if (worlds.length === 0) {
        alert('No saved worlds found!');
        return;
      }
      const names = worlds.map(w => w.name).join('\n');
      const name = prompt(`Choose a world:\n${names}`, worlds[0].name);
      if (!name) return;
      const worldData = await this.storage.loadWorld(name);
      if (!worldData) { alert('World not found!'); return; }
      titleEl.remove();
      this.start(worldData.name, worldData.seed, worldData);
    });
  }

  async start(worldName, seed, savedData = null) {
    this.worldName = worldName;
    this.seed = seed;

    this._showLoadingScreen('Initializing...');

    // Setup rendering
    this.renderer = new Renderer(this.canvas);
    const scene = this.renderer.getScene();

    // Textures
    this.textureManager = new TextureManager();
    this.textureManager.build();

    // Terrain generator
    const generator = new TerrainGenerator(seed);

    // World
    this.world = new World(scene, this.textureManager, generator);

    // Camera & controls
    this.camera = new Camera(75);
    this.controls = new Controls(this.canvas);

    // Player
    this.player = new Player(this.world, this.camera, this.controls);

    // Restore position
    if (savedData && savedData.playerPos) {
      const p = savedData.playerPos;
      this.player.teleport(p.x, p.y, p.z);
    } else {
      // Find spawn
      const spawnX = 0, spawnZ = 0;
      const spawnY = generator.getHeight(spawnX, spawnZ) + 2;
      this.player.teleport(spawnX, spawnY, spawnZ);
    }

    // Skybox
    this.skybox = new SkyBox(this.renderer);

    // UI
    this.hud = new HUD(this.uiOverlay);
    this.inventory = new Inventory(this.uiOverlay);
    this.craftingUI = new CraftingUI(this.uiOverlay, this.inventory);
    this.pauseMenu = new PauseMenu(this.uiOverlay);
    this.mobileControls = new MobileControls(this.uiOverlay);

    // Restore inventory
    if (savedData && savedData.inventory) {
      this.inventory.setItems(savedData.inventory);
    } else {
      // Give starting items
      this.inventory.addItem(BLOCKS.OAK_LOG, 10);
      this.inventory.addItem(BLOCKS.COBBLESTONE, 20);
      this.inventory.addItem(BLOCKS.TORCH, 5);
    }

    // Setup pause menu
    this.pauseMenu.onResume(() => this.resume());
    this.pauseMenu.onSave(() => this.save());
    this.pauseMenu.onQuit(() => location.reload());
    this.pauseMenu.onSettingsChange((settings) => {
      this.camera.setFOV(settings.fov);
      this.player.sensitivity = settings.sensitivity;
    });

    this.inventory.onClose(() => {
      this.paused = false;
    });
    this.craftingUI.onClose(() => {
      this.paused = false;
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this._onKeyDown(e));
    document.addEventListener('wheel', (e) => this._onWheel(e));
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));

    // Preload chunks
    await this.world.preloadAroundPlayer(
      this.player.getPosition(),
      3,
      (p) => this._updateLoadingScreen(p)
    );

    this._hideLoadingScreen();
    this.running = true;

    // Pointer lock on click
    this.canvas.addEventListener('click', () => {
      if (!this.paused && !this.controls.isPointerLocked()) {
        this.controls.lockPointer();
      }
    });

    // Autosave
    setInterval(() => this.save(), AUTOSAVE_INTERVAL);

    // Resize
    window.addEventListener('resize', () => {
      this.camera.setAspect(window.innerWidth, window.innerHeight);
    });
    this.camera.setAspect(window.innerWidth, window.innerHeight);

    // Start loop
    requestAnimationFrame((t) => this._gameLoop(t));
  }

  _gameLoop(time) {
    if (!this.running) return;
    requestAnimationFrame((t) => this._gameLoop(t));

    const dt = Math.min((time - this._lastTime) / 1000, 0.05);
    this._lastTime = time;

    // FPS counter
    this._frameCount++;
    this._fpsTimer += dt;
    if (this._fpsTimer >= 1) {
      this._fps = this._frameCount;
      this._frameCount = 0;
      this._fpsTimer = 0;
    }

    if (!this.paused) {
      this.update(dt);
    }

    this.renderer.render(this.camera.getCamera());
  }

  update(dt) {
    // Player
    this.player.update(dt);
    const pos = this.player.getPosition();

    // World chunk loading
    this.world.update(pos);

    // Skybox
    this.skybox.update(dt);

    // Raycast for block interaction
    const eyePos = this.player.getEyePosition();
    const dir = this.camera.getDirection();
    const hit = this.world.raycast(eyePos, dir, 8);

    if (hit && hit.block) {
      const { x, y, z } = hit.block;
      this.renderer.showBlockHighlight(x, y, z);
      const blockId = this.world.getBlock(x, y, z);
      this.hud.setLookingAt(getItemName(blockId));

      // Breaking (hold LMB)
      this._handleBreaking(hit, dt);
    } else {
      this.renderer.hideBlockHighlight();
      this.hud.setLookingAt('');
      this._breakingBlock = null;
      this._breakProgress = 0;
    }

    // Hotbar update
    this.hud.setHotbar(this.inventory.getHotbar(), this._selectedHotbarSlot);
    this.craftingUI.setSelectedHotbar(this._selectedHotbarSlot);

    // Mobile controls
    if (this.mobileControls.isActive) {
      const mv = this.mobileControls.getMovement();
      const look = this.mobileControls.getLookDelta();
      if (look.dx !== 0 || look.dy !== 0) {
        this.camera.updateRotation(look.dx, look.dy, 0.005);
      }
    }

    // Debug info
    const { cx, cz } = worldToChunk(pos.x, pos.z);
    this.hud.updateDebug({
      fps: this._fps,
      x: pos.x, y: pos.y, z: pos.z,
      cx, cz,
      biome: this.world.generator ? this.world.generator.getBiome(pos.x, pos.z) : '',
      chunksLoaded: this.world.chunks.size,
      flying: this.player.flying,
    });
  }

  _handleBreaking(hit, dt) {
    const { x, y, z } = hit.block;
    const key = `${x},${y},${z}`;

    if (this.controls.isMouseButton(0)) {
      if (this._breakingBlock !== key) {
        this._breakingBlock = key;
        this._breakProgress = 0;
      }

      const blockId = this.world.getBlock(x, y, z);
      const data = BLOCK_DATA[blockId];
      if (!data || data.hardness < 0) return; // Unbreakable

      const breakTime = data.hardness === 0 ? 0.1 : data.hardness * 0.8;
      this._breakProgress += dt;

      if (this._breakProgress >= breakTime) {
        this.world.setBlock(x, y, z, BLOCKS.AIR);
        this.inventory.addItem(blockId, 1);
        this._breakingBlock = null;
        this._breakProgress = 0;
      }
    } else {
      this._breakingBlock = null;
      this._breakProgress = 0;
    }
  }

  _onKeyDown(e) {
    // Escape: pause/unpause
    if (e.code === 'Escape') {
      if (this.inventory.isOpen) { this.inventory.close(); this.paused = false; return; }
      if (this.craftingUI.isOpen) { this.craftingUI.close(); this.paused = false; return; }
      if (this.pauseMenu.isOpen) { this.resume(); return; }
      if (this.running) this.pause();
      return;
    }

    if (this.paused) return;

    // Inventory: E
    if (e.code === 'KeyE') {
      if (this.craftingUI.isOpen) { this.craftingUI.close(); this.paused = false; return; }
      if (this.inventory.isOpen) { this.inventory.close(); this.paused = false; return; }
      this.inventory.open();
      this.paused = true;
      return;
    }

    // F3: debug
    if (e.code === 'F3') { e.preventDefault(); this.hud.toggleDebug(); return; }

    // Hotbar 1-9
    if (e.code >= 'Digit1' && e.code <= 'Digit9') {
      this._selectedHotbarSlot = parseInt(e.code.replace('Digit', '')) - 1;
      this.hud.selectSlot(this._selectedHotbarSlot);
      return;
    }
  }

  _onWheel(e) {
    if (this.paused) return;
    if (e.deltaY > 0) {
      this._selectedHotbarSlot = (this._selectedHotbarSlot + 1) % 9;
    } else {
      this._selectedHotbarSlot = (this._selectedHotbarSlot + 8) % 9;
    }
    this.hud.selectSlot(this._selectedHotbarSlot);
  }

  _onMouseDown(e) {
    if (this.paused) return;
    if (!this.controls.isPointerLocked()) return;

    if (e.button === 2) {
      // Place block
      e.preventDefault();
      const eyePos = this.player.getEyePosition();
      const dir = this.camera.getDirection();
      const hit = this.world.raycast(eyePos, dir, 8);

      if (hit && hit.face && hit.position) {
        const placePos = hit.block.clone().add(hit.face);
        const hotbar = this.inventory.getHotbar();
        const item = hotbar[this._selectedHotbarSlot];
        if (item && item.count > 0 && item.id < 100) {
          const data = BLOCK_DATA[item.id];
          if (data && data.solid) {
            // Don't place inside player
            const pp = this.player.getPosition();
            const px = Math.floor(pp.x), py = Math.floor(pp.y), pz = Math.floor(pp.z);
            if (placePos.x === px && (placePos.y === py || placePos.y === py + 1) && placePos.z === pz) return;

            this.world.setBlock(placePos.x, placePos.y, placePos.z, item.id);
            item.count--;
            if (item.count <= 0) {
              const items = this.inventory.getItems();
              items[27 + this._selectedHotbarSlot] = null;
              this.inventory.setItems(items);
            }

            // Open crafting table
            if (item.id === BLOCKS.CRAFTING_TABLE) {
              // table placed, clicking it opens 3x3
            }
          }
        }
      }
    }

    // Middle click: pick block
    if (e.button === 1) {
      const eyePos = this.player.getEyePosition();
      const dir = this.camera.getDirection();
      const hit = this.world.raycast(eyePos, dir, 8);
      if (hit && hit.block) {
        const blockId = this.world.getBlock(hit.block.x, hit.block.y, hit.block.z);
        this.inventory.addItem(blockId, 1);
      }
    }
  }

  pause() {
    this.paused = true;
    this.pauseMenu.open();
  }

  resume() {
    this.paused = false;
    this.pauseMenu.close();
    if (!this.controls.isPointerLocked()) {
      this.controls.lockPointer();
    }
  }

  async save() {
    try {
      await this.storage.saveWorld(this.worldName, {
        seed: this.seed,
        playerPos: this.player.getPosition(),
        inventory: this.inventory.getItems(),
      });
      console.log('World saved!');
    } catch (e) {
      console.error('Save failed:', e);
    }
  }

  _showLoadingScreen(msg) {
    const el = document.createElement('div');
    el.id = 'loading-screen';
    el.innerHTML = `
      <div class="loading-content">
        <h2>WebCraft</h2>
        <p id="loading-msg">${msg}</p>
        <div class="progress-bar"><div id="progress-fill" style="width:0%"></div></div>
      </div>
    `;
    document.body.appendChild(el);
    this._loadingEl = el;
  }

  _updateLoadingScreen(progress) {
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = Math.round(progress * 100) + '%';
  }

  _hideLoadingScreen() {
    if (this._loadingEl) {
      this._loadingEl.remove();
      this._loadingEl = null;
    }
  }
}
