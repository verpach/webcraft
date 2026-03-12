import localforage from 'localforage';

export class WorldStorage {
  constructor() {
    this.worldStore = localforage.createInstance({ name: 'webcraft', storeName: 'worlds' });
    this.chunkStore = localforage.createInstance({ name: 'webcraft', storeName: 'chunks' });
  }

  async saveWorld(name, worldData) {
    await this.worldStore.setItem(`world:${name}`, {
      name,
      seed: worldData.seed,
      playerPos: worldData.playerPos,
      inventory: worldData.inventory,
      savedAt: Date.now(),
    });
  }

  async loadWorld(name) {
    return await this.worldStore.getItem(`world:${name}`);
  }

  async listWorlds() {
    const worlds = [];
    await this.worldStore.iterate((value, key) => {
      if (key.startsWith('world:')) worlds.push(value);
    });
    return worlds;
  }

  async deleteWorld(name) {
    await this.worldStore.removeItem(`world:${name}`);
    // Also delete all chunks
    const toDelete = [];
    await this.chunkStore.iterate((value, key) => {
      if (key.startsWith(`chunk:${name}:`)) toDelete.push(key);
    });
    for (const key of toDelete) {
      await this.chunkStore.removeItem(key);
    }
  }

  async saveChunk(worldName, chunkKey, data) {
    const key = `chunk:${worldName}:${chunkKey}`;
    await this.chunkStore.setItem(key, Array.from(data));
  }

  async loadChunk(worldName, chunkKey) {
    const key = `chunk:${worldName}:${chunkKey}`;
    const data = await this.chunkStore.getItem(key);
    if (!data) return null;
    return new Uint8Array(data);
  }
}
