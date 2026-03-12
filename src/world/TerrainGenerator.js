import { createNoise2D, createNoise3D } from 'simplex-noise';
import { BLOCKS } from './BlockTypes.js';
import { CHUNK_SIZE, CHUNK_HEIGHT, SEA_LEVEL } from '../utils/constants.js';
import { seededRandom } from '../utils/helpers.js';

export class TerrainGenerator {
  constructor(seed) {
    this.seed = seed;
    const rng = seededRandom(seed);

    // Multiple noise functions with different seeds
    const mkRng = (s) => seededRandom(seed + s);
    this.heightNoise = createNoise2D(mkRng('h'));
    this.detailNoise = createNoise2D(mkRng('d'));
    this.biomeNoise = createNoise2D(mkRng('b'));
    this.caveNoise = createNoise3D(mkRng('c'));
    this.caveNoise2 = createNoise3D(mkRng('c2'));
    this.treeNoise = createNoise2D(mkRng('t'));
  }

  getBiome(worldX, worldZ) {
    const v = this.biomeNoise(worldX * 0.003, worldZ * 0.003);
    if (v > 0.35) return 'desert';
    if (v < -0.2) return 'forest';
    return 'plains';
  }

  getHeight(worldX, worldZ) {
    const biome = this.getBiome(worldX, worldZ);
    const scale = biome === 'desert' ? 0.006 : 0.008;
    const amplitude = biome === 'desert' ? 12 : 22;
    const base = biome === 'desert' ? SEA_LEVEL + 5 : SEA_LEVEL;

    let h = this.heightNoise(worldX * scale, worldZ * scale) * amplitude;
    h += this.detailNoise(worldX * 0.03, worldZ * 0.03) * 6;
    h += this.heightNoise(worldX * 0.06, worldZ * 0.06) * 3;

    return Math.floor(base + h);
  }

