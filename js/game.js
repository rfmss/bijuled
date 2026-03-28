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
  return cellEls[r] && cellEls[r][c] || null;
}

// ─── Helper: walk up DOM to find .gem-cell (no Element.closest on iOS9) ──
function findGemCell(el) {
  while (el && el !== document.body) {
    if (el.classList && el.classList.contains('gem-cell')) return el;
    el = el.parentElement;
  }
  return null;
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
  boosts: {
    hammer: 3,
    shuffle: 2,
    bomb: 1
  },
  activeBoost: null,
  selectedCell: null,
  progress: null,
  cellEls: [],
  _touchStartX: 0,
  _touchStartY: 0,
  _touchStartRow: -1,
  _touchStartCol: -1,
  // Drag ghost state
  _dragging: false,
  _dragRow: -1,
  _dragCol: -1,
  _dragStartX: 0,
  _dragStartY: 0,
  _dragGhost: null,
  _dragLastOverEl: null,
  _dragTargetRow: -1,
  _dragTargetCol: -1,
  _onMouseMoveDrag: null,
  _onMouseUpDrag: null,
  _onTouchMoveDrag: null,
  _onTouchEndDrag: null,
  // ─── Init ─────────────────────────────────────────────────────
  init: function init() {
    this.progress = Progress.load();
    this.setupMenuListeners();
    this.setupGameListeners();
    this.setupBoostListeners();
    this.renderBgGems();
    this.showScreen('menu');
  },
  // ─── Screen Management ────────────────────────────────────────
  showScreen: function showScreen(name) {
    eachEl(document.querySelectorAll('.screen'), function (s) {
      s.classList.remove('active');
    });
    var map = {
      menu: 'screen-menu',
      levels: 'screen-levels',
      game: 'screen-game'
    };
    var el = document.getElementById(map[name]);
    if (el) {
      requestAnimationFrame(function () {
        el.classList.add('active');
      });
    }
  },
  showOverlay: function showOverlay(id) {
    eachEl(document.querySelectorAll('.overlay'), function (o) {
      o.classList.add('hidden');
    });
    var el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },
  hideOverlays: function hideOverlays() {
    eachEl(document.querySelectorAll('.overlay'), function (o) {
      o.classList.add('hidden');
    });
  },
  // ─── Menu ─────────────────────────────────────────────────────
  setupMenuListeners: function setupMenuListeners() {
    var self = this;
    document.getElementById('btn-play').addEventListener('click', function () {
      RadioBG.init({ volume: 0.22 });
      var next = Math.min(self.progress.data.maxLevel, 50);
      self.startLevel(next);
    });
    document.getElementById('btn-levels').addEventListener('click', function () {
      self.renderLevelSelect();
      self.showScreen('levels');
    });
    document.getElementById('btn-back-menu').addEventListener('click', function () {
      self.showScreen('menu');
    });
  },
  renderBgGems: function renderBgGems() {
    var container = document.getElementById('bg-gems');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < 16; i++) {
      var div = document.createElement('div');
      div.className = 'bg-gem-particle';
      var typeId = Math.floor(Math.random() * 6);
      div.innerHTML = createGem(GEM_IDS[typeId]);
      var size = 30 + Math.random() * 50;
      div.style.cssText = ['left:' + Math.random() * 100 + '%', 'bottom:-' + size + 'px', 'width:' + size + 'px', 'height:' + size + 'px', 'animation-duration:' + (8 + Math.random() * 15) + 's', 'animation-delay:-' + Math.random() * 20 + 's'].join(';');
      container.appendChild(div);
    }
  },
  // ─── Level Select ─────────────────────────────────────────────
  renderLevelSelect: function renderLevelSelect() {
    var self = this;
    var container = document.getElementById('levels-container');
    container.innerHTML = '';
    CHAPTERS.forEach(function (chapter) {
      var block = document.createElement('div');
      block.className = 'chapter-block';
      var title = document.createElement('div');
      title.className = 'chapter-title';
      title.textContent = chapter.name;
      title.style.color = chapter.color;
      block.appendChild(title);
      var grid = document.createElement('div');
      grid.className = 'levels-row';
      for (var id = chapter.levels[0]; id <= chapter.levels[1]; id++) {
        (function (levelId) {
          var btn = document.createElement('button');
          btn.className = 'level-tile';
          var unlocked = self.progress.isUnlocked(levelId);
          var completed = self.progress.isCompleted(levelId);
          var stars = self.progress.getLevelStars(levelId);
          if (completed) btn.classList.add('done');
          else if (!unlocked) btn.classList.add('locked');
          if (completed || unlocked) {
            btn.addEventListener('click', function () {
              RadioBG.init({ volume: 0.22 });
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
          } else if (unlocked || completed) {
            starsEl.textContent = '☆☆☆';
          } else {
            starsEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/></svg>';
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
  startLevel: function startLevel(levelId) {
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
  renderBoard: function renderBoard() {
    var self = this;
    var boardEl = document.getElementById('game-board');
    boardEl.innerHTML = '';
    this.cellEls = [];
    var canvas = document.getElementById('particle-canvas');
    var _cs = getComputedStyle(document.documentElement);
    var cellSize = parseInt(_cs.getPropertyValue('--cell-size')) || 68;
    var cellGap  = parseInt(_cs.getPropertyValue('--cell-gap'))  || 3;
    var boardPad = 6;
    var boardPx = 8 * cellSize + 8 * cellGap;
    var framePx = boardPx + 2 * boardPad;
    canvas.width = framePx;
    canvas.height = framePx;
    for (var r = 0; r < 8; r++) {
      this.cellEls[r] = [];
      for (var c = 0; c < 8; c++) {
        (function (row, col) {
          var cell = document.createElement('div');
          cell.className = 'gem-cell';
          cell.setAttribute('data-row', row);
          cell.setAttribute('data-col', col);
          if (self.board.isBlocked(row, col)) {
            cell.classList.add('blocked');
          } else {
            // Mouse drag
            cell.addEventListener('mousedown', function (e) {
              if (e.button !== 0) return;
              e.preventDefault();
              self.startDrag(row, col, e.clientX, e.clientY);
            }, false);
            // Touch drag
            cell.addEventListener('touchstart', function (e) {
              e.preventDefault();
              var t = e.touches[0];
              self.startDrag(row, col, t.clientX, t.clientY);
            }, false);
            self.renderCell(cell, row, col);
          }
          boardEl.appendChild(cell);
          self.cellEls[row][col] = cell;
        })(r, c);
      }
    }
  },
  renderCell: function renderCell(el, r, c) {
    var gem = this.board.getCell(r, c);
    if (!gem) {
      el.innerHTML = '';
      return;
    }
    renderGem(el, gem.type, gem.special);
    el.style.setProperty('--gem-glow', getGemGlow(gem.type));
  },
  refreshBoard: function refreshBoard() {
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
  onCellClick: function onCellClick(r, c) {
    if (this.state !== STATE.PLAYING) return;
    if (this.board.isBlocked(r, c)) return;
    if (this.activeBoost === 'hammer') {
      this.useHammer(r, c);
      return;
    }
    if (this.activeBoost === 'bomb') {
      this.useBomb(r, c);
      return;
    }
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
  selectCell: function selectCell(r, c) {
    this.selectedCell = {
      r: r,
      c: c
    };
    var el = cellEl(this.cellEls, r, c);
    if (el) el.classList.add('selected');
  },
  deselectCell: function deselectCell() {
    if (this.selectedCell) {
      var el = cellEl(this.cellEls, this.selectedCell.r, this.selectedCell.c);
      if (el) el.classList.remove('selected');
    }
    this.selectedCell = null;
  },
  // ─── Swap & Match Processing (Promise chains — no async/await) ─
  trySwap: function trySwap(r1, c1, r2, c2) {
    var self = this;
    self.state = STATE.ANIMATING;
    self.board.swap(r1, c1, r2, c2);
    self.animateSwap(r1, c1, r2, c2);
    return self.delay(240).then(function () {
      var matches = self.board.findMatches();
      if (matches.length === 0) {
        // Slide back, then shake
        self.animateSwapReverse(r1, c1, r2, c2);
        return self.delay(180).then(function () {
          self.board.swap(r1, c1, r2, c2);
          self.clearSwapTransforms(r1, c1, r2, c2);
          self.refreshBoard();
          var el1 = cellEl(self.cellEls, r1, c1);
          var el2 = cellEl(self.cellEls, r2, c2);
          if (el1) { el1.classList.add('invalid-swap'); setTimeout(function () { el1.classList.remove('invalid-swap'); }, 380); }
          if (el2) { el2.classList.add('invalid-swap'); setTimeout(function () { el2.classList.remove('invalid-swap'); }, 380); }
          return self.delay(340).then(function () {
            self.state = STATE.PLAYING;
          });
        });
      }
      self.clearSwapTransforms(r1, c1, r2, c2);
      self.refreshBoard();
      if (self.currentLevel.moves) {
        self.moves--;
        self.updateHUD();
      }
      self.cascade = 0;
      return self.processMatches(matches, {
        r: r2,
        c: c2
      }).then(function () {
        if (!self.checkObjective()) {
          if (!self.board.hasValidMoves()) {
            if (self.currentLevel.moves && self.moves <= 0) {
              self.gameOver();
            } else {
              self.board.shuffle();
              self.refreshBoard();
              self.showCombo('Embaralhando!');
              return self.delay(500).then(function () {
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
  processMatches: function processMatches(matches, swapCell) {
    var self = this;
    if (matches.length === 0) return Promise.resolve();
    matches.forEach(function (m) {
      var el = cellEl(self.cellEls, m.r, m.c);
      if (el) el.classList.add('matched');
    });
    return self.delay(280).then(function () {
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
        removed.forEach(function (g) {
          if (g.type === targetType) self.collected++;
        });
      }
      self.cascade++;
      if (self.cascade >= 2) self.showCombo('COMBO x' + self.cascade + '!');
      self.refreshBoard();
      var falls = self.board.applyGravity();
      falls.forEach(function (f) {
        var el = cellEl(self.cellEls, f.toR, f.toC);
        if (el) el.classList.add('falling');
      });
      return self.delay(260).then(function () {
        falls.forEach(function (f) {
          var el = cellEl(self.cellEls, f.toR, f.toC);
          if (el) el.classList.remove('falling');
        });
        var newGems = self.board.fillEmpty();
        self.refreshBoard();
        newGems.forEach(function (ng) {
          var el = cellEl(self.cellEls, ng.r, ng.c);
          if (el) {
            var svg = el.querySelector('.gem-svg');
            if (svg) {
              svg.style.webkitAnimation = 'none';
              svg.style.animation = 'none';
              requestAnimationFrame(function () {
                svg.style.webkitAnimation = 'gemAppear 0.3s cubic-bezier(0.34,1.56,0.64,1) both';
                svg.style.animation = 'gemAppear 0.3s cubic-bezier(0.34,1.56,0.64,1) both';
              });
            }
          }
        });
        return self.delay(260).then(function () {
          self.updateObjective();
          var newMatches = self.board.findMatches();
          if (newMatches.length > 0) {
            return self.processMatches(newMatches, null);
          }
        });
      });
    });
  },
  // ─── Drag Ghost ───────────────────────────────────────────────
  startDrag: function startDrag(row, col, clientX, clientY) {
    var self = this;
    if (self.state !== STATE.PLAYING) return;
    if (self.board.isBlocked(row, col)) return;
    self._dragging = true;
    self._dragRow = row;
    self._dragCol = col;
    self._dragStartX = clientX;
    self._dragStartY = clientY;
    self._dragTargetRow = -1;
    self._dragTargetCol = -1;
    var srcCell = cellEl(self.cellEls, row, col);
    if (!srcCell) return;
    // Create ghost clone
    var ghost = document.createElement('div');
    ghost.className = 'gem-ghost';
    ghost.innerHTML = srcCell.innerHTML;
    ghost.style.left = clientX + 'px';
    ghost.style.top = clientY + 'px';
    document.body.appendChild(ghost);
    self._dragGhost = ghost;
    srcCell.classList.add('dragging');
    // Global handlers
    self._onMouseMoveDrag = function (e) { self.moveDrag(e.clientX, e.clientY); };
    self._onMouseUpDrag = function (e) {
      self.endDrag(e.clientX, e.clientY);
      document.removeEventListener('mousemove', self._onMouseMoveDrag, false);
      document.removeEventListener('mouseup', self._onMouseUpDrag, false);
    };
    self._onTouchMoveDrag = function (e) {
      if (e.touches.length > 0) self.moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    self._onTouchEndDrag = function (e) {
      var t = e.changedTouches[0];
      self.endDrag(t.clientX, t.clientY);
      document.removeEventListener('touchmove', self._onTouchMoveDrag, false);
      document.removeEventListener('touchend', self._onTouchEndDrag, false);
    };
    document.addEventListener('mousemove', self._onMouseMoveDrag, false);
    document.addEventListener('mouseup', self._onMouseUpDrag, false);
    document.addEventListener('touchmove', self._onTouchMoveDrag, false);
    document.addEventListener('touchend', self._onTouchEndDrag, false);
  },
  moveDrag: function moveDrag(clientX, clientY) {
    var self = this;
    if (!self._dragging) return;
    if (self._dragGhost) {
      self._dragGhost.style.left = clientX + 'px';
      self._dragGhost.style.top = clientY + 'px';
    }
    // Find cell under cursor (hide ghost briefly so it doesn't block elementFromPoint)
    if (self._dragLastOverEl) {
      self._dragLastOverEl.classList.remove('drag-over');
      self._dragLastOverEl = null;
    }
    self._dragTargetRow = -1;
    self._dragTargetCol = -1;
    if (self._dragGhost) self._dragGhost.style.visibility = 'hidden';
    var elUnder = document.elementFromPoint(clientX, clientY);
    if (self._dragGhost) self._dragGhost.style.visibility = '';
    var targetCell = elUnder ? findGemCell(elUnder) : null;
    if (targetCell) {
      var tr = parseInt(targetCell.getAttribute('data-row'));
      var tc = parseInt(targetCell.getAttribute('data-col'));
      if (!isNaN(tr) && !isNaN(tc) &&
          !(tr === self._dragRow && tc === self._dragCol) &&
          self.board.isAdjacent(self._dragRow, self._dragCol, tr, tc) &&
          !self.board.isBlocked(tr, tc)) {
        targetCell.classList.add('drag-over');
        self._dragLastOverEl = targetCell;
        self._dragTargetRow = tr;
        self._dragTargetCol = tc;
      }
    }
  },
  endDrag: function endDrag(clientX, clientY) {
    var self = this;
    if (!self._dragging) return;
    self._dragging = false;
    if (self._dragGhost && self._dragGhost.parentNode) {
      self._dragGhost.parentNode.removeChild(self._dragGhost);
    }
    self._dragGhost = null;
    if (self._dragLastOverEl) {
      self._dragLastOverEl.classList.remove('drag-over');
      self._dragLastOverEl = null;
    }
    var srcCell = cellEl(self.cellEls, self._dragRow, self._dragCol);
    if (srcCell) srcCell.classList.remove('dragging');
    var dx = clientX - self._dragStartX;
    var dy = clientY - self._dragStartY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 8) {
      self.onCellClick(self._dragRow, self._dragCol);
      return;
    }
    if (self._dragTargetRow >= 0 && self._dragTargetCol >= 0 && self.state === STATE.PLAYING) {
      self.deselectCell();
      self.trySwap(self._dragRow, self._dragCol, self._dragTargetRow, self._dragTargetCol);
    }
    self._dragTargetRow = -1;
    self._dragTargetCol = -1;
  },
  // ─── Animations ───────────────────────────────────────────────
  animateSwap: function animateSwap(r1, c1, r2, c2) {
    var el1 = cellEl(this.cellEls, r1, c1);
    var el2 = cellEl(this.cellEls, r2, c2);
    if (!el1 || !el2) return;
    var cs = getComputedStyle(document.documentElement);
    var cellSize = parseInt(cs.getPropertyValue('--cell-size')) || 56;
    var gap = parseInt(cs.getPropertyValue('--cell-gap')) || 2;
    var step = cellSize + gap;
    var dx = (c2 - c1) * step;
    var dy = (r2 - r1) * step;
    var ease = 'cubic-bezier(0.34,1.56,0.64,1)';
    var dur = '0.22s';
    el1.style.webkitTransition = '-webkit-transform ' + dur + ' ' + ease;
    el1.style.transition = 'transform ' + dur + ' ' + ease;
    el1.style.webkitTransform = 'translate(' + dx + 'px,' + dy + 'px)';
    el1.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    el1.style.zIndex = '20';
    el2.style.webkitTransition = '-webkit-transform ' + dur + ' ' + ease;
    el2.style.transition = 'transform ' + dur + ' ' + ease;
    el2.style.webkitTransform = 'translate(' + (-dx) + 'px,' + (-dy) + 'px)';
    el2.style.transform = 'translate(' + (-dx) + 'px,' + (-dy) + 'px)';
  },
  animateSwapReverse: function animateSwapReverse(r1, c1, r2, c2) {
    var el1 = cellEl(this.cellEls, r1, c1);
    var el2 = cellEl(this.cellEls, r2, c2);
    var ease = 'cubic-bezier(0.4,0,0.6,1)';
    var dur = '0.16s';
    if (el1) {
      el1.style.webkitTransition = '-webkit-transform ' + dur + ' ' + ease;
      el1.style.transition = 'transform ' + dur + ' ' + ease;
      el1.style.webkitTransform = 'translate(0,0)';
      el1.style.transform = 'translate(0,0)';
      el1.style.zIndex = '';
    }
    if (el2) {
      el2.style.webkitTransition = '-webkit-transform ' + dur + ' ' + ease;
      el2.style.transition = 'transform ' + dur + ' ' + ease;
      el2.style.webkitTransform = 'translate(0,0)';
      el2.style.transform = 'translate(0,0)';
    }
  },
  clearSwapTransforms: function clearSwapTransforms(r1, c1, r2, c2) {
    var els = [cellEl(this.cellEls, r1, c1), cellEl(this.cellEls, r2, c2)];
    for (var i = 0; i < els.length; i++) {
      if (els[i]) {
        els[i].style.webkitTransition = '';
        els[i].style.transition = '';
        els[i].style.webkitTransform = '';
        els[i].style.transform = '';
        els[i].style.zIndex = '';
      }
    }
  },
  showCombo: function showCombo(text) {
    var self = this;
    var popup = document.getElementById('combo-popup');
    var textEl = document.getElementById('combo-text');
    textEl.textContent = text;
    popup.classList.remove('hidden');
    clearTimeout(this._comboTimer);
    this._comboTimer = setTimeout(function () {
      popup.classList.add('hidden');
    }, 900);
  },
  showScorePopup: function showScorePopup(score, r, c) {
    var boardFrame = document.querySelector('.board-frame');
    if (!boardFrame) return;
    var _csP = getComputedStyle(document.documentElement);
    var cellSize = parseInt(_csP.getPropertyValue('--cell-size')) || 68;
    var cellGapP = parseInt(_csP.getPropertyValue('--cell-gap')) || 3;
    var popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + score;
    popup.style.left = (6 + c * (cellSize + cellGapP) + cellSize / 2) + 'px';
    popup.style.top  = (6 + r * (cellSize + cellGapP) + cellSize / 2) + 'px';
    boardFrame.appendChild(popup);
    setTimeout(function () {
      if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, 1000);
  },
  // ─── Particle System ──────────────────────────────────────────
  burstParticles: function burstParticles(matches) {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var _csB = getComputedStyle(document.documentElement);
    var cellSize = parseInt(_csB.getPropertyValue('--cell-size')) || 68;
    var gap = parseInt(_csB.getPropertyValue('--cell-gap')) || 3;
    var padding = 6;
    var particles = [];
    var self = this;
    matches.forEach(function (m) {
      var gem = GEMS[self.board.getCell(m.r, m.c) ? self.board.getCell(m.r, m.c).type : 0] || GEMS[0];
      var x = padding + m.c * (cellSize + gap) + cellSize / 2;
      var y = padding + m.r * (cellSize + gap) + cellSize / 2;
      for (var i = 0; i < 7; i++) {
        var angle = Math.PI * 2 * i / 7 + Math.random() * 0.3;
        var speed = 2 + Math.random() * 3;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 4,
          color: gem.color,
          life: 1
        });
      }
    });
    var frame = 0;
    var _animate = function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.04;
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
      if (alive && frame++ < 60) requestAnimationFrame(_animate);else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    requestAnimationFrame(_animate);
  },
  // ─── Score & HUD ──────────────────────────────────────────────
  addScore: function addScore(points) {
    var prev = this.score;
    this.score += points;
    this.animateCounter('hud-score', prev, this.score, 400);
    this.updateObjective();
  },
  animateCounter: function animateCounter(elId, from, to, duration) {
    var el = document.getElementById(elId);
    if (!el) return;
    var start = Date.now();
    var _update = function update() {
      var t = Math.min((Date.now() - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(_update);
    };
    requestAnimationFrame(_update);
  },
  updateHUD: function updateHUD() {
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
    eachEl(hearts, function (h, i) {
      if (i < lives) h.classList.add('active');else h.classList.remove('active');
    });
  },
  updateObjective: function updateObjective() {
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
    var pct = Math.min(100, Math.round(current / target * 100));
    document.getElementById('obj-text').textContent = text;
    document.getElementById('obj-fill').style.width = pct + '%';
    document.getElementById('obj-percent').textContent = pct + '%';
  },
  formatTime: function formatTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  },
  // ─── Timer ────────────────────────────────────────────────────
  startTimer: function startTimer() {
    var self = this;
    self.clearTimer();
    self.timerInterval = setInterval(function () {
      if (self.state !== STATE.PLAYING) return;
      self.timeLeft--;
      self.updateHUD();
      if (self.timeLeft <= 0) {
        self.clearTimer();
        if (!self.checkObjective()) self.gameOver();
      }
    }, 1000);
  },
  clearTimer: function clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },
  // ─── Win/Loss Conditions ──────────────────────────────────────
  checkObjective: function checkObjective() {
    var obj = this.currentLevel.objective;
    var achieved = false;
    if (obj.type === 'score') achieved = this.score >= obj.target;else if (obj.type === 'collect') achieved = this.collected >= obj.target;
    if (achieved) {
      this.levelComplete();
      return true;
    }
    return false;
  },
  levelComplete: function levelComplete() {
    this.state = STATE.COMPLETE;
    this.clearTimer();
    var stars = calcStars(this.currentLevel, this.score);
    this.progress.setLevelStars(this.currentLevel.id, stars);
    var self = this;
    setTimeout(function () {
      self.showLevelComplete(stars);
    }, 500);
  },
  showLevelComplete: function showLevelComplete(stars) {
    document.getElementById('complete-score').textContent = this.score.toLocaleString();
    for (var i = 1; i <= 3; i++) {
      var el = document.getElementById('star-' + i);
      if (el) el.classList.remove('earned');
    }
    for (var j = 1; j <= stars; j++) {
      (function (idx) {
        setTimeout(function () {
          var el = document.getElementById('star-' + idx);
          if (el) el.classList.add('earned');
        }, idx * 250);
      })(j);
    }
    this.showOverlay('overlay-complete');
  },
  gameOver: function gameOver() {
    this.state = STATE.GAME_OVER;
    this.clearTimer();
    var msg = 'Sem movimentos disponíveis';
    if (this.currentLevel.time && this.timeLeft <= 0) msg = 'O tempo acabou!';else if (this.currentLevel.moves && this.moves <= 0) msg = 'Sem jogadas restantes';
    document.getElementById('gameover-msg').textContent = msg;
    this.showOverlay('overlay-gameover');
  },
  // ─── Game Listeners ───────────────────────────────────────────
  setupGameListeners: function setupGameListeners() {
    var self = this;
    document.getElementById('btn-pause').addEventListener('click', function () {
      self.pauseGame();
    });
    document.getElementById('btn-resume').addEventListener('click', function () {
      self.resumeGame();
    });
    document.getElementById('btn-restart').addEventListener('click', function () {
      self.hideOverlays();
      self.startLevel(self.currentLevel.id);
    });
    document.getElementById('btn-quit').addEventListener('click', function () {
      self.clearTimer();
      self.hideOverlays();
      self.showScreen('menu');
    });
    document.getElementById('btn-next-level').addEventListener('click', function () {
      var next = Math.min(self.currentLevel.id + 1, 50);
      self.hideOverlays();
      self.startLevel(next);
    });
    document.getElementById('btn-replay').addEventListener('click', function () {
      self.hideOverlays();
      self.startLevel(self.currentLevel.id);
    });
    document.getElementById('btn-try-again').addEventListener('click', function () {
      self.hideOverlays();
      self.startLevel(self.currentLevel.id);
    });
    document.getElementById('btn-goto-menu').addEventListener('click', function () {
      self.clearTimer();
      self.hideOverlays();
      self.showScreen('menu');
    });
  },
  pauseGame: function pauseGame() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.PAUSED;
    this.clearTimer();
    this.showOverlay('overlay-pause');
  },
  resumeGame: function resumeGame() {
    this.hideOverlays();
    this.state = STATE.PLAYING;
    if (this.currentLevel.time && this.timeLeft > 0) this.startTimer();
  },
  // ─── Boost System ─────────────────────────────────────────────
  setupBoostListeners: function setupBoostListeners() {
    var self = this;
    document.getElementById('boost-hammer').addEventListener('click', function () {
      self.toggleBoost('hammer');
    });
    document.getElementById('boost-shuffle').addEventListener('click', function () {
      self.useShuffleboost();
    });
    document.getElementById('boost-bomb').addEventListener('click', function () {
      self.toggleBoost('bomb');
    });
  },
  toggleBoost: function toggleBoost(type) {
    if (this.state !== STATE.PLAYING) return;
    if (this.boosts[type] <= 0) return;
    if (this.activeBoost === type) {
      this.activeBoost = null;
      eachEl(document.querySelectorAll('.boost-btn'), function (b) {
        b.classList.remove('active-boost');
      });
    } else {
      this.activeBoost = type;
      eachEl(document.querySelectorAll('.boost-btn'), function (b) {
        b.classList.remove('active-boost');
      });
      var el = document.getElementById('boost-' + type);
      if (el) el.classList.add('active-boost');
    }
  },
  useHammer: function useHammer(r, c) {
    var self = this;
    if (self.boosts.hammer <= 0) return;
    var gem = self.board.removeSingle(r, c);
    if (!gem) return;
    self.boosts.hammer--;
    document.getElementById('boost-count-hammer').textContent = self.boosts.hammer;
    self.activeBoost = null;
    eachEl(document.querySelectorAll('.boost-btn'), function (b) {
      b.classList.remove('active-boost');
    });
    if (self.currentLevel.objective.type === 'collect' && gem.type === self.currentLevel.objective.gemType) self.collected++;
    self.addScore(100);
    var el = cellEl(self.cellEls, r, c);
    if (el) {
      el.classList.add('matched');
      setTimeout(function () {
        self.refreshBoard();
        el.classList.remove('matched');
        self.processAfterRemoval();
      }, 350);
    } else {
      self.processAfterRemoval();
    }
  },
  useShuffleboost: function useShuffleboost() {
    if (this.state !== STATE.PLAYING) return;
    if (this.boosts.shuffle <= 0) return;
    this.boosts.shuffle--;
    document.getElementById('boost-count-shuffle').textContent = this.boosts.shuffle;
    this.board.shuffle();
    this.refreshBoard();
    this.showCombo('Embaralhando!');
  },
  useBomb: function useBomb(r, c) {
    var self = this;
    if (self.boosts.bomb <= 0) return;
    var area = [];
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        var nr = r + dr,
          nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !self.board.isBlocked(nr, nc) && self.board.getCell(nr, nc)) {
          area.push({
            r: nr,
            c: nc
          });
        }
      }
    }
    self.boosts.bomb--;
    document.getElementById('boost-count-bomb').textContent = self.boosts.bomb;
    self.activeBoost = null;
    eachEl(document.querySelectorAll('.boost-btn'), function (b) {
      b.classList.remove('active-boost');
    });
    area.forEach(function (pos) {
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
    setTimeout(function () {
      area.forEach(function (pos) {
        var el = cellEl(self.cellEls, pos.r, pos.c);
        if (el) el.classList.remove('matched');
      });
      self.processAfterRemoval();
    }, 350);
  },
  processAfterRemoval: function processAfterRemoval() {
    var self = this;
    self.state = STATE.ANIMATING;
    self.board.applyGravity();
    self.board.fillEmpty();
    self.refreshBoard();
    return self.delay(300).then(function () {
      var newMatches = self.board.findMatches();
      if (newMatches.length > 0) {
        return self.processMatches(newMatches).then(function () {
          self.updateObjective();
          if (!self.checkObjective()) self.state = STATE.PLAYING;
        });
      }
      self.updateObjective();
      if (!self.checkObjective()) self.state = STATE.PLAYING;
    });
  },
  // ─── Utilities ────────────────────────────────────────────────
  delay: function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }
};

// ─── String repeat polyfill (iOS 9 has it, but just in case) ──────
function repeat(str, n) {
  var out = '';
  for (var i = 0; i < n; i++) out += str;
  return out;
}

// ─── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  Game.init();
});