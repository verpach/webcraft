import { CHUNK_SIZE, CHUNK_HEIGHT } from '../utils/constants.js';
import { BLOCKS, BLOCK_DATA } from './BlockTypes.js';

// Direction vectors for 6 faces: [dx, dy, dz, face name]
const FACES = [
  [0, 1, 0, 'top'],
  [0, -1, 0, 'bottom'],
  [1, 0, 0, 'side'],
  [-1, 0, 0, 'side'],
  [0, 0, 1, 'side'],
  [0, 0, -1, 'side'],
];

// Face normals
const NORMALS = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
];

export class ChunkMesher {
  static buildMesh(chunk, neighbors, textureManager) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const waterPositions = [];
    const waterNormals = [];
    const waterUvs = [];
    const waterIndices = [];

    const S = CHUNK_SIZE;
    const H = CHUNK_HEIGHT;

    const getBlock = (x, y, z) => {
      if (y < 0 || y >= H) return BLOCKS.AIR;
      if (x >= 0 && x < S && z >= 0 && z < S) {
        return chunk.getBlock(x, y, z);
      }
      // Use neighbor chunks
      if (x < 0) {
        const n = neighbors.get('west');
        if (n) return n.getBlock(x + S, y, z);
        return BLOCKS.STONE;
      }
      if (x >= S) {
        const n = neighbors.get('east');
        if (n) return n.getBlock(x - S, y, z);
        return BLOCKS.STONE;
      }
      if (z < 0) {
        const n = neighbors.get('north');
        if (n) return n.getBlock(x, y, z + S);
        return BLOCKS.STONE;
      }
      if (z >= S) {
        const n = neighbors.get('south');
        if (n) return n.getBlock(x, y, z - S);
        return BLOCKS.STONE;
      }
      return BLOCKS.AIR;
    };

    const isTransparent = (id) => {
      if (id === BLOCKS.AIR) return true;
      const d = BLOCK_DATA[id];
      return d ? d.transparent : false;
    };

    const isSolid = (id) => {
      const d = BLOCK_DATA[id];
      return d ? d.solid : false;
    };

    const isLiquid = (id) => {
      const d = BLOCK_DATA[id];
      return d ? d.liquid : false;
    };

    const addQuad = (arr_pos, arr_nor, arr_uv, arr_idx, vx, vy, vz, normal, blockId, faceName, flip) => {
      const [nx, ny, nz] = normal;
      const base = arr_pos.length / 3;
      const { u0, v0, u1, v1 } = textureManager.getBlockUVs(blockId, faceName);

      // Build 4 corners of the quad based on the face direction
      let corners;
      if (nx === 1) {
        corners = [
          [vx+1, vy,   vz  ],
          [vx+1, vy+1, vz  ],
          [vx+1, vy+1, vz+1],
          [vx+1, vy,   vz+1],
        ];
      } else if (nx === -1) {
        corners = [
          [vx, vy,   vz+1],
          [vx, vy+1, vz+1],
          [vx, vy+1, vz  ],
          [vx, vy,   vz  ],
        ];
      } else if (ny === 1) {
        corners = [
          [vx,   vy+1, vz  ],
          [vx,   vy+1, vz+1],
          [vx+1, vy+1, vz+1],
          [vx+1, vy+1, vz  ],
        ];
      } else if (ny === -1) {
        corners = [
          [vx+1, vy, vz  ],
          [vx+1, vy, vz+1],
          [vx,   vy, vz+1],
          [vx,   vy, vz  ],
        ];
      } else if (nz === 1) {
        corners = [
          [vx+1, vy,   vz+1],
          [vx+1, vy+1, vz+1],
          [vx,   vy+1, vz+1],
          [vx,   vy,   vz+1],
        ];
      } else {
        corners = [
          [vx,   vy,   vz],
          [vx,   vy+1, vz],
          [vx+1, vy+1, vz],
          [vx+1, vy,   vz],
        ];
      }

      for (const [cx, cy, cz] of corners) {
        arr_pos.push(cx, cy, cz);
        arr_nor.push(nx, ny, nz);
      }

      arr_uv.push(u0, v0, u0, v1, u1, v1, u1, v0);

      if (flip) {
        arr_idx.push(base, base+2, base+1, base, base+3, base+2);
      } else {
        arr_idx.push(base, base+1, base+2, base, base+2, base+3);
      }
    };

    for (let lx = 0; lx < S; lx++) {
      for (let ly = 0; ly < H; ly++) {
        for (let lz = 0; lz < S; lz++) {
          const blockId = chunk.getBlock(lx, ly, lz);
          if (blockId === BLOCKS.AIR) continue;

          const data = BLOCK_DATA[blockId];
          if (!data) continue;

          // Skip decorative non-solid transparent blocks - render as cross
          if (data.transparent && !data.solid && blockId !== BLOCKS.WATER) {
            // Render as X cross for plants/torches
            const wx = lx;
            const wy = ly;
            const wz = lz;
            const { u0, v0, u1, v1 } = textureManager.getBlockUVs(blockId, 'side');

            const base1 = positions.length / 3;
            // Diagonal 1: (0,0,0)-(1,1,1)
            positions.push(wx, wy, wz,   wx, wy+1, wz,   wx+1, wy+1, wz+1,   wx+1, wy, wz+1);
            normals.push(0,0,1, 0,0,1, 0,0,1, 0,0,1);
            uvs.push(u0, v1, u0, v0, u1, v0, u1, v1);
            indices.push(base1, base1+1, base1+2, base1, base1+2, base1+3);

            const base2 = positions.length / 3;
            positions.push(wx+1, wy, wz,   wx+1, wy+1, wz,   wx, wy+1, wz+1,   wx, wy, wz+1);
            normals.push(0,0,1, 0,0,1, 0,0,1, 0,0,1);
            uvs.push(u0, v1, u0, v0, u1, v0, u1, v1);
            indices.push(base2, base2+1, base2+2, base2, base2+2, base2+3);

            continue;
          }

          const liquid = data.liquid;

          for (let fi = 0; fi < FACES.length; fi++) {
            const [dx, dy, dz, faceName] = FACES[fi];
            const normal = NORMALS[fi];
            const nx2 = lx + dx, ny2 = ly + dy, nz2 = lz + dz;
            const neighbor = getBlock(nx2, ny2, nz2);
            const neighborData = BLOCK_DATA[neighbor];

            let shouldRender = false;
            if (liquid) {
              // Render water faces adjacent to air or transparent non-water
              if (neighbor === BLOCKS.AIR || (neighborData && neighborData.transparent && neighbor !== BLOCKS.WATER)) {
                shouldRender = true;
              }
            } else if (data.transparent) {
              // Transparent solids: render face if neighbor is air or different transparent
              if (neighbor === BLOCKS.AIR || (neighborData && neighborData.transparent && neighbor !== blockId)) {
                shouldRender = true;
              }
            } else {
              // Opaque: render face if neighbor is transparent
              if (!neighborData || neighborData.transparent) {
                shouldRender = true;
              }
            }

            if (!shouldRender) continue;

            if (liquid) {
              addQuad(waterPositions, waterNormals, waterUvs, waterIndices, lx, ly, lz, normal, blockId, faceName, false);
            } else {
              addQuad(positions, normals, uvs, indices, lx, ly, lz, normal, blockId, faceName, false);
            }
          }
        }
      }
    }

    return {
      solid: { positions, normals, uvs, indices },
      water: { positions: waterPositions, normals: waterNormals, uvs: waterUvs, indices: waterIndices },
    };
  }
}