  generateChunk(cx, cz) {
    const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    const idx = (x, y, z) => y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = cx * CHUNK_SIZE + lx;
        const wz = cz * CHUNK_SIZE + lz;
        const biome = this.getBiome(wx, wz);
        const surfaceY = this.getHeight(wx, wz);
        const clampedSurface = Math.min(surfaceY, CHUNK_HEIGHT - 2);

        // Bedrock
        blocks[idx(lx, 0, lz)] = BLOCKS.BEDROCK;

        for (let ly = 1; ly <= clampedSurface; ly++) {
          if (ly < clampedSurface - 4) {
            blocks[idx(lx, ly, lz)] = BLOCKS.STONE;
          } else if (ly < clampedSurface) {
            blocks[idx(lx, ly, lz)] = biome === 'desert' ? BLOCKS.SAND : BLOCKS.DIRT;
          } else {
            // Surface
            if (biome === 'desert') {
              blocks[idx(lx, ly, lz)] = BLOCKS.SAND;
            } else if (ly <= SEA_LEVEL) {
              blocks[idx(lx, ly, lz)] = BLOCKS.DIRT;
            } else {
              blocks[idx(lx, ly, lz)] = BLOCKS.GRASS;
            }
          }
        }

        // Water fill
        for (let ly = clampedSurface + 1; ly <= SEA_LEVEL; ly++) {
          if (blocks[idx(lx, ly, lz)] === BLOCKS.AIR) {
            blocks[idx(lx, ly, lz)] = BLOCKS.WATER;
          }
        }
      }
    }

    this._generateCaves(blocks, cx, cz);
    this._placeOres(blocks, cx, cz);
    this._placeDecorations(blocks, cx, cz);

    return blocks;
  }

  _generateCaves(blocks, cx, cz) {
    const idx = (x, y, z) => y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        for (let ly = 1; ly < SEA_LEVEL - 5; ly++) {
          if (blocks[idx(lx, ly, lz)] !== BLOCKS.STONE) continue;
          const wx = (cx * CHUNK_SIZE + lx) * 0.05;
          const wy = ly * 0.05;
          const wz = (cz * CHUNK_SIZE + lz) * 0.05;
          const n1 = this.caveNoise(wx, wy, wz);
          const n2 = this.caveNoise2(wx, wy, wz);
          if (n1 * n1 + n2 * n2 < 0.04) {
            blocks[idx(lx, ly, lz)] = BLOCKS.AIR;
          }
        }
      }
    }
  }

  _placeOres(blocks, cx, cz) {
    const idx = (x, y, z) => y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;

    const placeVein = (blockId, minY, maxY, veins, size) => {
      for (let v = 0; v < veins; v++) {
        const lx = Math.floor(Math.random() * CHUNK_SIZE);
        const ly = minY + Math.floor(Math.random() * (maxY - minY));
        const lz = Math.floor(Math.random() * CHUNK_SIZE);
        for (let s = 0; s < size; s++) {
          const ox = lx + Math.floor(Math.random() * 3 - 1);
          const oy = ly + Math.floor(Math.random() * 3 - 1);
          const oz = lz + Math.floor(Math.random() * 3 - 1);
          if (ox >= 0 && ox < CHUNK_SIZE && oy > 0 && oy < CHUNK_HEIGHT && oz >= 0 && oz < CHUNK_SIZE) {
            if (blocks[idx(ox, oy, oz)] === BLOCKS.STONE) {
              blocks[idx(ox, oy, oz)] = blockId;
            }
          }
        }
      }
    };

    placeVein(BLOCKS.COAL_ORE, 5, 100, 20, 8);
    placeVein(BLOCKS.IRON_ORE, 5, 64, 15, 6);
    placeVein(BLOCKS.GOLD_ORE, 5, 32, 8, 4);
    placeVein(BLOCKS.DIAMOND_ORE, 5, 16, 4, 3);
  }

  _placeDecorations(blocks, cx, cz) {
    const idx = (x, y, z) => y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = cx * CHUNK_SIZE + lx;
        const wz = cz * CHUNK_SIZE + lz;
        const biome = this.getBiome(wx, wz);

        // Find surface
        let surfaceY = 0;
        for (let ly = CHUNK_HEIGHT - 1; ly >= 1; ly--) {
          if (blocks[idx(lx, ly, lz)] !== BLOCKS.AIR && blocks[idx(lx, ly, lz)] !== BLOCKS.WATER) {
            surfaceY = ly;
            break;
          }
        }
        if (surfaceY <= SEA_LEVEL) continue;
        const topBlock = blocks[idx(lx, surfaceY, lz)];
        if (topBlock !== BLOCKS.GRASS && topBlock !== BLOCKS.SAND) continue;

        if (biome === 'desert') {
          // Desert: nothing
        } else if (biome === 'forest') {
          const tv = this.treeNoise(wx * 0.2, wz * 0.2);
          if (tv > 0.6 && lx >= 2 && lx <= 13 && lz >= 2 && lz <= 13) {
            this._placeTree(blocks, lx, lz, surfaceY + 1, Math.random() > 0.5 ? 'birch' : 'oak');
          }
        } else {
          // Plains
          const tv = this.treeNoise(wx * 0.2, wz * 0.2);
          if (tv > 0.8 && lx >= 2 && lx <= 13 && lz >= 2 && lz <= 13) {
            this._placeTree(blocks, lx, lz, surfaceY + 1, 'oak');
          } else if (Math.random() < 0.04) {
            const tall = Math.random() < 0.5;
            const flower = Math.random() < 0.3;
            if (flower) {
              const fBlock = Math.random() < 0.5 ? BLOCKS.FLOWER_RED : BLOCKS.FLOWER_YELLOW;
              if (surfaceY + 1 < CHUNK_HEIGHT) blocks[idx(lx, surfaceY + 1, lz)] = fBlock;
            } else if (tall) {
              if (surfaceY + 1 < CHUNK_HEIGHT) blocks[idx(lx, surfaceY + 1, lz)] = BLOCKS.TALL_GRASS;
            }
          }
        }
      }
    }
  }

  _placeTree(blocks, lx, lz, baseY, type) {
    const idx = (x, y, z) => y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
    const logBlock = type === 'birch' ? BLOCKS.BIRCH_LOG : BLOCKS.OAK_LOG;
    const leafBlock = type === 'birch' ? BLOCKS.BIRCH_LEAVES : BLOCKS.OAK_LEAVES;
    const height = 4 + Math.floor(Math.random() * 3);

    // Trunk
    for (let i = 0; i < height; i++) {
      const y = baseY + i;
      if (y < CHUNK_HEIGHT) blocks[idx(lx, y, lz)] = logBlock;
    }

    // Leaves
    const leafStart = baseY + height - 2;
    for (let dy = 0; dy < 4; dy++) {
      const radius = dy < 2 ? 2 : 1;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) === radius && Math.abs(dz) === radius) continue;
          const nx = lx + dx;
          const nz = lz + dz;
          const ny = leafStart + dy;
          if (nx >= 0 && nx < CHUNK_SIZE && nz >= 0 && nz < CHUNK_SIZE && ny < CHUNK_HEIGHT) {
            if (blocks[idx(nx, ny, nz)] === BLOCKS.AIR) {
              blocks[idx(nx, ny, nz)] = leafBlock;
            }
          }
        }
      }
    }
  }
}
