# WebCraft

A browser-based Minecraft-inspired voxel game built with Three.js and WebGL. Mine blocks, craft tools, and explore procedurally generated worlds — all in your browser, no installation required.

![WebCraft Screenshot](https://via.placeholder.com/800x450/1a3a6a/ffffff?text=WebCraft+Screenshot)

---

## Getting Started

```bash
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

---

## Controls

| Action | Key / Mouse |
|---|---|
| Move | `W` `A` `S` `D` |
| Jump | `Space` |
| Sprint | `Left Shift` |
| Sneak | `Left Ctrl` |
| Look | Mouse |
| Break block | Hold `Left Click` |
| Place block | `Right Click` |
| Pick block | `Middle Click` |
| Select hotbar | `1`–`9` or `Scroll Wheel` |
| Inventory | `E` |
| Pause / Menu | `Escape` |
| Toggle fly mode | `F` |
| Debug overlay | `F3` |

---

## Features

- 🌍 **Infinite procedural terrain** — plains, forests, and desert biomes generated with simplex noise
- ⛏ **Block breaking & placing** — hardness-based break times, 27+ block types
- 🎒 **Full inventory system** — 36 slots with drag & drop
- 🔨 **Crafting system** — 2×2 inventory crafting with recipes for tools, planks, torches, chests, and more
- 🌊 **Water rendering** — translucent water with buoyancy
- 🌲 **Structures** — oak and birch trees, flowers, tall grass
- ⚙️ **Ores** — coal, iron, gold, and diamond ore veins at appropriate depths
- 🕳 **Caves** — 3D noise cave generation underground
- 🌅 **Day / night cycle** — dynamic sky color, sun position, and ambient lighting
- 💾 **World persistence** — save & load worlds via IndexedDB (localforage)
- 📱 **Mobile / touch support** — virtual joystick and touch controls
- 🖥 **Debug overlay** — FPS, position, chunk info (`F3`)
- ⚡ **Greedy-ready mesher** — optimized per-face chunk mesh building

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org/) | ^0.160 | 3D rendering (WebGL) |
| [simplex-noise](https://github.com/jwagner/simplex-noise) | ^4.0 | Terrain & cave generation |
| [localforage](https://localforage.github.io/localForage/) | ^1.10 | IndexedDB world persistence |
| [Vite](https://vitejs.dev/) | ^5.0 | Build tool & dev server |

---

## Project Structure

```
src/
├── main.js               # Entry point
├── game.js               # Main game loop & orchestration
├── world/
│   ├── World.js          # Chunk management & raycasting
│   ├── Chunk.js          # Block data + mesh lifecycle
│   ├── ChunkMesher.js    # Per-face mesh builder
│   ├── TerrainGenerator.js # Simplex noise terrain
│   └── BlockTypes.js     # Block/item definitions & atlas layout
├── player/
│   ├── Player.js         # Movement, physics integration
│   ├── Controls.js       # Keyboard, mouse, pointer lock
│   └── Camera.js         # Perspective camera + yaw/pitch
├── physics/
│   └── Physics.js        # AABB collision resolution
├── rendering/
│   ├── Renderer.js       # Three.js scene, lights, fog
│   ├── TextureManager.js # Programmatic canvas texture atlas
│   └── SkyBox.js         # Day/night sky & lighting cycle
├── crafting/
│   └── CraftingSystem.js # Pattern-matching recipe system
├── storage/
│   └── WorldStorage.js   # localforage save/load
├── ui/
│   ├── HUD.js            # Crosshair, hotbar, health, hunger
│   ├── Inventory.js      # Full 36-slot drag & drop inventory
│   ├── CraftingUI.js     # 2×2 / 3×3 crafting interface
│   ├── PauseMenu.js      # Settings sliders, save, quit
│   └── MobileControls.js # Virtual joystick & touch buttons
└── utils/
    ├── constants.js      # Game constants
    └── helpers.js        # Math utilities, chunk coords
```

---

## License

MIT © 2024 WebCraft Contributors
