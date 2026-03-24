function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * BIJULED · Board Logic
 * Match-3 engine with cascades, special gems, and gravity
 */
var Board = /*#__PURE__*/function () {
  function Board() {
    var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
    _classCallCheck(this, Board);
    this.size = size;
    this.grid = []; // grid[row][col] = GemCell | null
    this.blocked = new Set(); // "row,col" strings
    this.gemTypes = 6;
  }

  // ─── Initialization ───────────────────────────────────────
  return _createClass(Board, [{
    key: "init",
    value: function init(levelConfig) {
      this.gemTypes = levelConfig.gemTypes || 6;
      this.blocked = new Set(levelConfig.blocked.map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          r = _ref2[0],
          c = _ref2[1];
        return "".concat(r, ",").concat(c);
      }));

      // Build grid without initial matches
      this.grid = [];
      for (var r = 0; r < this.size; r++) {
        this.grid[r] = [];
        for (var c = 0; c < this.size; c++) {
          if (this.isBlocked(r, c)) {
            this.grid[r][c] = null;
          } else {
            this.grid[r][c] = this._randomGem(r, c);
          }
        }
      }

      // Resolve any initial matches
      var safetyLimit = 100;
      while (this.findMatches().length > 0 && safetyLimit-- > 0) {
        for (var _r = 0; _r < this.size; _r++) {
          for (var _c = 0; _c < this.size; _c++) {
            if (!this.isBlocked(_r, _c)) {
              this.grid[_r][_c] = this._randomGem(_r, _c);
            }
          }
        }
      }
    }
  }, {
    key: "_randomGem",
    value: function _randomGem(row, col) {
      var exclude = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var type;
      var attempts = 0;
      do {
        type = Math.floor(Math.random() * this.gemTypes);
        attempts++;
      } while (attempts < 20 && (exclude.includes(type) || this._wouldMatch(row, col, type)));
      return {
        type: type,
        special: 'none'
      };
    }
  }, {
    key: "_wouldMatch",
    value: function _wouldMatch(row, col, type) {
      // Check horizontal
      var left1 = this.getType(row, col - 1);
      var left2 = this.getType(row, col - 2);
      var right1 = this.getType(row, col + 1);
      var right2 = this.getType(row, col + 2);
      if (left1 === type && left2 === type) return true;
      if (right1 === type && right2 === type) return true;
      if (left1 === type && right1 === type) return true;
      // Check vertical
      var up1 = this.getType(row - 1, col);
      var up2 = this.getType(row - 2, col);
      var down1 = this.getType(row + 1, col);
      var down2 = this.getType(row + 2, col);
      if (up1 === type && up2 === type) return true;
      if (down1 === type && down2 === type) return true;
      if (up1 === type && down1 === type) return true;
      return false;
    }
  }, {
    key: "getType",
    value: function getType(r, c) {
      if (r < 0 || r >= this.size || c < 0 || c >= this.size) return -1;
      if (!this.grid[r]) return -1; // row not yet initialized
      if (this.isBlocked(r, c) || !this.grid[r][c]) return -1;
      return this.grid[r][c].type;
    }
  }, {
    key: "getCell",
    value: function getCell(r, c) {
      if (r < 0 || r >= this.size || c < 0 || c >= this.size) return null;
      return this.grid[r][c];
    }
  }, {
    key: "isBlocked",
    value: function isBlocked(r, c) {
      return this.blocked.has("".concat(r, ",").concat(c));
    }
  }, {
    key: "isAdjacent",
    value: function isAdjacent(r1, c1, r2, c2) {
      return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    }

    // ─── Match Finding ────────────────────────────────────────
  }, {
    key: "findMatches",
    value: function findMatches() {
      var matched = new Set();

      // Horizontal matches
      for (var r = 0; r < this.size; r++) {
        var run = 1;
        for (var c = 1; c <= this.size; c++) {
          var prev = this.getType(r, c - 1);
          var curr = c < this.size ? this.getType(r, c) : -2;
          if (prev >= 0 && prev === curr) {
            run++;
          } else {
            if (run >= 3) {
              for (var k = c - run; k < c; k++) matched.add("".concat(r, ",").concat(k));
            }
            run = 1;
          }
        }
      }

      // Vertical matches
      for (var _c2 = 0; _c2 < this.size; _c2++) {
        var _run = 1;
        for (var _r2 = 1; _r2 <= this.size; _r2++) {
          var _prev = this.getType(_r2 - 1, _c2);
          var _curr = _r2 < this.size ? this.getType(_r2, _c2) : -2;
          if (_prev >= 0 && _prev === _curr) {
            _run++;
          } else {
            if (_run >= 3) {
              for (var _k = _r2 - _run; _k < _r2; _k++) matched.add("".concat(_k, ",").concat(_c2));
            }
            _run = 1;
          }
        }
      }
      return _toConsumableArray(matched).map(function (key) {
        var _key$split$map = key.split(',').map(Number),
          _key$split$map2 = _slicedToArray(_key$split$map, 2),
          r = _key$split$map2[0],
          c = _key$split$map2[1];
        return {
          r: r,
          c: c
        };
      });
    }

    /**
     * Analyze a match group to determine special gem creation
     * Returns { row, col, special, type } or null
     */
  }, {
    key: "analyzeMatch",
    value: function analyzeMatch(positions) {
      if (positions.length < 4) return null;

      // Group by row and column
      var byRow = {};
      var byCol = {};
      positions.forEach(function (_ref3) {
        var r = _ref3.r,
          c = _ref3.c;
        if (!byRow[r]) byRow[r] = [];
        if (!byCol[c]) byCol[c] = [];
        byRow[r].push(c);
        byCol[c].push(r);
      });
      var rows = Object.keys(byRow);
      var cols = Object.keys(byCol);

      // Check for 5-in-a-row → rainbow gem
      for (var _i = 0, _rows = rows; _i < _rows.length; _i++) {
        var row = _rows[_i];
        if (byRow[row].length >= 5) {
          var mid = Math.floor(byRow[row].length / 2);
          var c = byRow[row].sort(function (a, b) {
            return a - b;
          })[mid];
          return {
            r: parseInt(row),
            c: c,
            special: 'rainbow'
          };
        }
      }
      for (var _i2 = 0, _cols = cols; _i2 < _cols.length; _i2++) {
        var col = _cols[_i2];
        if (byCol[col].length >= 5) {
          var _mid = Math.floor(byCol[col].length / 2);
          var r = byCol[col].sort(function (a, b) {
            return a - b;
          })[_mid];
          return {
            r: r,
            c: parseInt(col),
            special: 'rainbow'
          };
        }
      }

      // Check for T or L shape → bomb gem
      for (var _i3 = 0, _rows2 = rows; _i3 < _rows2.length; _i3++) {
        var _row = _rows2[_i3];
        if (byRow[_row].length >= 3) {
          var _iterator = _createForOfIteratorHelper(cols),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var _col = _step.value;
              if (byCol[_col].length >= 3 && byRow[_row].includes(parseInt(_col))) {
                return {
                  r: parseInt(_row),
                  c: parseInt(_col),
                  special: 'bomb'
                };
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
      }

      // Check for 4-in-a-row → striped gem
      for (var _i4 = 0, _rows3 = rows; _i4 < _rows3.length; _i4++) {
        var _row2 = _rows3[_i4];
        if (byRow[_row2].length >= 4) {
          var _mid2 = Math.floor(byRow[_row2].length / 2);
          var _c3 = byRow[_row2].sort(function (a, b) {
            return a - b;
          })[_mid2];
          return {
            r: parseInt(_row2),
            c: _c3,
            special: 'row'
          };
        }
      }
      for (var _i5 = 0, _cols2 = cols; _i5 < _cols2.length; _i5++) {
        var _col2 = _cols2[_i5];
        if (byCol[_col2].length >= 4) {
          var _mid3 = Math.floor(byCol[_col2].length / 2);
          var _r3 = byCol[_col2].sort(function (a, b) {
            return a - b;
          })[_mid3];
          return {
            r: _r3,
            c: parseInt(_col2),
            special: 'col'
          };
        }
      }
      return null;
    }

    /**
     * Remove matched cells and apply special gem effects
     * Returns { removed: [{r,c,type}], created: [{r,c,special,type}], bonus: [{r,c,type}] }
     */
  }, {
    key: "removeMatches",
    value: function removeMatches(matches) {
      var _this = this;
      var swapCell = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var removed = [];
      var bonus = [];

      // Group connected matches for special analysis
      // (simplified: treat all as one group for special creation)
      var specialGem = this.analyzeMatch(matches);

      // Expand matches using special gems
      var toRemove = new Set(matches.map(function (m) {
        return "".concat(m.r, ",").concat(m.c);
      }));

      // Check special gems in the match set
      matches.forEach(function (_ref4) {
        var r = _ref4.r,
          c = _ref4.c;
        var cell = _this.grid[r][c];
        if (!cell) return;
        if (cell.special === 'row') {
          // Clear entire row
          for (var cc = 0; cc < _this.size; cc++) {
            if (!_this.isBlocked(r, cc)) toRemove.add("".concat(r, ",").concat(cc));
          }
        } else if (cell.special === 'col') {
          // Clear entire column
          for (var rr = 0; rr < _this.size; rr++) {
            if (!_this.isBlocked(rr, c)) toRemove.add("".concat(rr, ",").concat(c));
          }
        } else if (cell.special === 'bomb') {
          // Clear 3x3
          for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
              var nr = r + dr,
                nc = c + dc;
              if (nr >= 0 && nr < _this.size && nc >= 0 && nc < _this.size && !_this.isBlocked(nr, nc)) {
                toRemove.add("".concat(nr, ",").concat(nc));
              }
            }
          }
        } else if (cell.special === 'rainbow') {
          // Clear all gems of the type that was swapped with
          var targetType = cell.type;
          if (swapCell) {
            var swapGem = _this.grid[swapCell.r] && _this.grid[swapCell.r][swapCell.c];
            if (swapGem) targetType = swapGem.type;
          }
          for (var _rr = 0; _rr < _this.size; _rr++) {
            for (var _cc = 0; _cc < _this.size; _cc++) {
              var g = _this.grid[_rr][_cc];
              if (g && g.type === targetType) toRemove.add("".concat(_rr, ",").concat(_cc));
            }
          }
        }
      });

      // Record removed cells
      toRemove.forEach(function (key) {
        var _key$split$map3 = key.split(',').map(Number),
          _key$split$map4 = _slicedToArray(_key$split$map3, 2),
          r = _key$split$map4[0],
          c = _key$split$map4[1];
        var cell = _this.grid[r][c];
        if (cell) {
          removed.push({
            r: r,
            c: c,
            type: cell.type,
            special: cell.special
          });
          _this.grid[r][c] = null;
        }
      });

      // Create special gem if applicable (use removed array since grid is already null)
      var created = [];
      if (specialGem) {
        var foundGem = removed.find(function (g) {
          return g.r === specialGem.r && g.c === specialGem.c;
        });
        var gemType = foundGem && foundGem.type !== undefined ? foundGem.type : removed[0] ? removed[0].type : 0;
        this.grid[specialGem.r][specialGem.c] = {
          type: gemType,
          special: specialGem.special
        };
        created.push(Object.assign({}, specialGem, {
          type: gemType
        }));
      }
      return {
        removed: removed,
        created: created,
        bonus: bonus
      };
    }

    /**
     * Apply gravity - gems fall down
     * Returns array of fall animations needed
     */
  }, {
    key: "applyGravity",
    value: function applyGravity() {
      var falls = [];
      for (var c = 0; c < this.size; c++) {
        var emptyRow = this.size - 1;
        for (var r = this.size - 1; r >= 0; r--) {
          if (this.isBlocked(r, c)) {
            emptyRow = r - 1;
            continue;
          }
          if (this.grid[r][c] !== null) {
            if (r !== emptyRow) {
              this.grid[emptyRow][c] = this.grid[r][c];
              this.grid[r][c] = null;
              falls.push({
                fromR: r,
                fromC: c,
                toR: emptyRow,
                toC: c
              });
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
  }, {
    key: "fillEmpty",
    value: function fillEmpty() {
      var newGems = [];
      for (var c = 0; c < this.size; c++) {
        for (var r = 0; r < this.size; r++) {
          if (!this.isBlocked(r, c) && this.grid[r][c] === null) {
            var type = Math.floor(Math.random() * this.gemTypes);
            this.grid[r][c] = {
              type: type,
              special: 'none'
            };
            newGems.push({
              r: r,
              c: c,
              type: type
            });
          }
        }
      }
      return newGems;
    }

    /**
     * Swap two adjacent gems
     */
  }, {
    key: "swap",
    value: function swap(r1, c1, r2, c2) {
      var tmp = this.grid[r1][c1];
      this.grid[r1][c1] = this.grid[r2][c2];
      this.grid[r2][c2] = tmp;
    }

    /**
     * Check if any valid moves exist
     */
  }, {
    key: "hasValidMoves",
    value: function hasValidMoves() {
      // Check all possible swaps
      var dirs = [[0, 1], [1, 0]];
      for (var r = 0; r < this.size; r++) {
        for (var c = 0; c < this.size; c++) {
          if (this.isBlocked(r, c) || !this.grid[r][c]) continue;
          var _iterator2 = _createForOfIteratorHelper(dirs),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _step2$value = _slicedToArray(_step2.value, 2),
                dr = _step2$value[0],
                dc = _step2$value[1];
              var nr = r + dr,
                nc = c + dc;
              if (nr >= this.size || nc >= this.size) continue;
              if (this.isBlocked(nr, nc) || !this.grid[nr][nc]) continue;
              // Try swap
              this.swap(r, c, nr, nc);
              var matches = this.findMatches();
              this.swap(r, c, nr, nc); // swap back
              if (matches.length > 0) return true;
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      }
      return false;
    }

    /**
     * Shuffle board (keeping gem counts the same)
     */
  }, {
    key: "shuffle",
    value: function shuffle() {
      // Collect all gems
      var gems = [];
      for (var r = 0; r < this.size; r++) {
        for (var c = 0; c < this.size; c++) {
          if (!this.isBlocked(r, c) && this.grid[r][c]) {
            gems.push(Object.assign({}, this.grid[r][c]));
            this.grid[r][c] = null;
          }
        }
      }

      // Fisher-Yates shuffle
      for (var i = gems.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var _ref5 = [gems[j], gems[i]];
        gems[i] = _ref5[0];
        gems[j] = _ref5[1];
      }

      // Redistribute
      var gemIdx = 0;
      for (var _r4 = 0; _r4 < this.size; _r4++) {
        for (var _c4 = 0; _c4 < this.size; _c4++) {
          if (!this.isBlocked(_r4, _c4)) {
            this.grid[_r4][_c4] = gems[gemIdx++] || {
              type: Math.floor(Math.random() * this.gemTypes),
              special: 'none'
            };
          }
        }
      }
    }

    /**
     * Remove a single gem (hammer boost)
     */
  }, {
    key: "removeSingle",
    value: function removeSingle(r, c) {
      if (this.isBlocked(r, c) || !this.grid[r][c]) return null;
      var gem = Object.assign({}, this.grid[r][c], {
        r: r,
        c: c
      });
      this.grid[r][c] = null;
      return gem;
    }

    /**
     * Clear all gems of a given type (color bomb)
     */
  }, {
    key: "clearType",
    value: function clearType(type) {
      var removed = [];
      for (var r = 0; r < this.size; r++) {
        for (var c = 0; c < this.size; c++) {
          if (!this.isBlocked(r, c) && this.grid[r][c] && this.grid[r][c].type === type) {
            removed.push({
              r: r,
              c: c,
              type: this.grid[r][c].type
            });
            this.grid[r][c] = null;
          }
        }
      }
      return removed;
    }
  }]);
}();
/**
 * Score calculation
 * Base per gem: 50 + 25 per extra match
 * Cascade multiplier: cascade^1.5
 */
function calcMatchScore(matchCount) {
  var cascade = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var base = 50 + (matchCount - 3) * 25;
  var multiplier = Math.max(1, Math.pow(cascade + 1, 1.5));
  return Math.round(base * matchCount * multiplier);
}