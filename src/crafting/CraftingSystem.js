import { BLOCKS, ITEMS } from '../world/BlockTypes.js';

// Each recipe: { pattern: [...], result: { id, count } }
// Grid is 3x3 (or 2x2), null = empty, numbers are item IDs

const P = BLOCKS.OAK_PLANKS;
const BP = BLOCKS.BIRCH_PLANKS;
const L = BLOCKS.OAK_LOG;
const BL = BLOCKS.BIRCH_LOG;
const CB = BLOCKS.COBBLESTONE;
const GT = BLOCKS.CRAFTING_TABLE;
const S = ITEMS.STICK;
const C = ITEMS.COAL;

function recipe(grid, result) {
  return { grid, result };
}

const RECIPES = [
  // Logs -> Planks
  recipe([[L]], { id: BLOCKS.OAK_PLANKS, count: 4 }),
  recipe([[BL]], { id: BLOCKS.BIRCH_PLANKS, count: 4 }),

  // Planks -> Sticks (2 planks vertical)
  recipe([[P],[P]], { id: ITEMS.STICK, count: 4 }),
  recipe([[BP],[BP]], { id: ITEMS.STICK, count: 4 }),

  // 4 planks -> Crafting Table
  recipe([[P, P],[P, P]], { id: BLOCKS.CRAFTING_TABLE, count: 1 }),
  recipe([[BP, BP],[BP, BP]], { id: BLOCKS.CRAFTING_TABLE, count: 1 }),

  // Cobblestone ring -> Furnace
  recipe([
    [CB, CB, CB],
    [CB, null, CB],
    [CB, CB, CB],
  ], { id: BLOCKS.FURNACE, count: 1 }),

  // 8 planks (ring) -> Chest
  recipe([
    [P, P, P],
    [P, null, P],
    [P, P, P],
  ], { id: BLOCKS.CHEST, count: 1 }),
  recipe([
    [BP, BP, BP],
    [BP, null, BP],
    [BP, BP, BP],
  ], { id: BLOCKS.CHEST, count: 1 }),

  // Torch: coal + stick
  recipe([[C],[S]], { id: BLOCKS.TORCH, count: 4 }),

  // Wooden pickaxe
  recipe([
    [P, P, P],
    [null, S, null],
    [null, S, null],
  ], { id: ITEMS.WOODEN_PICKAXE, count: 1 }),

  // Stone pickaxe
  recipe([
    [CB, CB, CB],
    [null, S, null],
    [null, S, null],
  ], { id: ITEMS.STONE_PICKAXE, count: 1 }),

  // Wooden sword
  recipe([
    [P],
    [P],
    [S],
  ], { id: ITEMS.WOODEN_SWORD, count: 1 }),

  // Stone sword
  recipe([
    [CB],
    [CB],
    [S],
  ], { id: ITEMS.STONE_SWORD, count: 1 }),

  // Wooden axe
  recipe([
    [P, P],
    [P, S],
    [null, S],
  ], { id: ITEMS.WOODEN_AXE, count: 1 }),

  // Stone axe
  recipe([
    [CB, CB],
    [CB, S],
    [null, S],
  ], { id: ITEMS.STONE_AXE, count: 1 }),
];

export class CraftingSystem {
  constructor() {
    this.recipes = RECIPES;
  }

  craft(grid, gridSize) {
    // grid: 1D array of {id, count} or null, row-major order
    // Trim to minimal bounding box
    const { pattern, offX, offZ } = this._trimGrid(grid, gridSize);
    if (!pattern) return null;

    for (const recipe of this.recipes) {
      if (this._matchesRecipe(pattern, recipe.grid)) {
        return { ...recipe.result };
      }
    }
    return null;
  }

  _trimGrid(grid, size) {
    let minRow = size, maxRow = -1, minCol = size, maxCol = -1;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const slot = grid[r * size + c];
        if (slot && slot.count > 0) {
          minRow = Math.min(minRow, r);
          maxRow = Math.max(maxRow, r);
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }
      }
    }

    if (maxRow < 0) return { pattern: null };

    const rows = maxRow - minRow + 1;
    const cols = maxCol - minCol + 1;
    const pattern = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const slot = grid[(r + minRow) * size + (c + minCol)];
        row.push(slot && slot.count > 0 ? slot.id : null);
      }
      pattern.push(row);
    }

    return { pattern, offX: minCol, offZ: minRow };
  }

  _matchesRecipe(pattern, recipeGrid) {
    if (pattern.length !== recipeGrid.length) return false;
    for (let r = 0; r < pattern.length; r++) {
      if (pattern[r].length !== recipeGrid[r].length) return false;
      for (let c = 0; c < pattern[r].length; c++) {
        const p = pattern[r][c];
        const rg = recipeGrid[r][c];
        if (p !== rg) return false;
      }
    }
    return true;
  }

  consumeIngredients(grid, gridSize) {
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] && grid[i].count > 0) {
        grid[i].count--;
        if (grid[i].count <= 0) grid[i] = null;
      }
    }
  }
}
