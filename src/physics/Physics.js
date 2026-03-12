import { BLOCKS, BLOCK_DATA } from '../world/BlockTypes.js';
import { CHUNK_HEIGHT, PLAYER_HEIGHT, PLAYER_WIDTH } from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

export class Physics {
  static resolveCollisions(position, velocity, world, dt) {
    const hw = PLAYER_WIDTH / 2;
    const h = PLAYER_HEIGHT;

    let dx = velocity.x * dt;
    let dy = velocity.y * dt;
    let dz = velocity.z * dt;

    const collidesAt = (px, py, pz) => {
      const minX = Math.floor(px - hw);
      const maxX = Math.floor(px + hw - 0.001);
      const minY = Math.floor(py);
      const maxY = Math.floor(py + h - 0.001);
      const minZ = Math.floor(pz - hw);
      const maxZ = Math.floor(pz + hw - 0.001);

      for (let bx = minX; bx <= maxX; bx++) {
        for (let by = minY; by <= maxY; by++) {
          for (let bz = minZ; bz <= maxZ; bz++) {
            const id = world.getBlock(bx, by, bz);
            if (id === BLOCKS.AIR) continue;
            const data = BLOCK_DATA[id];
            if (data && data.solid && !data.liquid) return true;
          }
        }
      }
      return false;
    };

    // Resolve X
    if (dx !== 0) {
      const newX = position.x + dx;
      if (collidesAt(newX, position.y, position.z)) {
        velocity.x = 0;
        dx = 0;
      }
    }

    // Resolve Y
    if (dy !== 0) {
      const newY = position.y + dy;
      if (collidesAt(position.x + dx, newY, position.z)) {
        if (dy < 0) {
          // Snap to floor
          position.y = Math.ceil(position.y);
        } else {
          // Snap to ceiling
          position.y = Math.floor(position.y);
        }
        velocity.y = 0;
        dy = 0;
      }
    }

    // Resolve Z
    if (dz !== 0) {
      const newZ = position.z + dz;
      if (collidesAt(position.x + dx, position.y + dy, newZ)) {
        velocity.z = 0;
        dz = 0;
      }
    }

    // Clamp to world bounds
    position.x += dx;
    position.y = clamp(position.y + dy, 0, CHUNK_HEIGHT - 2);
    position.z += dz;

    // Check on ground
    const onGround = collidesAt(position.x, position.y - 0.05, position.z);

    // Check in water
    const eyeX = Math.floor(position.x);
    const eyeY = Math.floor(position.y + PLAYER_HEIGHT * 0.8);
    const eyeZ = Math.floor(position.z);
    const eyeBlock = world.getBlock(eyeX, eyeY, eyeZ);
    const inWater = BLOCK_DATA[eyeBlock] ? BLOCK_DATA[eyeBlock].liquid : false;

    // Check feet in water
    const feetBlock = world.getBlock(Math.floor(position.x), Math.floor(position.y), Math.floor(position.z));
    const feetInWater = BLOCK_DATA[feetBlock] ? BLOCK_DATA[feetBlock].liquid : false;

    return { onGround, inWater, feetInWater };
  }
}
