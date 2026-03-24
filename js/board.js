/**
 * BIJULED · Board Logic
 * Match-3 engine with cascades, special gems, and gravity
 */

class Board {
  constructor(size = 8) {
    this.size = size;
    this.grid = [];       // grid[row][col] = GemCell | null
    this.blocked = new Set(); // "row,col" strings
    this.gemTypes = 6;
  }

  // ─── Initialization ───────────────────────────────────────
  init(levelConfig) {
    this.gemTypes = levelConfig.gemTypes || 6;
    this.blocked = new Set(levelConfig.blocked.map(([r, c]) => `${r},${c}`));

    // Build grid without initial matches
    this.grid = [];
    for (let r = 0; r < this.size; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.size; c++) {
        if (this.isBlocked(r, c)) {
          this.grid[r][c] = null;
        } else {
          this.grid[r][c] = this._randomGem(r, c);
        }
      }
    }

    // Resolve any initial matches
    let safetyLimit = 100;
    while (this.findMatches().length > 0 && safetyLimit-- > 0) {
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (!this.isBlocked(r, c)) {
            this.grid[r][c] = this._randomGem(r, c);
          }
        }
      }
    }
  }

  _randomGem(row, col, exclude = []) {
    let type;
    let attempts = 0;
    do {
      type = Math.floor(Math.random() * this.gemTypes);
      attempts++;
    } while (
      attempts < 20 &&
      (exclude.includes(type) || this._wouldMatch(row, col, type))
    );
    return { type, special: 'none' };
  }

  _wouldMatch(row, col, type) {
    // Check horizontal
    const left1 = this.getType(row, col - 1);
    const left2 = this.getType(row, col - 2);
    const right1 = this.getType(row, col + 1);
    const right2 = this.getType(row, col + 2);
    if (left1 === type && left2 === type) return true;
    if (right1 === type && right2 === type) return true;
    if (left1 === type && right1 === type) return true;
    // Check vertical
    const up1 = this.getType(row - 1, col);
    const up2 = this.getType(row - 2, col);
    const down1 = this.getType(row + 1, col);
    const down2 = this.getType(row + 2, col);
    if (up1 === type && up2 === type) return true;
    if (down1 === type && down2 === type) return true;
    if (up1 === type && down1 === type) return true;
    return false;
  }

  getType(r, c) {
    if (r < 0 || r >= this.size || c < 0 || c >= this.size) return -1;
    if (!this.grid[r]) return -1; // row not yet initialized
    if (this.isBlocked(r, c) || !this.grid[r][c]) return -1;
    return this.grid[r][c].type;
  }

  getCell(r, c) {
    if (r < 0 || r >= this.size || c < 0 || c >= this.size) return null;
    return this.grid[r][c];
  }

  isBlocked(r, c) {
    return this.blocked.has(`${r},${c}`);
  }

  isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  // ─── Match Finding ────────────────────────────────────────
  findMatches() {
    const matched = new Set();

    // Horizontal matches
    for (let r = 0; r < this.size; r++) {
      let run = 1;
      for (let c = 1; c <= this.size; c++) {
        const prev = this.getType(r, c - 1);
        const curr = c < this.size ? this.getType(r, c) : -2;
        if (prev >= 0 && prev === curr) {
          run++;
        } else {
          if (run >= 3) {
            for (let k = c - run; k < c; k++) matched.add(`${r},${k}`);
          }
          run = 1;
        }
      }
    }

    // Vertical matches
    for (let c = 0; c < this.size; c++) {
      let run = 1;
      for (let r = 1; r <= this.size; r++) {
        const prev = this.getType(r - 1, c);
        const curr = r < this.size ? this.getType(r, c) : -2;
        if (prev >= 0 && prev === curr) {
          run++;
        } else {
          if (run >= 3) {
            for (let k = r - run; k < r; k++) matched.add(`${k},${c}`);
          }
          run = 1;
        }
      }
    }

    return [...matched].map(key => {
      const [r, c] = key.split(',').map(Number);
      return { r, c };
    });
  }

  /**
   * Analyze a match group to determine special gem creation
   * Returns { row, col, special, type } or null
   */
  analyzeMatch(positions) {
    if (positions.length < 4) return null;

    // Group by row and column
    const byRow = {};
    const byCol = {};
    positions.forEach(({ r, c }) => {
      if (!byRow[r]) byRow[r] = [];
      if (!byCol[c]) byCol[c] = [];
      byRow[r].push(c);
      byCol[c].push(r);
    });

    const rows = Object.keys(byRow);
    const cols = Object.keys(byCol);

    // Check for 5-in-a-row → rainbow gem
    for (const row of rows) {
      if (byRow[row].length >= 5) {
        const mid = Math.floor(byRow[row].length / 2);
        const c = byRow[row].sort((a,b)=>a-b)[mid];
        return { r: parseInt(row), c, special: 'rainbow' };
      }
    }
    for (const col of cols) {
      if (byCol[col].length >= 5) {
        const mid = Math.floor(byCol[col].length / 2);
        const r = byCol[col].sort((a,b)=>a-b)[mid];
        return { r, c: parseInt(col), special: 'rainbow' };
      }
    }

    // Check for T or L shape → bomb gem
    for (const row of rows) {
      if (byRow[row].length >= 3) {
        for (const col of cols) {
          if (byCol[col].length >= 3 && byRow[row].includes(parseInt(col))) {
            return { r: parseInt(row), c: parseInt(col), special: 'bomb' };
          }
        }
      }
    }

    // Check for 4-in-a-row → striped gem
    for (const row of rows) {
      if (byRow[row].length >= 4) {
        const mid = Math.floor(byRow[row].length / 2);
        const c = byRow[row].sort((a,b)=>a-b)[mid];
        return { r: parseInt(row), c, special: 'row' };
      }
    }
    for (const col of cols) {
      if (byCol[col].length >= 4) {
        const mid = Math.floor(byCol[col].length / 2);
        const r = byCol[col].sort((a,b)=>a-b)[mid];
        return { r, c: parseInt(col), special: 'col' };
      }
    }

    return null;
  }

  /**
   * Remove matched cells and apply special gem effects
   * Returns { removed: [{r,c,type}], created: [{r,c,special,type}], bonus: [{r,c,type}] }
   */
  removeMatches(matches, swapCell = null) {
    const removed = [];
    const bonus = [];

    // Group connected matches for special analysis
    // (simplified: treat all as one group for special creation)
    const specialGem = this.analyzeMatch(matches);

    // Expand matches using special gems
    const toRemove = new Set(matches.map(m => `${m.r},${m.c}`));

    // Check special gems in the match set
    matches.forEach(({ r, c }) => {
      const cell = this.grid[r][c];
      if (!cell) return;
      if (cell.special === 'row') {
        // Clear entire row
        for (let cc = 0; cc < this.size; cc++) {
          if (!this.isBlocked(r, cc)) toRemove.add(`${r},${cc}`);
        }
      } else if (cell.special === 'col') {
        // Clear entire column
        for (let rr = 0; rr < this.size; rr++) {
          if (!this.isBlocked(rr, c)) toRemove.add(`${rr},${c}`);
        }
      } else if (cell.special === 'bomb') {
        // Clear 3x3
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && !this.isBlocked(nr, nc)) {
              toRemove.add(`${nr},${nc}`);
            }
          }
        }
      } else if (cell.special === 'rainbow') {
        // Clear all gems of the type that was swapped with
        let targetType = cell.type;
        if (swapCell) {
          const swapGem = this.grid[swapCell.r]?.[swapCell.c];
          if (swapGem) targetType = swapGem.type;
        }
        for (let rr = 0; rr < this.size; rr++) {
          for (let cc = 0; cc < this.size; cc++) {
            const g = this.grid[rr][cc];
            if (g && g.type === targetType) toRemove.add(`${rr},${cc}`);
          }
        }
      }
    });

    // Record removed cells
    toRemove.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const cell = this.grid[r][c];
      if (cell) {
        removed.push({ r, c, type: cell.type, special: cell.special });
        this.grid[r][c] = null;
      }
    });

    // Create special gem if applicable (use removed array since grid is already null)
    const created = [];
    if (specialGem) {
      const gemType =
        removed.find(g => g.r === specialGem.r && g.c === specialGem.c)?.type
        ?? removed[0]?.type
        ?? 0;

      this.grid[specialGem.r][specialGem.c] = { type: gemType, special: specialGem.special };
      created.push({ ...specialGem, type: gemType });
    }

    return { removed, created, bonus };
  }

  /**
   * Apply gravity - gems fall down
   * Returns array of fall animations needed
   */
  applyGravity() {
    const falls = [];

    for (let c = 0; c < this.size; c++) {
      let emptyRow = this.size - 1;
      for (let r = this.size - 1; r >= 0; r--) {
        if (this.isBlocked(r, c)) {
          emptyRow = r - 1;
          continue;
        }
        if (this.grid[r][c] !== null) {
          if (r !== emptyRow) {
            this.grid[emptyRow][c] = this.grid[r][c];
            this.grid[r][c] = null;
            falls.push({ fromR: r, fromC: c, toR: emptyRow, toC: c });
          }
          emptyRow--;
        }
      }
    }

    return falls;
  }

  /**
   * Fill empty cells with new gems from the top
   * Returns array of new gem positions
   */
  fillEmpty() {
    const newGems = [];

    for (let c = 0; c < this.size; c++) {
      for (let r = 0; r < this.size; r++) {
        if (!this.isBlocked(r, c) && this.grid[r][c] === null) {
          const type = Math.floor(Math.random() * this.gemTypes);
          this.grid[r][c] = { type, special: 'none' };
          newGems.push({ r, c, type });
        }
      }
    }

    return newGems;
  }

  /**
   * Swap two adjacent gems
   */
  swap(r1, c1, r2, c2) {
    const tmp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = tmp;
  }

  /**
   * Check if any valid moves exist
   */
  hasValidMoves() {
    // Check all possible swaps
    const dirs = [[0,1],[1,0]];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.isBlocked(r, c) || !this.grid[r][c]) continue;
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= this.size || nc >= this.size) continue;
          if (this.isBlocked(nr, nc) || !this.grid[nr][nc]) continue;
          // Try swap
          this.swap(r, c, nr, nc);
          const matches = this.findMatches();
          this.swap(r, c, nr, nc); // swap back
          if (matches.length > 0) return true;
        }
      }
    }
    return false;
  }

  /**
   * Shuffle board (keeping gem counts the same)
   */
  shuffle() {
    // Collect all gems
    const gems = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.isBlocked(r, c) && this.grid[r][c]) {
          gems.push({ ...this.grid[r][c] });
          this.grid[r][c] = null;
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = gems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gems[i], gems[j]] = [gems[j], gems[i]];
    }

    // Redistribute
    let gemIdx = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.isBlocked(r, c)) {
          this.grid[r][c] = gems[gemIdx++] || { type: Math.floor(Math.random() * this.gemTypes), special: 'none' };
        }
      }
    }
  }

  /**
   * Remove a single gem (hammer boost)
   */
  removeSingle(r, c) {
    if (this.isBlocked(r, c) || !this.grid[r][c]) return null;
    const gem = { ...this.grid[r][c], r, c };
    this.grid[r][c] = null;
    return gem;
  }

  /**
   * Clear all gems of a given type (color bomb)
   */
  clearType(type) {
    const removed = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.isBlocked(r, c) && this.grid[r][c] && this.grid[r][c].type === type) {
          removed.push({ r, c, type: this.grid[r][c].type });
          this.grid[r][c] = null;
        }
      }
    }
    return removed;
  }
}

/**
 * Score calculation
 * Base per gem: 50 + 25 per extra match
 * Cascade multiplier: cascade^1.5
 */
function calcMatchScore(matchCount, cascade = 0) {
  const base = 50 + (matchCount - 3) * 25;
  const multiplier = Math.max(1, Math.pow(cascade + 1, 1.5));
  return Math.round(base * matchCount * multiplier);
}
