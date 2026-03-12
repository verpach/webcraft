export const BLOCKS = {
  AIR: 0,
  STONE: 1,
  DIRT: 2,
  GRASS: 3,
  SAND: 4,
  GRAVEL: 5,
  OAK_LOG: 6,
  OAK_LEAVES: 7,
  BIRCH_LOG: 8,
  BIRCH_LEAVES: 9,
  OAK_PLANKS: 10,
  COBBLESTONE: 11,
  BRICKS: 12,
  WATER: 13,
  GLASS: 14,
  COAL_ORE: 15,
  IRON_ORE: 16,
  GOLD_ORE: 17,
  DIAMOND_ORE: 18,
  CRAFTING_TABLE: 19,
  FURNACE: 20,
  BEDROCK: 21,
  TORCH: 22,
  TALL_GRASS: 23,
  FLOWER_RED: 24,
  FLOWER_YELLOW: 25,
  BIRCH_PLANKS: 26,
  CHEST: 27,
};

// Atlas layout: each entry is [col, row] in a 16x16 grid of 16x16 tiles
// textureTop, textureSide, textureBottom default to textureSide if unset
export const BLOCK_DATA = {
  [BLOCKS.AIR]: {
    name: 'Air', hardness: 0, transparent: true, solid: false, liquid: false,
    color: '#000000',
    textureTop: [0, 0], textureSide: [0, 0], textureBottom: [0, 0],
  },
  [BLOCKS.STONE]: {
    name: 'Stone', hardness: 1.5, transparent: false, solid: true, liquid: false,
    color: '#808080',
    textureTop: [1, 0], textureSide: [1, 0], textureBottom: [1, 0],
  },
  [BLOCKS.DIRT]: {
    name: 'Dirt', hardness: 0.5, transparent: false, solid: true, liquid: false,
    color: '#7a4f2b',
    textureTop: [2, 0], textureSide: [2, 0], textureBottom: [2, 0],
  },
  [BLOCKS.GRASS]: {
    name: 'Grass Block', hardness: 0.6, transparent: false, solid: true, liquid: false,
    color: '#3a9e3a',
    textureTop: [3, 0], textureSide: [4, 0], textureBottom: [2, 0],
  },
  [BLOCKS.SAND]: {
    name: 'Sand', hardness: 0.5, transparent: false, solid: true, liquid: false,
    color: '#c8b46e',
    textureTop: [5, 0], textureSide: [5, 0], textureBottom: [5, 0],
  },
  [BLOCKS.GRAVEL]: {
    name: 'Gravel', hardness: 0.6, transparent: false, solid: true, liquid: false,
    color: '#9e9e8e',
    textureTop: [6, 0], textureSide: [6, 0], textureBottom: [6, 0],
  },
  [BLOCKS.OAK_LOG]: {
    name: 'Oak Log', hardness: 2.0, transparent: false, solid: true, liquid: false,
    color: '#6b4c1e',
    textureTop: [7, 0], textureSide: [8, 0], textureBottom: [7, 0],
  },
  [BLOCKS.OAK_LEAVES]: {
    name: 'Oak Leaves', hardness: 0.2, transparent: true, solid: true, liquid: false,
    color: '#2d6e1a',
    textureTop: [9, 0], textureSide: [9, 0], textureBottom: [9, 0],
  },
  [BLOCKS.BIRCH_LOG]: {
    name: 'Birch Log', hardness: 2.0, transparent: false, solid: true, liquid: false,
    color: '#c0b090',
    textureTop: [10, 0], textureSide: [11, 0], textureBottom: [10, 0],
  },
  [BLOCKS.BIRCH_LEAVES]: {
    name: 'Birch Leaves', hardness: 0.2, transparent: true, solid: true, liquid: false,
    color: '#4a9e2a',
    textureTop: [12, 0], textureSide: [12, 0], textureBottom: [12, 0],
  },
  [BLOCKS.OAK_PLANKS]: {
    name: 'Oak Planks', hardness: 2.0, transparent: false, solid: true, liquid: false,
    color: '#c8a45a',
    textureTop: [0, 1], textureSide: [0, 1], textureBottom: [0, 1],
  },
  [BLOCKS.COBBLESTONE]: {
    name: 'Cobblestone', hardness: 2.0, transparent: false, solid: true, liquid: false,
    color: '#6e6e6e',
    textureTop: [1, 1], textureSide: [1, 1], textureBottom: [1, 1],
  },
  [BLOCKS.BRICKS]: {
    name: 'Bricks', hardness: 2.0, transparent: false, solid: true, liquid: false,
    color: '#9e4a2e',
    textureTop: [2, 1], textureSide: [2, 1], textureBottom: [2, 1],
  },
  [BLOCKS.WATER]: {
    name: 'Water', hardness: 0, transparent: true, solid: false, liquid: true,
    color: '#2255aa',
    textureTop: [3, 1], textureSide: [3, 1], textureBottom: [3, 1],
  },
  [BLOCKS.GLASS]: {
    name: 'Glass', hardness: 0.3, transparent: true, solid: true, liquid: false,
    color: '#aaddff',
    textureTop: [4, 1], textureSide: [4, 1], textureBottom: [4, 1],
  },
  [BLOCKS.COAL_ORE]: {
    name: 'Coal Ore', hardness: 3.0, transparent: false, solid: true, liquid: false,
    color: '#303030',
    textureTop: [5, 1], textureSide: [5, 1], textureBottom: [5, 1],
  },
  [BLOCKS.IRON_ORE]: {
    name: 'Iron Ore', hardness: 3.0, transparent: false, solid: true, liquid: false,
    color: '#c07858',
    textureTop: [6, 1], textureSide: [6, 1], textureBottom: [6, 1],
  },
  [BLOCKS.GOLD_ORE]: {
    name: 'Gold Ore', hardness: 3.0, transparent: false, solid: true, liquid: false,
    color: '#e8d030',
    textureTop: [7, 1], textureSide: [7, 1], textureBottom: [7, 1],
  },
  [BLOCKS.DIAMOND_ORE]: {
    name: 'Diamond Ore', hardness: 3.0, transparent: false, solid: true, liquid: false,
    color: '#30e8e8',
    textureTop: [8, 1], textureSide: [8, 1], textureBottom: [8, 1],
  },
  [BLOCKS.CRAFTING_TABLE]: {
    name: 'Crafting Table', hardness: 2.5, transparent: false, solid: true, liquid: false,
    color: '#8b4e1a',
    textureTop: [9, 1], textureSide: [10, 1], textureBottom: [0, 1],
  },
  [BLOCKS.FURNACE]: {
    name: 'Furnace', hardness: 3.5, transparent: false, solid: true, liquid: false,
    color: '#888888',
    textureTop: [11, 1], textureSide: [12, 1], textureBottom: [11, 1],
  },
  [BLOCKS.BEDROCK]: {
    name: 'Bedrock', hardness: -1, transparent: false, solid: true, liquid: false,
    color: '#1a1a1a',
    textureTop: [13, 1], textureSide: [13, 1], textureBottom: [13, 1],
  },
  [BLOCKS.TORCH]: {
    name: 'Torch', hardness: 0, transparent: true, solid: false, liquid: false,
    color: '#ffcc44',
    textureTop: [14, 1], textureSide: [14, 1], textureBottom: [14, 1],
  },
  [BLOCKS.TALL_GRASS]: {
    name: 'Tall Grass', hardness: 0, transparent: true, solid: false, liquid: false,
    color: '#4a9e2a',
    textureTop: [15, 1], textureSide: [15, 1], textureBottom: [15, 1],
  },
  [BLOCKS.FLOWER_RED]: {
    name: 'Red Flower', hardness: 0, transparent: true, solid: false, liquid: false,
    color: '#cc2222',
    textureTop: [0, 2], textureSide: [0, 2], textureBottom: [0, 2],
  },
  [BLOCKS.FLOWER_YELLOW]: {
    name: 'Yellow Flower', hardness: 0, transparent: true, solid: false, liquid: false,
    color: '#dddd22',
    textureTop: [1, 2], textureSide: [1, 2], textureBottom: [1, 2],
  },
  [BLOCKS.BIRCH_PLANKS]: {
    name: 'Birch Planks', hardness: 2.0, transparent: false, solid: true, liquid: false,
    color: '#d4c48a',
    textureTop: [2, 2], textureSide: [2, 2], textureBottom: [2, 2],
  },
  [BLOCKS.CHEST]: {
    name: 'Chest', hardness: 2.5, transparent: false, solid: true, liquid: false,
    color: '#8b6914',
    textureTop: [3, 2], textureSide: [4, 2], textureBottom: [3, 2],
  },
};

