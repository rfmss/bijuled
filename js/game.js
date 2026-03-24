/**
 * BIJULED · Main Game Controller
 * Handles UI, input, animations, state machine
 */

// ─── State Machine ────────────────────────────────────────────────
const STATE = {
  MENU: 'menu',
  LEVEL_SELECT: 'level_select',
  PLAYING: 'playing',
  ANIMATING: 'animating',
  PAUSED: 'paused',
  COMPLETE: 'complete',
  GAME_OVER: 'game_over'
};

// ─── Game Object ──────────────────────────────────────────────────
const Game = {
  state: STATE.MENU,
  board: null,
  currentLevel: null,
  score: 0,
  moves: 0,
  collected: 0,
  lives: 3,
  cascade: 0,
  timeLeft: 0,
  timerInterval: null,
  boosts: { hammer: 3, shuffle: 2, bomb: 1 },
  activeBoost: null,
  selectedCell: null,
  progress: null,
  cellEls: [],
  _touchStartX: 0,
  _touchStartY: 0,
  _touchStartRow: -1,
  _touchStartCol: -1,

  // ─── Init ─────────────────────────────────────────────────────
  init() {
    this.progress = Progress.load();
    this.setupMenuListeners();
    this.setupLevelSelect();
    this.setupGameListeners();
    this.setupBoostListeners();
    this.renderBgGems();
    this.showScreen('menu');
  },

  // ─── Screen Management ────────────────────────────────────────
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const map = {
      menu: 'screen-menu',
      levels: 'screen-levels',
      game: 'screen-game'
    };
    const el = document.getElementById(map[name]);
    if (el) {
      requestAnimationFrame(() => el.classList.add('active'));
    }
  },

  showOverlay(id) {
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },

  hideOverlays() {
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  },

  // ─── Menu ─────────────────────────────────────────────────────
  setupMenuListeners() {
    document.getElementById('btn-play').addEventListener('click', () => {
      const next = Math.min(this.progress.data.maxLevel, 50);
      this.startLevel(next);
    });

    document.getElementById('btn-levels').addEventListener('click', () => {
      this.renderLevelSelect();
      this.showScreen('levels');
    });

    document.getElementById('btn-back-menu').addEventListener('click', () => {
      this.showScreen('menu');
    });
  },

  renderBgGems() {
    const container = document.getElementById('bg-gems');
    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const div = document.createElement('div');
      div.className = 'bg-gem-particle';
      const typeId = Math.floor(Math.random() * 6);
      div.innerHTML = createGem(GEM_IDS[typeId]);
      const size = 30 + Math.random() * 50;
      div.style.cssText = `
        left: ${Math.random() * 100}%;
        bottom: -${size}px;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${8 + Math.random() * 15}s;
        animation-delay: ${-Math.random() * 20}s;
      `;
      container.appendChild(div);
    }
  },

  // ─── Level Select ─────────────────────────────────────────────
  setupLevelSelect() {
    // Rebuilt dynamically in renderLevelSelect
  },

  renderLevelSelect() {
    const container = document.getElementById('levels-container');
    container.innerHTML = '';

    CHAPTERS.forEach(chapter => {
      const block = document.createElement('div');
      block.className = 'chapter-block';

      const title = document.createElement('div');
      title.className = 'chapter-title';
      title.textContent = chapter.name;
      title.style.color = chapter.color;
      block.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'levels-grid';

      for (let id = chapter.levels[0]; id <= chapter.levels[1]; id++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';

        const unlocked = this.progress.isUnlocked(id);
        const completed = this.progress.isCompleted(id);
        const stars = this.progress.getLevelStars(id);

        if (completed) btn.classList.add('completed');
        else if (unlocked) btn.classList.add('unlocked');
        else btn.classList.add('locked');

        if (completed || unlocked) {
          btn.addEventListener('click', () => {
            this.startLevel(id);
          });
        }

        const numEl = document.createElement('span');
        numEl.className = 'level-num';
        numEl.textContent = id;

        const starsEl = document.createElement('span');
        starsEl.className = 'level-stars';
        starsEl.textContent = stars > 0
          ? '★'.repeat(stars) + '☆'.repeat(3 - stars)
          : (unlocked ? '☆☆☆' : '🔒');

        btn.appendChild(numEl);
        btn.appendChild(starsEl);
        grid.appendChild(btn);
      }

      block.appendChild(grid);
      container.appendChild(block);
    });
  },

  // ─── Game Setup ───────────────────────────────────────────────
  startLevel(levelId) {
    this.hideOverlays();
    this.clearTimer();

    this.currentLevel = getLevel(levelId);
    this.board = new Board(8);
    this.board.init(this.currentLevel);

    this.score = 0;
    this.collected = 0;
    this.cascade = 0;
    this.selectedCell = null;
    this.activeBoost = null;
    this.moves = this.currentLevel.moves || 0;
    this.timeLeft = this.currentLevel.time || 0;

    this.state = STATE.PLAYING;
    this.showScreen('game');
    this.renderBoard();
    this.updateHUD();
    this.updateObjective();

    if (this.currentLevel.time) {
      this.startTimer();
    }
  },

  // ─── Board Rendering ──────────────────────────────────────────
  renderBoard() {
    const boardEl = document.getElementById('game-board');
    boardEl.innerHTML = '';
    this.cellEls = [];

    const canvas = document.getElementById('particle-canvas');
    // Compute board size from CSS custom properties
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const cellSize = parseInt(cs.getPropertyValue('--cell-size')) || 72;
    const cellGap = parseInt(cs.getPropertyValue('--cell-gap')) || 4;
    const boardPad = parseInt(cs.getPropertyValue('--board-padding')) || 8;
    const boardPx = 8 * cellSize + 7 * cellGap;
    const framePx = boardPx + 2 * boardPad;
    canvas.width = framePx;
    canvas.height = framePx;

    for (let r = 0; r < 8; r++) {
      this.cellEls[r] = [];
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'gem-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        if (this.board.isBlocked(r, c)) {
          cell.classList.add('blocked');
        } else {
          // Click fallback (desktop)
          cell.addEventListener('click', () => this.onCellClick(r, c));

          // Touch: swipe = direct swap, tap = select/swap like click
          cell.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this._touchStartX = t.clientX;
            this._touchStartY = t.clientY;
            this._touchStartRow = r;
            this._touchStartCol = c;
          }, { passive: false });

          cell.addEventListener('touchend', (e) => {
            e.preventDefault();
            const t = e.changedTouches[0];
            const dx = t.clientX - this._touchStartX;
            const dy = t.clientY - this._touchStartY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sr = this._touchStartRow;
            const sc = this._touchStartCol;

            if (dist < 12) {
              // Tap — use normal click logic
              this.onCellClick(sr, sc);
            } else {
              // Swipe — resolve direction and swap directly
              if (this.state !== STATE.PLAYING) return;
              const absDx = Math.abs(dx);
              const absDy = Math.abs(dy);
              let tr = sr, tc = sc;
              if (absDx > absDy) {
                tc = dx > 0 ? sc + 1 : sc - 1;
              } else {
                tr = dy > 0 ? sr + 1 : sr - 1;
              }
              if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && !this.board.isBlocked(tr, tc)) {
                this.deselectCell();
                this.trySwap(sr, sc, tr, tc);
              }
            }
          }, { passive: false });

          this.renderCell(cell, r, c);
        }

        boardEl.appendChild(cell);
        this.cellEls[r][c] = cell;
      }
    }
  },

  renderCell(el, r, c) {
    const gem = this.board.getCell(r, c);
    if (!gem) {
      el.innerHTML = '';
      return;
    }
    renderGem(el, gem.type, gem.special);
    if (gem.special !== 'none') {
      const badge = document.createElement('span');
      badge.className = 'gem-special-badge';
      const badges = { row: '⚡', col: '⚡', bomb: '💣', rainbow: '🌈' };
      badge.textContent = badges[gem.special] || '';
      el.appendChild(badge);
    }
    el.style.setProperty('--gem-glow', getGemGlow(gem.type));
  },

  refreshBoard() {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const el = this.cellEls[r]?.[c];
        if (el && !this.board.isBlocked(r, c)) {
          this.renderCell(el, r, c);
        }
      }
    }
  },

  // ─── Input Handling ───────────────────────────────────────────
  onCellClick(r, c) {
    if (this.state !== STATE.PLAYING) return;
    if (this.board.isBlocked(r, c)) return;

    // Boost mode
    if (this.activeBoost === 'hammer') {
      this.useHammer(r, c);
      return;
    }
    if (this.activeBoost === 'bomb') {
      this.useBomb(r, c);
      return;
    }

    // Normal selection
    if (!this.selectedCell) {
      this.selectCell(r, c);
    } else {
      const { r: sr, c: sc } = this.selectedCell;

      if (sr === r && sc === c) {
        // Deselect
        this.deselectCell();
      } else if (this.board.isAdjacent(sr, sc, r, c)) {
        // Try swap
        this.deselectCell();
        this.trySwap(sr, sc, r, c);
      } else {
        // Select new cell
        this.deselectCell();
        this.selectCell(r, c);
      }
    }
  },

  selectCell(r, c) {
    this.selectedCell = { r, c };
    const el = this.cellEls[r]?.[c];
    if (el) el.classList.add('selected');
  },

  deselectCell() {
    if (this.selectedCell) {
      const { r, c } = this.selectedCell;
      const el = this.cellEls[r]?.[c];
      if (el) el.classList.remove('selected');
    }
    this.selectedCell = null;
  },

  // ─── Swap & Match Processing ───────────────────────────────────
  async trySwap(r1, c1, r2, c2) {
    this.state = STATE.ANIMATING;

    this.board.swap(r1, c1, r2, c2);
    this.animateSwap(r1, c1, r2, c2);
    await this.delay(200);

    const matches = this.board.findMatches();

    if (matches.length === 0) {
      // Swap back + shake
      this.board.swap(r1, c1, r2, c2);
      this.refreshBoard();
      [this.cellEls[r1]?.[c1], this.cellEls[r2]?.[c2]].forEach(el => {
        if (el) {
          el.classList.add('invalid-swap');
          setTimeout(() => el.classList.remove('invalid-swap'), 400);
        }
      });
      await this.delay(350);
      this.state = STATE.PLAYING;
      return;
    }

    // Valid move - decrement moves
    if (this.currentLevel.moves) {
      this.moves--;
      this.updateHUD();
    }

    this.cascade = 0;
    await this.processMatches(matches, { r: r2, c: c2 });

    // Check win/loss
    if (!this.checkObjective()) {
      if (!this.board.hasValidMoves()) {
        if (this.currentLevel.moves && this.moves <= 0) {
          this.gameOver();
        } else {
          this.board.shuffle();
          this.refreshBoard();
          this.showCombo('Embaralhando!');
          await this.delay(500);
          this.state = STATE.PLAYING;
        }
      } else if (this.currentLevel.moves && this.moves <= 0) {
        this.gameOver();
      } else {
        this.state = STATE.PLAYING;
      }
    }
  },

  async processMatches(matches, swapCell = null) {
    if (matches.length === 0) return;

    // Animate matched gems
    matches.forEach(({ r, c }) => {
      const el = this.cellEls[r]?.[c];
      if (el) el.classList.add('matched');
    });

    await this.delay(280);

    // Burst particles
    this.burstParticles(matches);

    // Score
    const score = calcMatchScore(matches.length, this.cascade);
    this.addScore(score);

    // Show floating score
    if (matches.length > 0) {
      const mid = matches[Math.floor(matches.length / 2)];
      this.showScorePopup(score, mid.r, mid.c);
    }

    // Remove matches and create specials
    const { removed, created } = this.board.removeMatches(matches, swapCell);

    // Collect gems if objective (use removed which includes special expansions)
    if (this.currentLevel.objective.type === 'collect') {
      const targetType = this.currentLevel.objective.gemType;
      const cnt = removed.filter(g => g.type === targetType).length;
      this.collected += cnt;
    }

    // Cascade combo display
    this.cascade++;
    if (this.cascade >= 2) {
      this.showCombo(`COMBO x${this.cascade}!`);
    }

    this.refreshBoard();

    // Apply gravity
    const falls = this.board.applyGravity();
    falls.forEach(({ fromR, fromC, toR, toC }) => {
      const el = this.cellEls[toR]?.[toC];
      if (el) el.classList.add('falling');
    });
    await this.delay(260);
    falls.forEach(({ toR, toC }) => {
      const el = this.cellEls[toR]?.[toC];
      if (el) el.classList.remove('falling');
    });

    // Fill empty
    const newGems = this.board.fillEmpty();
    this.refreshBoard();
    newGems.forEach(({ r, c }) => {
      const el = this.cellEls[r]?.[c];
      if (el) {
        el.style.animation = 'none';
        requestAnimationFrame(() => {
          el.style.animation = '';
          const svg = el.querySelector('.gem-svg');
          if (svg) {
            svg.style.animation = 'gemAppear 0.3s cubic-bezier(0.34,1.56,0.64,1) both';
          }
        });
      }
    });
    await this.delay(260);

    // Update objective
    this.updateObjective();

    // Check for cascading matches
    const newMatches = this.board.findMatches();
    if (newMatches.length > 0) {
      await this.processMatches(newMatches, null);
    }
  },

  // ─── Animations ───────────────────────────────────────────────
  animateSwap(r1, c1, r2, c2) {
    const el1 = this.cellEls[r1]?.[c1];
    const el2 = this.cellEls[r2]?.[c2];
    if (el1) el1.classList.add('swapping');
    if (el2) el2.classList.add('swapping');
    setTimeout(() => {
      this.refreshBoard();
      if (el1) el1.classList.remove('swapping');
      if (el2) el2.classList.remove('swapping');
    }, 200);
  },

  showCombo(text) {
    const popup = document.getElementById('combo-popup');
    const textEl = document.getElementById('combo-text');
    textEl.textContent = text;
    popup.classList.remove('hidden');
    clearTimeout(this._comboTimer);
    this._comboTimer = setTimeout(() => {
      popup.classList.add('hidden');
    }, 900);
  },

  showScorePopup(score, r, c) {
    const boardFrame = document.querySelector('.board-frame');
    if (!boardFrame) return;
    const cellSize = 76; // approximate
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${score}`;
    popup.style.left = `${c * cellSize + cellSize / 2 + 8}px`;
    popup.style.top = `${r * cellSize + cellSize / 2 + 8}px`;
    boardFrame.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
  },

  // ─── Particle System ──────────────────────────────────────────
  burstParticles(matches) {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 72;
    const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap')) || 4;
    const padding = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--board-padding')) || 8;

    const particles = [];
    matches.forEach(({ r, c }) => {
      const gem = GEMS[this.board.getCell(r, c)?.type] || GEMS[0];
      const x = padding + c * (cellSize + gap) + cellSize / 2;
      const y = padding + r * (cellSize + gap) + cellSize / 2;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
        const speed = 2 + Math.random() * 3;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 4,
          color: gem.color,
          alpha: 1,
          life: 1
        });
      }
    });

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.035;
        p.alpha = Math.max(0, p.life);
        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      if (alive && frame++ < 60) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    requestAnimationFrame(animate);
  },

  // ─── Score & HUD ──────────────────────────────────────────────
  addScore(points) {
    const prev = this.score;
    this.score += points;
    this.animateCounter('hud-score', prev, this.score, 400);
    this.updateObjective();
  },

  animateCounter(elId, from, to, duration) {
    const el = document.getElementById(elId);
    if (!el) return;
    const start = performance.now();
    const update = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  updateHUD() {
    const level = this.currentLevel;
    document.getElementById('hud-level').textContent = level.id;
    document.getElementById('hud-score').textContent = this.score.toLocaleString();

    if (level.moves) {
      document.getElementById('hud-moves').textContent = this.moves;
      const movesEl = document.getElementById('hud-moves');
      movesEl.style.color = this.moves <= 5 ? '#e53935' : '';
    } else if (level.time) {
      document.getElementById('hud-moves').textContent = this.formatTime(this.timeLeft);
    } else {
      document.getElementById('hud-moves').textContent = '∞';
    }

    // Lives
    const heartsEl = document.getElementById('hud-lives');
    heartsEl.querySelectorAll('.life-heart').forEach((h, i) => {
      h.classList.toggle('active', i < this.lives);
    });
  },

  updateObjective() {
    const obj = this.currentLevel.objective;
    const target = obj.target;
    let current = 0;
    let text = '';

    if (obj.type === 'score') {
      current = this.score;
      text = `Alcance ${target.toLocaleString()} pontos`;
    } else if (obj.type === 'collect') {
      current = this.collected;
      text = `Colete ${target} ${obj.label || 'gemas'}`;
    }

    const pct = Math.min(100, Math.round((current / target) * 100));
    document.getElementById('obj-text').textContent = text;
    document.getElementById('obj-fill').style.width = `${pct}%`;
    document.getElementById('obj-percent').textContent = `${pct}%`;
  },

  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  // ─── Timer ────────────────────────────────────────────────────
  startTimer() {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      if (this.state !== STATE.PLAYING) return;
      this.timeLeft--;
      this.updateHUD();
      if (this.timeLeft <= 0) {
        this.clearTimer();
        if (!this.checkObjective()) {
          this.gameOver();
        }
      }
    }, 1000);
  },

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  // ─── Win/Loss Conditions ──────────────────────────────────────
  checkObjective() {
    const obj = this.currentLevel.objective;
    let achieved = false;

    if (obj.type === 'score') {
      achieved = this.score >= obj.target;
    } else if (obj.type === 'collect') {
      achieved = this.collected >= obj.target;
    }

    if (achieved) {
      this.levelComplete();
      return true;
    }
    return false;
  },

  levelComplete() {
    this.state = STATE.COMPLETE;
    this.clearTimer();

    const stars = calcStars(this.currentLevel, this.score);
    this.progress.setLevelStars(this.currentLevel.id, stars);

    setTimeout(() => {
      this.showLevelComplete(stars);
    }, 500);
  },

  showLevelComplete(stars) {
    document.getElementById('complete-score').textContent = this.score.toLocaleString();

    // Animate stars
    for (let i = 1; i <= 3; i++) {
      const el = document.getElementById(`star-${i}`);
      el.classList.remove('earned');
    }
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => {
        document.getElementById(`star-${i}`).classList.add('earned');
      }, i * 250);
    }

    this.showOverlay('overlay-complete');
  },

  gameOver() {
    this.state = STATE.GAME_OVER;
    this.clearTimer();

    let msg = 'Sem movimentos disponíveis';
    if (this.currentLevel.time && this.timeLeft <= 0) {
      msg = 'O tempo acabou!';
    } else if (this.currentLevel.moves && this.moves <= 0) {
      msg = 'Sem jogadas restantes';
    }

    document.getElementById('gameover-msg').textContent = msg;
    this.showOverlay('overlay-gameover');
  },

  // ─── Game Listeners ───────────────────────────────────────────
  setupGameListeners() {
    document.getElementById('btn-pause').addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-restart').addEventListener('click', () => {
      this.hideOverlays();
      this.startLevel(this.currentLevel.id);
    });
    document.getElementById('btn-quit').addEventListener('click', () => {
      this.clearTimer();
      this.hideOverlays();
      this.showScreen('menu');
    });

    document.getElementById('btn-next-level').addEventListener('click', () => {
      const next = Math.min(this.currentLevel.id + 1, 50);
      this.hideOverlays();
      this.startLevel(next);
    });
    document.getElementById('btn-replay').addEventListener('click', () => {
      this.hideOverlays();
      this.startLevel(this.currentLevel.id);
    });

    document.getElementById('btn-try-again').addEventListener('click', () => {
      this.hideOverlays();
      this.startLevel(this.currentLevel.id);
    });
    document.getElementById('btn-goto-menu').addEventListener('click', () => {
      this.clearTimer();
      this.hideOverlays();
      this.showScreen('menu');
    });
  },

  pauseGame() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.PAUSED;
    this.clearTimer();
    this.showOverlay('overlay-pause');
  },

  resumeGame() {
    this.hideOverlays();
    this.state = STATE.PLAYING;
    if (this.currentLevel.time && this.timeLeft > 0) {
      this.startTimer();
    }
  },

  // ─── Boost System ─────────────────────────────────────────────
  setupBoostListeners() {
    document.getElementById('boost-hammer').addEventListener('click', () => this.toggleBoost('hammer'));
    document.getElementById('boost-shuffle').addEventListener('click', () => this.useShuffleboost());
    document.getElementById('boost-bomb').addEventListener('click', () => this.toggleBoost('bomb'));
  },

  toggleBoost(type) {
    if (this.state !== STATE.PLAYING) return;
    if (this.boosts[type] <= 0) return;

    if (this.activeBoost === type) {
      this.activeBoost = null;
      document.querySelectorAll('.boost-btn').forEach(b => b.classList.remove('active-boost'));
    } else {
      this.activeBoost = type;
      document.querySelectorAll('.boost-btn').forEach(b => b.classList.remove('active-boost'));
      const el = document.getElementById(`boost-${type}`);
      if (el) el.classList.add('active-boost');
    }
  },

  useHammer(r, c) {
    if (this.boosts.hammer <= 0) return;
    const gem = this.board.removeSingle(r, c);
    if (!gem) return;

    this.boosts.hammer--;
    document.getElementById('boost-count-hammer').textContent = this.boosts.hammer;
    this.activeBoost = null;
    document.querySelectorAll('.boost-btn').forEach(b => b.classList.remove('active-boost'));

    if (this.currentLevel.objective.type === 'collect' && gem.type === this.currentLevel.objective.gemType) {
      this.collected++;
    }
    this.addScore(100);

    // Animate
    const el = this.cellEls[r]?.[c];
    if (el) {
      el.classList.add('matched');
      setTimeout(() => {
        this.refreshBoard();
        el.classList.remove('matched');
        this.processAfterRemoval();
      }, 350);
    } else {
      this.processAfterRemoval();
    }
  },

  async useShuffleboost() {
    if (this.state !== STATE.PLAYING) return;
    if (this.boosts.shuffle <= 0) return;
    this.boosts.shuffle--;
    document.getElementById('boost-count-shuffle').textContent = this.boosts.shuffle;
    this.board.shuffle();
    this.refreshBoard();
    this.showCombo('Embaralhando!');
  },

  useBomb(r, c) {
    if (this.boosts.bomb <= 0) return;
    // Clear 3x3 area
    const area = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !this.board.isBlocked(nr, nc) && this.board.getCell(nr, nc)) {
          area.push({ r: nr, c: nc });
        }
      }
    }

    this.boosts.bomb--;
    document.getElementById('boost-count-bomb').textContent = this.boosts.bomb;
    this.activeBoost = null;
    document.querySelectorAll('.boost-btn').forEach(b => b.classList.remove('active-boost'));

    area.forEach(({ r: nr, c: nc }) => {
      const el = this.cellEls[nr]?.[nc];
      if (el) el.classList.add('matched');
      if (this.currentLevel.objective.type === 'collect') {
        const gem = this.board.getCell(nr, nc);
        if (gem && gem.type === this.currentLevel.objective.gemType) this.collected++;
      }
      this.board.removeSingle(nr, nc);
    });

    this.burstParticles(area);
    this.addScore(area.length * 80);
    this.showCombo('BOMBA!');

    setTimeout(() => {
      area.forEach(({ r: nr, c: nc }) => {
        const el = this.cellEls[nr]?.[nc];
        if (el) el.classList.remove('matched');
      });
      this.processAfterRemoval();
    }, 350);
  },

  async processAfterRemoval() {
    this.state = STATE.ANIMATING;
    this.board.applyGravity();
    this.board.fillEmpty();
    this.refreshBoard();

    await this.delay(300);

    const newMatches = this.board.findMatches();
    if (newMatches.length > 0) {
      await this.processMatches(newMatches);
    }

    this.updateObjective();
    if (!this.checkObjective()) {
      this.state = STATE.PLAYING;
    }
  },

  // ─── Utilities ────────────────────────────────────────────────
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// ─── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
