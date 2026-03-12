import * as THREE from 'three';
import { CHUNK_SIZE, CHUNK_HEIGHT } from '../utils/constants.js';
import { ChunkMesher } from './ChunkMesher.js';
import { BLOCKS, BLOCK_DATA } from './BlockTypes.js';

export class Chunk {
  constructor(cx, cz) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    this.mesh = null;
    this.waterMesh = null;
    this.dirty = true;
  }

  _idx(x, y, z) {
    return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
  }

  getBlock(x, y, z) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) return BLOCKS.AIR;
    return this.blocks[this._idx(x, y, z)];
  }

  setBlock(x, y, z, blockId) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) return;
    this.blocks[this._idx(x, y, z)] = blockId;
    this.dirty = true;
  }

  buildMesh(neighbors, textureManager, scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh = null;
    }
    if (this.waterMesh) {
      scene.remove(this.waterMesh);
      this.waterMesh.geometry.dispose();
      this.waterMesh = null;
    }

    const result = ChunkMesher.buildMesh(this, neighbors, textureManager);
    const wx = this.cx * CHUNK_SIZE;
    const wz = this.cz * CHUNK_SIZE;

    if (result.solid.indices.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(result.solid.positions, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(result.solid.normals, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(result.solid.uvs, 2));
      geo.setIndex(result.solid.indices);
      geo.computeBoundingBox();

      const mat = new THREE.MeshLambertMaterial({
        map: textureManager.getTexture(),
        alphaTest: 0.1,
        transparent: false,
        side: THREE.DoubleSide,
      });
      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.position.set(wx, 0, wz);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      scene.add(this.mesh);
    }

    if (result.water.indices.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(result.water.positions, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(result.water.normals, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(result.water.uvs, 2));
      geo.setIndex(result.water.indices);
      geo.computeBoundingBox();

      const mat = new THREE.MeshLambertMaterial({
        map: textureManager.getTexture(),
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      this.waterMesh = new THREE.Mesh(geo, mat);
      this.waterMesh.position.set(wx, 0, wz);
      this.waterMesh.renderOrder = 1;
      scene.add(this.waterMesh);
    }

    this.dirty = false;
  }

  removeFromScene(scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
    if (this.waterMesh) {
      scene.remove(this.waterMesh);
      this.waterMesh.geometry.dispose();
      this.waterMesh.material.dispose();
      this.waterMesh = null;
    }
  }
}