// Items (some are just block IDs, others are tool IDs >= 100)
export const ITEMS = {
  STICK: 100,
  WOODEN_PICKAXE: 101,
  STONE_PICKAXE: 102,
  IRON_PICKAXE: 103,
  WOODEN_SWORD: 104,
  STONE_SWORD: 105,
  WOODEN_AXE: 106,
  STONE_AXE: 107,
  COAL: 108,
  IRON_INGOT: 109,
};

export const ITEM_DATA = {
  [ITEMS.STICK]: { name: 'Stick', color: '#8b5c1a', stackable: true, maxStack: 64 },
  [ITEMS.WOODEN_PICKAXE]: { name: 'Wooden Pickaxe', color: '#c8a45a', stackable: false, maxStack: 1 },
  [ITEMS.STONE_PICKAXE]: { name: 'Stone Pickaxe', color: '#808080', stackable: false, maxStack: 1 },
  [ITEMS.IRON_PICKAXE]: { name: 'Iron Pickaxe', color: '#c07858', stackable: false, maxStack: 1 },
  [ITEMS.WOODEN_SWORD]: { name: 'Wooden Sword', color: '#c8a45a', stackable: false, maxStack: 1 },
  [ITEMS.STONE_SWORD]: { name: 'Stone Sword', color: '#808080', stackable: false, maxStack: 1 },
  [ITEMS.WOODEN_AXE]: { name: 'Wooden Axe', color: '#c8a45a', stackable: false, maxStack: 1 },
  [ITEMS.STONE_AXE]: { name: 'Stone Axe', color: '#808080', stackable: false, maxStack: 1 },
  [ITEMS.COAL]: { name: 'Coal', color: '#222222', stackable: true, maxStack: 64 },
  [ITEMS.IRON_INGOT]: { name: 'Iron Ingot', color: '#d0d0d0', stackable: true, maxStack: 64 },
};

export function getItemData(id) {
  if (id < 100) return BLOCK_DATA[id] ? { ...BLOCK_DATA[id], stackable: true, maxStack: 64 } : null;
  return ITEM_DATA[id] || null;
}

export function getItemName(id) {
  const data = getItemData(id);
  return data ? data.name : 'Unknown';
}

export function getItemColor(id) {
  const data = getItemData(id);
  return data ? data.color : '#888888';
}
