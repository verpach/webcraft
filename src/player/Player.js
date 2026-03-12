import * as THREE from 'three';
import { Physics } from '../physics/Physics.js';
import { BLOCKS, BLOCK_DATA } from '../world/BlockTypes.js';
import {
  GRAVITY, JUMP_FORCE, PLAYER_SPEED, SPRINT_MULTIPLIER, SNEAK_MULTIPLIER,
  PLAYER_HEIGHT, PLAYER_WIDTH, SEA_LEVEL, CHUNK_HEIGHT
} from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

export class Player {
  constructor(world, camera, controls) {
    this.world = world;
    this.camera = camera;
    this.controls = controls;

    this.position = new THREE.Vector3(0, SEA_LEVEL + 5, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.onGround = false;
    this.inWater = false;
    this.feetInWater = false;
    this.flying = false;

    this.health = 20;
    this.maxHealth = 20;
    this.hunger = 20;
    this.maxHunger = 20;

    this.sensitivity = 0.002;
    this.breakProgress = 0;
    this.breakTarget = null;
    this.breakTime = 0;

    this._doubleJumpTimer = 0;
    this._lastJump = false;
  }

  update(dt) {
    const controls = this.controls;
    const camera = this.camera;

    // Mouse look
    if (controls.isPointerLocked()) {
      const { dx, dy } = controls.getMouseDelta();
      camera.updateRotation(dx, dy, this.sensitivity);
    }

    // Movement
    const forward = camera.getForwardHorizontal();
    const right = camera.getRightHorizontal();

    const isSprint = controls.isKey('ShiftLeft') || controls.isKey('ShiftRight');
    const isSneak = controls.isKey('ControlLeft') || controls.isKey('ControlRight');
    let speed = PLAYER_SPEED;
    if (isSprint && !isSneak) speed *= SPRINT_MULTIPLIER;
    if (isSneak) speed *= SNEAK_MULTIPLIER;

    if (this.inWater || this.feetInWater) speed *= 0.25;
    if (this.flying) speed *= 2;

    let moveX = 0, moveZ = 0;
    if (controls.isKey('KeyW') || controls.isKey('w')) {
      moveX += forward.x; moveZ += forward.z;
    }
    if (controls.isKey('KeyS') || controls.isKey('s')) {
      moveX -= forward.x; moveZ -= forward.z;
    }
    if (controls.isKey('KeyA') || controls.isKey('a')) {
      moveX -= right.x; moveZ -= right.z;
    }
    if (controls.isKey('KeyD') || controls.isKey('d')) {
      moveX += right.x; moveZ += right.z;
    }

    // Normalize diagonal movement
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX = (moveX / len) * speed;
      moveZ = (moveZ / len) * speed;
    }

    this.velocity.x = moveX;
    this.velocity.z = moveZ;

    const isJump = controls.isKey('Space');

    if (this.flying) {
      if (isJump) this.velocity.y = PLAYER_SPEED * 2;
      else if (controls.isKey('ShiftLeft')) this.velocity.y = -PLAYER_SPEED * 2;
      else this.velocity.y = 0;
    } else if (this.inWater || this.feetInWater) {
      this.velocity.y += GRAVITY * dt * 0.3;
      if (isJump) this.velocity.y = 4.5;
      this.velocity.y = clamp(this.velocity.y, -3, 3);
    } else {
      this.velocity.y += GRAVITY * dt;
      if (isJump && this.onGround) {
        this.velocity.y = JUMP_FORCE;
      }
    }

    // Physics resolve
    const result = Physics.resolveCollisions(this.position, this.velocity, this.world, dt);
    this.onGround = result.onGround;
    this.inWater = result.inWater;
    this.feetInWater = result.feetInWater;

    if (this.onGround && this.velocity.y < 0) this.velocity.y = 0;

    // Camera position
    const eyeHeight = PLAYER_HEIGHT * 0.85;
    camera.getCamera().position.set(
      this.position.x,
      this.position.y + eyeHeight,
      this.position.z,
    );

    // Toggle fly mode with F key
    if (controls.isKey('KeyF')) {
      if (!this._fPressed) {
        this.flying = !this.flying;
        this._fPressed = true;
      }
    } else {
      this._fPressed = false;
    }
  }

  getPosition() {
    return this.position.clone();
  }

  getEyePosition() {
    return new THREE.Vector3(this.position.x, this.position.y + PLAYER_HEIGHT * 0.85, this.position.z);
  }

  teleport(x, y, z) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
  }
}
