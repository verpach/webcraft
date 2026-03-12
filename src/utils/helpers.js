import { CHUNK_SIZE } from './constants.js';

export function chunkKey(cx, cz) {
  return `${cx},${cz}`;
}

export function worldToChunk(x, z) {
  return {
    cx: Math.floor(x / CHUNK_SIZE),
    cz: Math.floor(z / CHUNK_SIZE),
  };
}

export function worldToLocal(x, y, z) {
  return {
    lx: ((Math.floor(x) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
    ly: Math.floor(y),
    lz: ((Math.floor(z) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
  };
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function generateSeed() {
  return Math.random().toString(36).substring(2, 10);
}

export function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h ^= h >>> 13;
    h = Math.imul(h, 0x9e3779b1) | 0;
    h ^= h >>> 15;
    return ((h >>> 0) / 0xffffffff);
  };
}
