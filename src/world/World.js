import * as THREE from 'three';
import { Chunk } from './Chunk.js';
import { BLOCKS, BLOCK_DATA } from './BlockTypes.js';
import { CHUNK_SIZE, CHUNK_HEIGHT, RENDER_DISTANCE } from '../utils/constants.js';
import { chunkKey, worldToChunk, worldToLocal } from '../utils/helpers.js';

export class World {
  constructor(scene, textureManager, generator) {
    this.scene = scene;
    this.textureManager = textureManager;
    this.generator = generator;
    this.chunks = new Map();
    this.pendingMeshUpdate = new Set();
    this.meshBuildQueue = [];
    this.maxMeshPerFrame = 2;
  }

  getChunk(cx, cz) {
    return this.chunks.get(chunkKey(cx, cz)) || null;
  }

  getOrCreateChunk(cx, cz) {
    const key = chunkKey(cx, cz);
    if (!this.chunks.has(key)) {
      const chunk = new Chunk(cx, cz);
      chunk.blocks = this.generator.generateChunk(cx, cz);
      this.chunks.set(key, chunk);
    }
    return this.chunks.get(key);
  }

  update(playerPos) {
    const { cx: pcx, cz: pcz } = worldToChunk(playerPos.x, playerPos.z);
    const rd = RENDER_DISTANCE;

    // Load new chunks
    for (let dx = -rd; dx <= rd; dx++) {
      for (let dz = -rd; dz <= rd; dz++) {
        if (dx * dx + dz * dz > rd * rd) continue;
        const cx = pcx + dx;
        const cz = pcz + dz;
        const key = chunkKey(cx, cz);
        if (!this.chunks.has(key)) {
          this.getOrCreateChunk(cx, cz);
          this._markDirty(cx, cz);
        }
      }
    }

    // Unload distant chunks
    for (const [key, chunk] of this.chunks) {
      const ddx = chunk.cx - pcx;
      const ddz = chunk.cz - pcz;
      if (Math.abs(ddx) > rd + 2 || Math.abs(ddz) > rd + 2) {
        chunk.removeFromScene(this.scene);
        this.chunks.delete(key);
      }
    }

    // Build meshes for dirty chunks (limit per frame)
    let built = 0;
    for (const key of [...this.pendingMeshUpdate]) {
      if (built >= this.maxMeshPerFrame) break;
      const chunk = this.chunks.get(key);
      if (!chunk) { this.pendingMeshUpdate.delete(key); continue; }
      const neighbors = this._getNeighborMap(chunk.cx, chunk.cz);
      chunk.buildMesh(neighbors, this.textureManager, this.scene);
      this.pendingMeshUpdate.delete(key);
      built++;
    }
  }

  _markDirty(cx, cz) {
    const key = chunkKey(cx, cz);
    if (this.chunks.has(key)) {
      this.pendingMeshUpdate.add(key);
    }
  }

  _getNeighborMap(cx, cz) {
    const neighbors = new Map();
    neighbors.set('north', this.getChunk(cx, cz - 1));
    neighbors.set('south', this.getChunk(cx, cz + 1));
    neighbors.set('west', this.getChunk(cx - 1, cz));
    neighbors.set('east', this.getChunk(cx + 1, cz));
    return neighbors;
  }

  getBlock(wx, wy, wz) {
    if (wy < 0 || wy >= CHUNK_HEIGHT) return BLOCKS.AIR;
    const { cx, cz } = worldToChunk(wx, wz);
    const chunk = this.getChunk(cx, cz);
    if (!chunk) return BLOCKS.AIR;
    const { lx, ly, lz } = worldToLocal(wx, wy, wz);
    return chunk.getBlock(lx, ly, lz);
  }

  setBlock(wx, wy, wz, blockId) {
    if (wy < 0 || wy >= CHUNK_HEIGHT) return;
    const { cx, cz } = worldToChunk(wx, wz);
    const chunk = this.getChunk(cx, cz);
    if (!chunk) return;
    const { lx, ly, lz } = worldToLocal(wx, wy, wz);
    chunk.setBlock(lx, ly, lz, blockId);

    // Mark this and neighboring chunks dirty
    this._markDirty(cx, cz);
    if (lx === 0) this._markDirty(cx - 1, cz);
    if (lx === CHUNK_SIZE - 1) this._markDirty(cx + 1, cz);
    if (lz === 0) this._markDirty(cx, cz - 1);
    if (lz === CHUNK_SIZE - 1) this._markDirty(cx, cz + 1);
  }

  raycast(origin, direction, maxDist = 8) {
    const pos = origin.clone();
    const step = direction.clone().normalize().multiplyScalar(0.05);
    let lastAirPos = null;
    let lastAirFace = null;

    for (let i = 0; i < maxDist / 0.05; i++) {
      const bx = Math.floor(pos.x);
      const by = Math.floor(pos.y);
      const bz = Math.floor(pos.z);
      const blockId = this.getBlock(bx, by, bz);

      if (blockId !== BLOCKS.AIR) {
        const data = BLOCK_DATA[blockId];
        if (data && data.solid) {
          return {
            block: new THREE.Vector3(bx, by, bz),
            face: lastAirFace,
            position: lastAirPos ? lastAirPos.clone() : null,
          };
        }
      }

      // Track last air position for face detection
      const prevBx = Math.floor(pos.x - step.x);
      const prevBy = Math.floor(pos.y - step.y);
      const prevBz = Math.floor(pos.z - step.z);

      if (bx !== prevBx || by !== prevBy || bz !== prevBz) {
        const dx = bx - prevBx;
        const dy = by - prevBy;
        const dz = bz - prevBz;
        let face = new THREE.Vector3(-dx, -dy, -dz);
        lastAirFace = face;
        lastAirPos = new THREE.Vector3(bx, by, bz);
      }

      pos.add(step);
    }

    return null;
  }

  preloadAroundPlayer(playerPos, radius, onProgress) {
    const { cx: pcx, cz: pcz } = worldToChunk(playerPos.x, playerPos.z);
    const toGenerate = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        if (dx * dx + dz * dz > radius * radius) continue;
        const key = chunkKey(pcx + dx, pcz + dz);
        if (!this.chunks.has(key)) toGenerate.push({ cx: pcx + dx, cz: pcz + dz });
      }
    }
    const total = toGenerate.length;
    let done = 0;

    return new Promise(resolve => {
      const step = () => {
        if (toGenerate.length === 0) {
          // Build meshes
          let built = 0;
          for (const [key, chunk] of this.chunks) {
            const neighbors = this._getNeighborMap(chunk.cx, chunk.cz);
            chunk.buildMesh(neighbors, this.textureManager, this.scene);
            built++;
          }
          resolve();
          return;
        }
        const { cx, cz } = toGenerate.shift();
        this.getOrCreateChunk(cx, cz);
        done++;
        if (onProgress) onProgress(done / (total + 1));
        setTimeout(step, 0);
      };
      step();
    });
  }
}
