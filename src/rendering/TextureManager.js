import * as THREE from 'three';
import { BLOCKS, BLOCK_DATA } from '../world/BlockTypes.js';
import { TEXTURE_SIZE, ATLAS_SIZE } from '../utils/constants.js';

export class TextureManager {
  constructor() {
    this.tileSize = TEXTURE_SIZE;
    this.atlasSize = ATLAS_SIZE;
    this.canvasSize = this.tileSize * this.atlasSize; // 256x256
    this.canvas = null;
    this.ctx = null;
    this.texture = null;
  }

  build() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;
    this.ctx = this.canvas.getContext('2d');

    this._drawAllTextures();

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    return this.texture;
  }

  _drawAllTextures() {
    const c = this.ctx;
    const T = this.tileSize;

    const fill = (col, row, color, fn) => {
      const x = col * T;
      const y = row * T;
      c.fillStyle = color;
      c.fillRect(x, y, T, T);
      if (fn) fn(x, y);
    };

    const noise = (x, y, col, row, amount = 15) => {
      const px = x + col * T;
      const py = y + row * T;
      for (let j = 0; j < T; j++) {
        for (let i = 0; i < T; i++) {
          const v = (Math.random() * 2 - 1) * amount;
          const id = c.getImageData(px + i, py + j, 1, 1).data;
          c.fillStyle = `rgb(${clampC(id[0] + v)},${clampC(id[1] + v)},${clampC(id[2] + v)})`;
          c.fillRect(px + i, py + j, 1, 1);
        }
      }
    };

    const clampC = v => Math.max(0, Math.min(255, Math.round(v)));

    // Row 0: stone, dirt, grass_top, grass_side, sand, gravel, oak_log_top, oak_log_side, birch_log_top, birch_log_side, oak_leaves, birch_leaves
    // col 0: AIR (transparent)
    fill(0, 0, 'rgba(0,0,0,0)');

    // col 1: STONE
    fill(1, 0, '#808080', (x, y) => {
      for (let i = 0; i < 20; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillStyle = '#606060';
        c.fillRect(sx, sy, 2, 2);
      }
    });

    // col 2: DIRT
    fill(2, 0, '#7a4f2b', (x, y) => {
      noise(0, 0, 2, 0, 12);
    });

    // col 3: GRASS TOP
    fill(3, 0, '#3a9e3a', (x, y) => {
      noise(0, 0, 3, 0, 20);
    });

    // col 4: GRASS SIDE
    fill(4, 0, '#7a4f2b', (x, y) => {
      c.fillStyle = '#3a9e3a';
      c.fillRect(x, y, T, 3);
      noise(0, 0, 4, 0, 8);
    });

    // col 5: SAND
    fill(5, 0, '#c8b46e', (x, y) => {
      noise(0, 0, 5, 0, 10);
    });

    // col 6: GRAVEL
    fill(6, 0, '#888878', (x, y) => {
      for (let i = 0; i < 16; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillStyle = Math.random() > 0.5 ? '#606058' : '#a0a090';
        c.fillRect(sx, sy, 3, 3);
      }
    });

    // col 7: OAK LOG TOP
    fill(7, 0, '#8b6914', (x, y) => {
      c.fillStyle = '#6b4c0e';
      c.beginPath();
      c.arc(x + T / 2, y + T / 2, T / 2 - 1, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(x + T / 2, y + T / 2, T / 4, 0, Math.PI * 2);
      c.stroke();
    });

    // col 8: OAK LOG SIDE
    fill(8, 0, '#6b4c1e', (x, y) => {
      c.fillStyle = '#4e3410';
      for (let i = 0; i < T; i += 4) {
        c.fillRect(x + i, y, 1, T);
      }
    });

    // col 9: OAK LEAVES
    fill(9, 0, 'rgba(30,90,20,0.9)', (x, y) => {
      for (let j = 0; j < T; j++) {
        for (let i = 0; i < T; i++) {
          if (Math.random() < 0.08) {
            c.clearRect(x + i, y + j, 1, 1);
          } else if (Math.random() < 0.15) {
            c.fillStyle = '#4ab020';
            c.fillRect(x + i, y + j, 1, 1);
          }
        }
      }
    });

    // col 10: BIRCH LOG TOP
    fill(10, 0, '#d4c8a0', (x, y) => {
      c.fillStyle = '#a09070';
      c.beginPath();
      c.arc(x + T / 2, y + T / 2, T / 2 - 1, 0, Math.PI * 2);
      c.stroke();
    });

    // col 11: BIRCH LOG SIDE
    fill(11, 0, '#c0b090', (x, y) => {
      c.fillStyle = '#807060';
      for (let j = 2; j < T; j += 5) {
        c.fillRect(x + 2, y + j, T - 4, 1);
      }
    });

    // col 12: BIRCH LEAVES
    fill(12, 0, 'rgba(60,110,30,0.9)', (x, y) => {
      for (let j = 0; j < T; j++) {
        for (let i = 0; i < T; i++) {
          if (Math.random() < 0.07) c.clearRect(x + i, y + j, 1, 1);
        }
      }
    });

    // Row 1 starts at col 0
    // col 0,1: OAK PLANKS
    fill(0, 1, '#c8a45a', (x, y) => {
      c.fillStyle = '#a07840';
      c.fillRect(x, y + T / 2, T, 1);
      c.fillRect(x, y, T, 1);
    });

    // col 1,1: COBBLESTONE
    fill(1, 1, '#6e6e6e', (x, y) => {
      c.fillStyle = '#3a3a3a';
      const patches = [[1,1,5,4],[7,0,4,5],[2,6,6,4],[8,6,4,4],[0,10,5,5],[6,11,4,4],[11,1,4,6],[12,8,4,5]];
      for (const [px,py,pw,ph] of patches) {
        c.fillRect(x+px, y+py, pw, ph);
      }
    });

    // col 2,1: BRICKS
    fill(2, 1, '#9e4a2e', (x, y) => {
      c.fillStyle = '#ccaa99';
      c.fillRect(x, y + 4, T, 1);
      c.fillRect(x, y + 9, T, 1);
      c.fillRect(x, y + 14, T, 1);
      c.fillRect(x + 8, y, 1, 4);
      c.fillRect(x, y + 5, 1, 4);
      c.fillRect(x + 8, y + 5, 1, 4);
      c.fillRect(x, y + 10, 1, 4);
      c.fillRect(x + 8, y + 10, 1, 4);
    });

    // col 3,1: WATER
    const waterCtx = c;
    fill(3, 1, 'rgba(34,85,170,0.82)', (x, y) => {
      waterCtx.fillStyle = 'rgba(60,110,220,0.3)';
      for (let i = 0; i < 5; i++) {
        const wx = x + Math.floor(Math.random() * T);
        const wy = y + Math.floor(Math.random() * T);
        waterCtx.fillRect(wx, wy, 4, 2);
      }
    });

    // col 4,1: GLASS
    fill(4, 1, 'rgba(180,220,255,0.15)', (x, y) => {
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 1;
      c.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1);
    });

    // col 5,1: COAL ORE
    fill(5, 1, '#808080', (x, y) => {
      for (let i = 0; i < 20; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillStyle = '#606060';
        c.fillRect(sx, sy, 2, 2);
      }
      c.fillStyle = '#111111';
      const dots = [[3,3],[5,7],[9,4],[11,10],[4,12],[8,2],[13,8],[2,10]];
      for (const [dx,dy] of dots) {
        c.fillRect(x+dx, y+dy, 2, 2);
      }
    });

    // col 6,1: IRON ORE
    fill(6, 1, '#808080', (x, y) => {
      for (let i = 0; i < 20; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillStyle = '#606060';
        c.fillRect(sx, sy, 2, 2);
      }
      c.fillStyle = '#c07858';
      const dots = [[3,3],[5,7],[9,4],[11,10],[4,12],[8,2],[13,8],[2,10]];
      for (const [dx,dy] of dots) c.fillRect(x+dx, y+dy, 2, 2);
    });

    // col 7,1: GOLD ORE
    fill(7, 1, '#808080', (x, y) => {
      for (let i = 0; i < 20; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillStyle = '#606060';
        c.fillRect(sx, sy, 2, 2);
      }
      c.fillStyle = '#e8d030';
      const dots = [[3,3],[5,7],[9,4],[11,10],[4,12],[8,2],[13,8],[2,10]];
      for (const [dx,dy] of dots) c.fillRect(x+dx, y+dy, 2, 2);
    });

    // col 8,1: DIAMOND ORE
    fill(8, 1, '#808080', (x, y) => {
      for (let i = 0; i < 20; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillStyle = '#606060';
        c.fillRect(sx, sy, 2, 2);
      }
      c.fillStyle = '#30e8e8';
      const dots = [[3,3],[5,7],[9,4],[11,10],[4,12],[8,2],[13,8],[2,10]];
      for (const [dx,dy] of dots) c.fillRect(x+dx, y+dy, 2, 2);
    });

    // col 9,1: CRAFTING TABLE TOP
    fill(9, 1, '#c8a45a', (x, y) => {
      c.fillStyle = '#a07840';
      c.fillRect(x, y + T / 2, T, 1);
      c.fillRect(x + T / 2, y, 1, T);
      for (let gi = 0; gi < 3; gi++) {
        for (let gj = 0; gj < 3; gj++) {
          c.strokeStyle = '#7a5820';
          c.strokeRect(x + gi * 5 + 0.5, y + gj * 5 + 0.5, 4, 4);
        }
      }
    });

    // col 10,1: CRAFTING TABLE SIDE
    fill(10, 1, '#8b4e1a', (x, y) => {
      c.fillStyle = '#6b3810';
      c.fillRect(x + 2, y + 3, 4, 4);
      c.fillRect(x + 8, y + 2, 4, 3);
    });

    // col 11,1: FURNACE TOP
    fill(11, 1, '#808080', (x, y) => {
      c.fillStyle = '#606060';
      for (let i = 0; i < 20; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillRect(sx, sy, 2, 2);
      }
    });

    // col 12,1: FURNACE SIDE (with door)
    fill(12, 1, '#808080', (x, y) => {
      c.fillStyle = '#303030';
      c.fillRect(x + 4, y + 4, 8, 9);
      c.fillStyle = '#ff6600';
      c.fillRect(x + 5, y + 9, 6, 3);
    });

    // col 13,1: BEDROCK
    fill(13, 1, '#2a2a2a', (x, y) => {
      c.fillStyle = '#111111';
      for (let i = 0; i < 30; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillRect(sx, sy, 2 + Math.floor(Math.random() * 3), 2 + Math.floor(Math.random() * 3));
      }
      c.fillStyle = '#444444';
      for (let i = 0; i < 15; i++) {
        const sx = x + Math.floor(Math.random() * T);
        const sy = y + Math.floor(Math.random() * T);
        c.fillRect(sx, sy, 2, 2);
      }
    });

    // col 14,1: TORCH
    fill(14, 1, 'rgba(0,0,0,0)', (x, y) => {
      c.fillStyle = '#8b5c1a';
      c.fillRect(x + 7, y + 6, 2, 10);
      c.fillStyle = '#ffcc44';
      c.fillRect(x + 6, y + 3, 4, 4);
      c.fillStyle = '#ff8800';
      c.fillRect(x + 7, y + 4, 2, 2);
    });

    // col 15,1: TALL GRASS
    fill(15, 1, 'rgba(0,0,0,0)', (x, y) => {
      c.fillStyle = '#4a9e2a';
      for (let i = 0; i < 5; i++) {
        const gx = x + 2 + i * 3;
        c.fillRect(gx, y + 4, 1, 12);
        c.fillRect(gx - 1, y + 6, 1, 8);
        c.fillRect(gx + 1, y + 7, 1, 7);
      }
    });

    // Row 2
    // col 0,2: FLOWER RED
    fill(0, 2, 'rgba(0,0,0,0)', (x, y) => {
      c.fillStyle = '#4a9e2a';
      c.fillRect(x + 7, y + 8, 2, 8);
      c.fillStyle = '#cc2222';
      c.fillRect(x + 5, y + 4, 6, 5);
      c.fillStyle = '#ffaaaa';
      c.fillRect(x + 7, y + 5, 2, 3);
    });

    // col 1,2: FLOWER YELLOW
    fill(1, 2, 'rgba(0,0,0,0)', (x, y) => {
      c.fillStyle = '#4a9e2a';
      c.fillRect(x + 7, y + 8, 2, 8);
      c.fillStyle = '#dddd22';
      c.fillRect(x + 5, y + 4, 6, 5);
      c.fillStyle = '#ffff88';
      c.fillRect(x + 7, y + 5, 2, 3);
    });

    // col 2,2: BIRCH PLANKS
    fill(2, 2, '#d4c48a', (x, y) => {
      c.fillStyle = '#b0a06a';
      c.fillRect(x, y + T / 2, T, 1);
      c.fillRect(x, y, T, 1);
    });

    // col 3,2: CHEST TOP
    fill(3, 2, '#8b6914', (x, y) => {
      c.fillStyle = '#6b4e0e';
      c.strokeStyle = '#6b4e0e';
      c.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
    });

    // col 4,2: CHEST SIDE
    fill(4, 2, '#a07820', (x, y) => {
      c.fillStyle = '#6b4e0e';
      c.fillRect(x + 1, y + 1, T - 2, 3);
      c.fillRect(x + 1, y + T - 4, T - 2, 3);
      c.fillStyle = '#cc9922';
      c.fillRect(x + 6, y + 6, 4, 4);
      c.fillStyle = '#a07820';
      c.fillRect(x + 7, y + 7, 2, 2);
    });
  }

  getUVs(col, row) {
    const T = this.tileSize / this.canvasSize;
    const u0 = col * T;
    const v0 = 1 - (row + 1) * T;
    const u1 = (col + 1) * T;
    const v1 = 1 - row * T;
    return { u0, v0, u1, v1 };
  }

  getBlockUVs(blockId, face) {
    const data = BLOCK_DATA[blockId];
    if (!data) return this.getUVs(0, 0);
    let atlas;
    if (face === 'top') atlas = data.textureTop;
    else if (face === 'bottom') atlas = data.textureBottom;
    else atlas = data.textureSide;
    return this.getUVs(atlas[0], atlas[1]);
  }

  getTexture() {
    return this.texture;
  }
}
