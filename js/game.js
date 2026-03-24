/**
 * BIJULED · Main Game Controller
 * iOS 9 compatible: no async/await, no ?., no NodeList.forEach
 */

// ─── State Machine ────────────────────────────────────────────────
var STATE = {
  MENU: 'menu',
  LEVEL_SELECT: 'level_select',
  PLAYING: 'playing',
  ANIMATING: 'animating',
  PAUSED: 'paused',
  COMPLETE: 'complete',
  GAME_OVER: 'game_over'
};

// ─── Helper: safe cell element lookup (replaces ?. chaining) ──────
function cellEl(cellEls, r, c) {
  return (cellEls[r] && cellEls[r][c]) || null;
}

// ─── Helper: forEach on NodeList/HTMLCollection (iOS 9) ───────────
function eachEl(list, fn) {
  Array.prototype.forEach.call(list, fn);
}

// ─── Game Object ──────────────────────────────────────────────────
var Game = {
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
  init: function() {
    this.progress = Progress.load();
    this.setupMenuListeners();
    this.setupGameListeners();
    this.setupBoostListeners();
    this.renderBgGems();
    this.showScreen('menu');
  },

  // ─── Screen Management ────────────────────────────────────────
  showScreen: function(name) {
    eachEl(document.querySelectorAll('.screen'), function(s) {
      s.classList.remove('active');
    });
    var map = { menu: 'screen-menu', levels: 'screen-levels', game: 'screen-game' };
    var el = document.getElementById(map[name]);
    if (el) {
      requestAnimationFrame(function() { el.classList.add('active'); });
    }
  },

  showOverlay: function(id) {
    eachEl(document.querySelectorAll('.overlay'), function(o) {
      o.classList.add('hidden');
    });
    var el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },

  hideOverlays: function() {
    eachEl(document.querySelectorAll('.overlay'), function(o) {
      o.classList.add('hidden');
    });
  },

  // ─── Menu ─────────────────────────────────────────────────────
  setupMenuListeners: function() {
    var self = this;
    document.getElementById('btn-play').addEventListener('click', function() {
      var next = Math.min(self.progress.data.maxLevel, 50);
      self.startLevel(next);
    });
    document.getElementById('btn-levels').addEventListener('click', function() {
      self.renderLevelSelect();
      self.showScreen('levels');
    });
    document.getElementById('btn-back-menu').addEventListener('click', function() {
      self.showScreen('menu');
    });
  },

  renderBgGems: function() {
    var container = document.getElementById('bg-gems');
    container.innerHTML = '';
    for (var i = 0; i < 16; i++) {
      var div = document.createElement('div');
      div.className = 'bg-gem-particle';
      var typeId = Math.floor(Math.random() * 6);
      div.innerHTML = createGem(GEM_IDS[typeId]);
      var size = 30 + Math.random() * 50;
      div.style.cssText = [
        'left:' + (Math.random() * 100) + '%',
        'bottom:-' + size + 'px',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'animation-duration:' + (8 + Math.random() * 15) + 's',
        'animation-delay:-' + (Math.random() * 20) + 's'
      ].join(';');
      container.appendChild(div);
    }
  },

  // ─── Level Select ─────────────────────────────────────────────
  renderLevelSelect: function() {
    var self = this;
    var container = document.getElementById('levels-container');
    container.innerHTML = '';

    CHAPTERS.forEach(function(chapter) {
      var block = document.createElement('div');
      block.className = 'chapter-block';

      var title = document.createElement('div');
      title.className = 'chapter-title';
      title.textContent = chapter.name;
      title.style.color = chapter.color;
      block.appendChild(title);

      var grid = document.createElement('div');
      grid.className = 'levels-grid';

      for (var id = chapter.levels[0]; id <= chapter.levels[1]; id++) {
        (function(levelId) {
          var btn = document.createElement('button');
          btn.className = 'level-btn';

          var unlocked = self.progress.isUnlocked(levelId);
          var completed = self.progress.isCompleted(levelId);
          var stars = self.progress.getLevelStars(levelId);

          if (completed) btn.classList.add('completed');
          else if (unlocked) btn.classList.add('unlocked');
          else btn.classList.add('locked');

          if (completed || unlocked) {
            btn.addEventListener('click', function() {
              self.startLevel(levelId);
            });
          }

          var numEl = document.createElement('span');
          numEl.className = 'level-num';
          numEl.textContent = levelId;

          var starsEl = document.createElement('span');
          starsEl.className = 'level-stars';
          if (stars > 0) {
            starsEl.textContent = repeat('★', stars) + repeat('☆', 3 - stars);
          } else {
            starsEl.textContent = unlocked ? '☆☆☆' : '🔒';
          }

          btn.appendChild(numEl);
          btn.appendChild(starsEl);
          grid.appendChild(btn);
        })(id);
      }

      block.appendChild(grid);
      container.appendChild(block);
    });
  },

  // ─── Game Setup ───────────────────────────────────────────────
  startLevel: function(levelId) {
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
  renderBoard: function() {
    var self = this;
    var boardEl = document.getElementById('game-board');
    boardEl.innerHTML = '';
    this.cellEls = [];

    var canvas = document.getElementById('particle-canvas');
    var cellSize = 72;
    var cellGap = 4;
    var boardPad = 8;
    var boardPx = 8 * cellSize + 7 * cellGap;
    var framePx = boardPx + 2 * boardPad;
    canvas.width = framePx;
    canvas.height = framePx;

    for (var r = 0; r < 8; r++) {
      this.cellEls[r] = [];
      for (var c = 0; c < 8; c++) {
        (function(row, col) {
          var cell = document.createElement('div');
          cell.className = 'gem-cell';
          cell.setAttribute('data-row', row);
          cell.setAttribute('data-col', col);

          if (self.board.isBlocked(row, col)) {
            cell.classList.add('blocked');
          } else {
            cell.addEventListener('click', function() {
              self.onCellClick(row, col);
            });

            cell.addEventListener('touchstart', function(e) {
              e.preventDefault();
              var t = e.touches[0];
              self._touchStartX = t.clientX;
              self._touchStartY = t.clientY;
              self._touchStartRow = row;
              self._touchStartCol = col;
            }, false);

            cell.addEventListener('touchend', function(e) {
              e.preventDefault();
              var t = e.changedTouches[0];
              var dx = t.clientX - self._touchStartX;
              var dy = t.clientY - self._touchStartY;
              var dist = Math.sqrt(dx * dx + dy * dy);
              var sr = self._touchStartRow;
              var sc = self._touchStartCol;

              if (dist < 12) {
                self.onCellClick(sr, sc);
              } else {
                if (self.state !== STATE.PLAYING) return;
                var absDx = Math.abs(dx);
                var absDy = Math.abs(dy);
                var tr = sr, tc = sc;
                if (absDx > absDy) {
                  tc = dx > 0 ? sc + 1 : sc - 1;
                } else {
                  tr = dy > 0 ? sr + 1 : sr - 1;
                }
                if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && !self.board.isBlocked(tr, tc)) {
                  self.deselectCell();
                  self.trySwap(sr, sc, tr, tc);
                }
              }
            }, false);

            self.renderCell(cell, row, col);
          }

          boardEl.appendChild(cell);
          self.cellEls[row][col] = cell;
        })(r, c);
      }
    }
  },

  renderCell: function(el, r, c) {
    var gem = this.board.getCell(r, c);
    if (!gem) { el.innerHTML = ''; return; }
    renderGem(el, gem.type, gem.special);
    if (gem.special !== 'none') {
      var badge = document.createElement('span');
      badge.className = 'gem-special-badge';
      var badges = { row: '⚡', col: '⚡', bomb: '💣', rainbow: '🌈' };
      badge.textContent = badges[gem.special] || '';
      el.appendChild(badge);
    }
    el.style.setProperty('--gem-glow', getGemGlow(gem.type));
  },

  refreshBoard: function() {
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var el = cellEl(this.cellEls, r, c);
        if (el && !this.board.isBlocked(r, c)) {
          this.renderCell(el, r, c);
        }
      }
    }
  },

  // ─── Input Handling ───────────────────────────────────────────
  onCellClick: function(r, c) {
    if (this.state !== STATE.PLAYING) return;
    if (this.board.isBlocked(r, c)) return;

    if (this.activeBoost === 'hammer') { this.useHammer(r, c); return; }
    if (this.activeBoost === 'bomb') { this.useBomb(r, c); return; }

    if (!this.selectedCell) {
      this.selectCell(r, c);
    } else {
      var sr = this.selectedCell.r;
      var sc = this.selectedCell.c;
      if (sr === r && sc === c) {
        this.deselectCell();
      } else if (this.board.isAdjacent(sr, sc, r, c)) {
        this.deselectCell();
        this.trySwap(sr, sc, r, c);
      } else {
        this.deselectCell();
        this.selectCell(r, c);
      }
    }
  },

  selectCell: function(r, c) {
    this.selectedCell = { r: r, c: c };
    var el = cellEl(this.cellEls, r, c);
    if (el) el.classList.add('selected');
  },

  deselectCell: function() {
    if (this.selectedCell) {
      var el = cellEl(this.cellEls, this.selectedCell.r, this.selectedCell.c);
      if (el) el.classList.remove('selected');
    }
    this.selectedCell = null;
  },

  // ─── Swap & Match Processing (Promise chains — no async/await) ─
  trySwap: function(r1, c1, r2, c2) {
    var self = this;
    self.state = STATE.ANIMATING;
    self.board.swap(r1, c1, r2, c2);
    self.animateSwap(r1, c1, r2, c2);

    return self.delay(200).then(function() {
      var matches = self.board.findMatches();

      if (matches.length === 0) {
        self.board.swap(r1, c1, r2, c2);
        self.refreshBoard();
        var el1 = cellEl(self.cellEls, r1, c1);
        var el2 = cellEl(self.cellEls, r2, c2);
        if (el1) { el1.classList.add('invalid-swap'); setTimeout(function() { el1.classList.remove('invalid-swap'); }, 400); }
        if (el2) { el2.classList.add('invalid-swap'); setTimeout(function() { el2.classList.remove('invalid-swap'); }, 400); }
        return self.delay(350).then(function() {
          self.state = STATE.PLAYING;
        });
      }

      if (self.currentLevel.moves) {
        self.moves--;
        self.updateHUD();
      }

      self.cascade = 0;
      return self.processMatches(matches, { r: r2, c: c2 }).then(function() {
        if (!self.checkObjective()) {
          if (!self.board.hasValidMoves()) {
            if (self.currentLevel.moves && self.moves <= 0) {
              self.gameOver();
            } else {
              self.board.shuffle();
              self.refreshBoard();
              self.showCombo('Embaralhando!');
              return self.delay(500).then(function() {
                self.state = STATE.PLAYING;
              });
            }
          } else if (self.currentLevel.moves && self.moves <= 0) {
            self.gameOver();
          } else {
            self.state = STATE.PLAYING;
          }
        }
      });
    });
  },

  processMatches: function(matches, swapCell) {
    var self = this;
    if (matches.length === 0) return Promise.resolve();

    matches.forEach(function(m) {
      var el = cellEl(self.cellEls, m.r, m.c);
      if (el) el.classList.add('matched');
    });

    return self.delay(280).then(function() {
      self.burstParticles(matches);

      var score = calcMatchScore(matches.length, self.cascade);
      self.addScore(score);

      if (matches.length > 0) {
        var mid = matches[Math.floor(matches.length / 2)];
        self.showScorePopup(score, mid.r, mid.c);
      }

      var result = self.board.removeMatches(matches, swapCell || null);
      var removed = result.removed;

      if (self.currentLevel.objective.type === 'collect') {
        var targetType = self.currentLevel.objective.gemType;
        removed.forEach(function(g) {
          if (g.type === targetType) self.collected++;
        });
      }

      self.cascade++;
      if (self.cascade >= 2) self.showCombo('COMBO x' + self.cascade + '!');

      self.refreshBoard();

      var falls = self.board.applyGravity();
      falls.forEach(function(f) {
        var el = cellEl(self.cellEls, f.toR, f.toC);
        if (el) el.classList.add('falling');
      });

      return self.delay(260).then(function() {
        falls.forEach(function(f) {
          var el = cellEl(self.cellEls, f.toR, f.toC);
          if (el) el.classList.remove('falling');
        });

        var newGems = self.board.fillEmpty();
        self.refreshBoard();
        newGems.forEach(function(ng) {
          var el = cellEl(self.cellEls, ng.r, ng.c);
          if (el) {
            var svg = el.querySelector('.gem-svg');
            if (svg) {
              svg.style.webkitAnimation = 'none';
              svg.style.animation = 'none';
              requestAnimationFrame(function() {
                svg.style.webkitAnimation = 'gemAppear 0.3s cubic-bezier(0.34,1.56,0.64,1) both';
                svg.style.animation = 'gemAppear 0.3s cubic-bezier(0.34,1.56,0.64,1) both';
              });
            }
          }
        });

        return self.delay(260).then(function() {
          self.updateObjective();
          var newMatches = self.board.findMatches();
          if (newMatches.length > 0) {
            return self.processMatches(newMatches, null);
          }
        });
      });
    });
  },

  // ─── Animations ───────────────────────────────────────────────
  animateSwap: function(r1, c1, r2, c2) {
    var self = this;
    var el1 = cellEl(self.cellEls, r1, c1);
    var el2 = cellEl(self.cellEls, r2, c2);
    if (el1) el1.classList.add('swapping');
    if (el2) el2.classList.add('swapping');
    setTimeout(function() {
      self.refreshBoard();
      if (el1) el1.classList.remove('swapping');
      if (el2) el2.classList.remove('swapping');
    }, 200);
  },

  showCombo: function(text) {
    var self = this;
    var popup = document.getElementById('combo-popup');
    var textEl = document.getElementById('combo-text');
    textEl.textContent = text;
    popup.classList.remove('hidden');
    clearTimeout(this._comboTimer);
    this._comboTimer = setTimeout(function() {
      popup.classList.add('hidden');
    }, 900);
  },

  showScorePopup: function(score, r, c) {
    var boardFrame = document.querySelector('.board-frame');
    if (!boardFrame) return;
    var cellSize = 76;
    var popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + score;
    popup.style.left = (c * cellSize + cellSize / 2 + 8) + 'px';
    popup.style.top = (r * cellSize + cellSize / 2 + 8) + 'px';
    boardFrame.appendChild(popup);
    setTimeout(function() { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 1000);
  },

  // ─── Particle System ──────────────────────────────────────────
  burstParticles: function(matches) {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var cellSize = 72;
    var gap = 4;
    var padding = 8;

    var particles = [];
    var self = this;
    matches.forEach(function(m) {
      var gem = GEMS[self.board.getCell(m.r, m.c) ? self.board.getCell(m.r, m.c).type : 0] || GEMS[0];
      var x = padding + m.c * (cellSize + gap) + cellSize / 2;
      var y = padding + m.r * (cellSize + gap) + cellSize / 2;
      for (var i = 0; i < 7; i++) {
        var angle = (Math.PI * 2 * i / 7) + Math.random() * 0.3;
        var speed = 2 + Math.random() * 3;
        particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 4,
          color: gem.color,
          life: 1
        });
      }
    });

    var frame = 0;
    var animate = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      particles.forEach(function(p) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.04;
        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
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
  addScore: function(points) {
    var prev = this.score;
    this.score += points;
    this.animateCounter('hud-score', prev, this.score, 400);
    this.updateObjective();
  },

  animateCounter: function(elId, from, to, duration) {
    var el = document.getElementById(elId);
    if (!el) return;
    var start = Date.now();
    var update = function() {
      var t = Math.min((Date.now() - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  updateHUD: function() {
    var level = this.currentLevel;
    document.getElementById('hud-level').textContent = level.id;
    document.getElementById('hud-score').textContent = this.score.toLocaleString();

    var movesEl = document.getElementById('hud-moves');
    if (level.moves) {
      movesEl.textContent = this.moves;
      movesEl.style.color = this.moves <= 5 ? '#e53935' : '';
    } else if (level.time) {
      movesEl.textContent = this.formatTime(this.timeLeft);
    } else {
      movesEl.textContent = '∞';
    }

    var heartsEl = document.getElementById('hud-lives');
    var hearts = heartsEl.querySelectorAll('.life-heart');
    var lives = this.lives;
    eachEl(hearts, function(h, i) {
      if (i < lives) h.classList.add('active');
      else h.classList.remove('active');
    });
  },

  updateObjective: function() {
    var obj = this.currentLevel.objective;
    var target = obj.target;
    var current = 0;
    var text = '';

    if (obj.type === 'score') {
      current = this.score;
      text = 'Alcance ' + target.toLocaleString() + ' pontos';
    } else if (obj.type === 'collect') {
      current = this.collected;
      text = 'Colete ' + target + ' ' + (obj.label || 'gemas');
    }

    var pct = Math.min(100, Math.round((current / target) * 100));
    document.getElementById('obj-text').textContent = text;
    document.getElementById('obj-fill').style.width = pct + '%';
    document.getElementById('obj-percent').textContent = pct + '%';
  },

  formatTime: function(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  },

  // ─── Timer ────────────────────────────────────────────────────
  startTimer: function() {
    var self = this;
    self.clearTimer();
    self.timerInterval = setInterval(function() {
      if (self.state !== STATE.PLAYING) return;
      self.timeLeft--;
      self.updateHUD();
      if (self.timeLeft <= 0) {
        self.clearTimer();
        if (!self.checkObjective()) self.gameOver();
      }
    }, 1000);
  },

  clearTimer: function() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  // ─── Win/Loss Conditions ──────────────────────────────────────
  checkObjective: function() {
    var obj = this.currentLevel.objective;
    var achieved = false;
    if (obj.type === 'score') achieved = this.score >= obj.target;
    else if (obj.type === 'collect') achieved = this.collected >= obj.target;
    if (achieved) { this.levelComplete(); return true; }
    return false;
  },

  levelComplete: function() {
    this.state = STATE.COMPLETE;
    this.clearTimer();
    var stars = calcStars(this.currentLevel, this.score);
    this.progress.setLevelStars(this.currentLevel.id, stars);
    var self = this;
    setTimeout(function() { self.showLevelComplete(stars); }, 500);
  },

  showLevelComplete: function(stars) {
    document.getElementById('complete-score').textContent = this.score.toLocaleString();
    for (var i = 1; i <= 3; i++) {
      var el = document.getElementById('star-' + i);
      if (el) el.classList.remove('earned');
    }
    for (var j = 1; j <= stars; j++) {
      (function(idx) {
        setTimeout(function() {
          var el = document.getElementById('star-' + idx);
          if (el) el.classList.add('earned');
        }, idx * 250);
      })(j);
    }
    this.showOverlay('overlay-complete');
  },

  gameOver: function() {
    this.state = STATE.GAME_OVER;
    this.clearTimer();
    var msg = 'Sem movimentos disponíveis';
    if (this.currentLevel.time && this.timeLeft <= 0) msg = 'O tempo acabou!';
    else if (this.currentLevel.moves && this.moves <= 0) msg = 'Sem jogadas restantes';
    document.getElementById('gameover-msg').textContent = msg;
    this.showOverlay('overlay-gameover');
  },

  // ─── Game Listeners ───────────────────────────────────────────
  setupGameListeners: function() {
    var self = this;
    document.getElementById('btn-pause').addEventListener('click', function() { self.pauseGame(); });
    document.getElementById('btn-resume').addEventListener('click', function() { self.resumeGame(); });
    document.getElementById('btn-restart').addEventListener('click', function() {
      self.hideOverlays();
      self.startLevel(self.currentLevel.id);
    });
    document.getElementById('btn-quit').addEventListener('click', function() {
      self.clearTimer(); self.hideOverlays(); self.showScreen('menu');
    });
    document.getElementById('btn-next-level').addEventListener('click', function() {
      var next = Math.min(self.currentLevel.id + 1, 50);
      self.hideOverlays();
      self.startLevel(next);
    });
    document.getElementById('btn-replay').addEventListener('click', function() {
      self.hideOverlays(); self.startLevel(self.currentLevel.id);
    });
    document.getElementById('btn-try-again').addEventListener('click', function() {
      self.hideOverlays(); self.startLevel(self.currentLevel.id);
    });
    document.getElementById('btn-goto-menu').addEventListener('click', function() {
      self.clearTimer(); self.hideOverlays(); self.showScreen('menu');
    });
  },

  pauseGame: function() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.PAUSED;
    this.clearTimer();
    this.showOverlay('overlay-pause');
  },

  resumeGame: function() {
    this.hideOverlays();
    this.state = STATE.PLAYING;
    if (this.currentLevel.time && this.timeLeft > 0) this.startTimer();
  },

  // ─── Boost System ─────────────────────────────────────────────
  setupBoostListeners: function() {
    var self = this;
    document.getElementById('boost-hammer').addEventListener('click', function() { self.toggleBoost('hammer'); });
    document.getElementById('boost-shuffle').addEventListener('click', function() { self.useShuffleboost(); });
    document.getElementById('boost-bomb').addEventListener('click', function() { self.toggleBoost('bomb'); });
  },

  toggleBoost: function(type) {
    if (this.state !== STATE.PLAYING) return;
    if (this.boosts[type] <= 0) return;
    if (this.activeBoost === type) {
      this.activeBoost = null;
      eachEl(document.querySelectorAll('.boost-btn'), function(b) { b.classList.remove('active-boost'); });
    } else {
      this.activeBoost = type;
      eachEl(document.querySelectorAll('.boost-btn'), function(b) { b.classList.remove('active-boost'); });
      var el = document.getElementById('boost-' + type);
      if (el) el.classList.add('active-boost');
    }
  },

  useHammer: function(r, c) {
    var self = this;
    if (self.boosts.hammer <= 0) return;
    var gem = self.board.removeSingle(r, c);
    if (!gem) return;
    self.boosts.hammer--;
    document.getElementById('boost-count-hammer').textContent = self.boosts.hammer;
    self.activeBoost = null;
    eachEl(document.querySelectorAll('.boost-btn'), function(b) { b.classList.remove('active-boost'); });
    if (self.currentLevel.objective.type === 'collect' && gem.type === self.currentLevel.objective.gemType) self.collected++;
    self.addScore(100);
    var el = cellEl(self.cellEls, r, c);
    if (el) {
      el.classList.add('matched');
      setTimeout(function() {
        self.refreshBoard();
        el.classList.remove('matched');
        self.processAfterRemoval();
      }, 350);
    } else {
      self.processAfterRemoval();
    }
  },

  useShuffleboost: function() {
    if (this.state !== STATE.PLAYING) return;
    if (this.boosts.shuffle <= 0) return;
    this.boosts.shuffle--;
    document.getElementById('boost-count-shuffle').textContent = this.boosts.shuffle;
    this.board.shuffle();
    this.refreshBoard();
    this.showCombo('Embaralhando!');
  },

  useBomb: function(r, c) {
    var self = this;
    if (self.boosts.bomb <= 0) return;
    var area = [];
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        var nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !self.board.isBlocked(nr, nc) && self.board.getCell(nr, nc)) {
          area.push({ r: nr, c: nc });
        }
      }
    }
    self.boosts.bomb--;
    document.getElementById('boost-count-bomb').textContent = self.boosts.bomb;
    self.activeBoost = null;
    eachEl(document.querySelectorAll('.boost-btn'), function(b) { b.classList.remove('active-boost'); });
    area.forEach(function(pos) {
      var el = cellEl(self.cellEls, pos.r, pos.c);
      if (el) el.classList.add('matched');
      if (self.currentLevel.objective.type === 'collect') {
        var gem = self.board.getCell(pos.r, pos.c);
        if (gem && gem.type === self.currentLevel.objective.gemType) self.collected++;
      }
      self.board.removeSingle(pos.r, pos.c);
    });
    self.burstParticles(area);
    self.addScore(area.length * 80);
    self.showCombo('BOMBA!');
    setTimeout(function() {
      area.forEach(function(pos) {
        var el = cellEl(self.cellEls, pos.r, pos.c);
        if (el) el.classList.remove('matched');
      });
      self.processAfterRemoval();
    }, 350);
  },

  processAfterRemoval: function() {
    var self = this;
    self.state = STATE.ANIMATING;
    self.board.applyGravity();
    self.board.fillEmpty();
    self.refreshBoard();
    return self.delay(300).then(function() {
      var newMatches = self.board.findMatches();
      if (newMatches.length > 0) {
        return self.processMatches(newMatches).then(function() {
          self.updateObjective();
          if (!self.checkObjective()) self.state = STATE.PLAYING;
        });
      }
      self.updateObjective();
      if (!self.checkObjective()) self.state = STATE.PLAYING;
    });
  },

  // ─── Utilities ────────────────────────────────────────────────
  delay: function(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }
};

// ─── String repeat polyfill (iOS 9 has it, but just in case) ──────
function repeat(str, n) {
  var out = '';
  for (var i = 0; i < n; i++) out += str;
  return out;
}

// ─── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  Game.init();
});
