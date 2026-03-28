function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * BIJULED · Gem Definitions
 * Premium SVG gems with gradients, facets, highlights
 */

var GEMS = [{
  id: 0,
  name: 'ruby',
  label: 'Terra',
  color: '#cd7b5f',
  glow: 'rgba(205,123,95,0.8)',
  svgGradient: ['#e8a890', '#cd7b5f', '#8a4535'],
  createSVG: function createSVG() {
    return createGem('ruby');
  }
}, {
  id: 1,
  name: 'emerald',
  label: 'Sage',
  color: '#8fb3ae',
  glow: 'rgba(143,179,174,0.8)',
  svgGradient: ['#b8d4d0', '#8fb3ae', '#4d7a75'],
  createSVG: function createSVG() {
    return createGem('emerald');
  }
}, {
  id: 2,
  name: 'sapphire',
  label: 'Azul',
  color: '#6b9ab8',
  glow: 'rgba(107,154,184,0.8)',
  svgGradient: ['#98c0d8', '#6b9ab8', '#3d6a8a'],
  createSVG: function createSVG() {
    return createGem('sapphire');
  }
}, {
  id: 3,
  name: 'topaz',
  label: 'Ouro',
  color: '#d4af37',
  glow: 'rgba(212,175,55,0.8)',
  svgGradient: ['#f0d870', '#d4af37', '#8a6a10'],
  createSVG: function createSVG() {
    return createGem('topaz');
  }
}, {
  id: 4,
  name: 'amethyst',
  label: 'Lavanda',
  color: '#9b8fc4',
  glow: 'rgba(155,143,196,0.8)',
  svgGradient: ['#c0b8de', '#9b8fc4', '#5a4a8a'],
  createSVG: function createSVG() {
    return createGem('amethyst');
  }
}, {
  id: 5,
  name: 'diamond',
  label: 'Rosa',
  color: '#c4708a',
  glow: 'rgba(196,112,138,0.8)',
  svgGradient: ['#dfa0b8', '#c4708a', '#8a3a58'],
  createSVG: function createSVG() {
    return createGem('diamond');
  }
}];

/**
 * Gem shape paths (viewBox 0 0 100 100)
 */
var GEM_SHAPES = {
  ruby: {
    // Circle gem
    shape: 'circle',
    path: null,
    cx: 50,
    cy: 50,
    r: 43,
    highlight: {
      type: 'ellipse',
      cx: 37,
      cy: 32,
      rx: 14,
      ry: 9,
      angle: -25
    },
    facets: ['M 50,7 L 83,28 L 83,72 L 50,93 L 17,72 L 17,28 Z' // inner hex
    ],
    spec: {
      cx: 32,
      cy: 26,
      rx: 7,
      ry: 4,
      angle: -20
    }
  },
  emerald: {
    // Rectangle / baguette
    shape: 'rect',
    path: 'M 14,20 L 86,20 L 86,80 L 14,80 Z',
    cornerRadius: 8,
    highlight: {
      type: 'rect',
      x: 20,
      y: 26,
      w: 60,
      h: 22,
      rx: 4
    },
    facets: ['M 22,20 L 78,20 L 86,28 L 86,72 L 78,80 L 22,80 L 14,72 L 14,28 Z'],
    spec: {
      cx: 30,
      cy: 32,
      rx: 10,
      ry: 5,
      angle: -15
    }
  },
  sapphire: {
    // Hexagon
    path: 'M 50,8 L 87,29 L 87,71 L 50,92 L 13,71 L 13,29 Z',
    highlight: {
      type: 'polygon',
      points: '50,8 76,24 76,48 50,56 24,48 24,24'
    },
    facets: [],
    spec: {
      cx: 33,
      cy: 24,
      rx: 9,
      ry: 5,
      angle: -18
    }
  },
  topaz: {
    // Pentagon
    path: 'M 50,7 L 91,36 L 75,86 L 25,86 L 9,36 Z',
    highlight: {
      type: 'polygon',
      points: '50,7 77,30 67,60 33,60 23,30'
    },
    facets: [],
    spec: {
      cx: 34,
      cy: 25,
      rx: 10,
      ry: 5,
      angle: -15
    }
  },
  amethyst: {
    // Triangle / Trillion cut
    path: 'M 50,5 L 95,82 L 5,82 Z',
    highlight: {
      type: 'polygon',
      points: '50,14 78,65 22,65'
    },
    facets: ['M 50,5 L 72,44 L 50,62 L 28,44 Z'],
    spec: {
      cx: 38,
      cy: 30,
      rx: 9,
      ry: 5,
      angle: -12
    }
  },
  diamond: {
    // Classic diamond (kite)
    path: 'M 50,5 L 88,40 L 50,95 L 12,40 Z',
    highlight: {
      type: 'polygon',
      points: '50,5 76,34 50,50 24,34'
    },
    facets: ['M 50,5 L 68,32 L 50,42 L 32,32 Z', 'M 50,95 L 68,52 L 50,42 L 32,52 Z'],
    spec: {
      cx: 36,
      cy: 22,
      rx: 8,
      ry: 4,
      angle: -25
    }
  }
};
var GEM_IDS = ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst', 'diamond'];
var _gradientCounter = 0;
function createGem(type) {
  var special = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
  var gem = GEMS.find(function (g) {
    return g.name === type;
  });
  var shape = GEM_SHAPES[type];
  var gid = "g".concat(type).concat(++_gradientCounter);
  var _gem$svgGradient = _slicedToArray(gem.svgGradient, 3),
    c1 = _gem$svgGradient[0],
    c2 = _gem$svgGradient[1],
    c3 = _gem$svgGradient[2];
  var mainShape = '';
  if (type === 'ruby') {
    mainShape = "<circle cx=\"50\" cy=\"50\" r=\"43\" fill=\"url(#".concat(gid, ")\"/>");
  } else if (type === 'emerald') {
    mainShape = "<rect x=\"14\" y=\"20\" width=\"72\" height=\"60\" rx=\"8\" ry=\"8\" fill=\"url(#".concat(gid, ")\"/>");
  } else {
    mainShape = "<path d=\"".concat(shape.path, "\" fill=\"url(#").concat(gid, ")\"/>");
  }

  // Highlight shape
  var highlightShape = '';
  var h = shape.highlight;
  if (h.type === 'ellipse') {
    highlightShape = "<ellipse cx=\"".concat(h.cx, "\" cy=\"").concat(h.cy, "\" rx=\"").concat(h.rx, "\" ry=\"").concat(h.ry, "\" fill=\"rgba(255,255,255,0.38)\" transform=\"rotate(").concat(h.angle, ",").concat(h.cx, ",").concat(h.cy, ")\"/>");
  } else if (h.type === 'polygon') {
    highlightShape = "<polygon points=\"".concat(h.points, "\" fill=\"rgba(255,255,255,0.18)\"/>");
  } else if (h.type === 'rect') {
    highlightShape = "<rect x=\"".concat(h.x, "\" y=\"").concat(h.y, "\" width=\"").concat(h.w, "\" height=\"").concat(h.h, "\" rx=\"").concat(h.rx, "\" fill=\"rgba(255,255,255,0.2)\"/>");
  }

  // Facets
  var facetLines = (shape.facets || []).map(function (f) {
    return "<path d=\"".concat(f, "\" fill=\"none\" stroke=\"rgba(255,255,255,0.12)\" stroke-width=\"1.5\"/>");
  }).join('');

  // Specular
  var s = shape.spec;
  var specular = "<ellipse cx=\"".concat(s.cx, "\" cy=\"").concat(s.cy, "\" rx=\"").concat(s.rx, "\" ry=\"").concat(s.ry, "\" fill=\"rgba(255,255,255,0.7)\" transform=\"rotate(").concat(s.angle, ",").concat(s.cx, ",").concat(s.cy, ")\"/>");

  // Special gem overlay — SVG paths centered at (50,50) in 100x100 viewBox
  var specialOverlay = '';
  if (special === 'row') {
    // Horizontal double arrow ←→
    specialOverlay = "<path d=\"M16,50 L30,40 L30,46 L70,46 L70,40 L84,50 L70,60 L70,54 L30,54 L30,60 Z\" fill=\"rgba(255,255,255,0.92)\"/>";
  } else if (special === 'col') {
    // Vertical double arrow ↑↓
    specialOverlay = "<path d=\"M50,16 L60,30 L54,30 L54,70 L60,70 L50,84 L40,70 L46,70 L46,30 L40,30 Z\" fill=\"rgba(255,255,255,0.92)\"/>";
  } else if (special === 'bomb') {
    // Concentric dashed ring + center dot
    specialOverlay = "<circle cx=\"50\" cy=\"50\" r=\"21\" fill=\"none\" stroke=\"rgba(255,255,255,0.7)\" stroke-width=\"2.5\" stroke-dasharray=\"5 3\"/><circle cx=\"50\" cy=\"50\" r=\"7\" fill=\"rgba(255,255,255,0.75)\"/>";
  } else if (special === 'rainbow') {
    specialOverlay = "<circle cx=\"50\" cy=\"50\" r=\"20\" fill=\"url(#rainbow-grad)\" opacity=\"0.78\"/>";
  }
  return "<svg class=\"gem-svg\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" overflow=\"hidden\">\n  <defs>\n    <linearGradient id=\"".concat(gid, "\" x1=\"0.2\" y1=\"0\" x2=\"0.8\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"").concat(c1, "\"/>\n      <stop offset=\"45%\" stop-color=\"").concat(c2, "\"/>\n      <stop offset=\"100%\" stop-color=\"").concat(c3, "\"/>\n    </linearGradient>\n    <filter id=\"shadow-").concat(gid, "\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\">\n      <feDropShadow dx=\"0\" dy=\"2\" stdDeviation=\"3\" flood-color=\"").concat(gem.color, "\" flood-opacity=\"0.5\"/>\n    </filter>\n    <radialGradient id=\"rainbow-grad\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#ff0000\"/>\n      <stop offset=\"16%\" stop-color=\"#ff7f00\"/>\n      <stop offset=\"33%\" stop-color=\"#ffff00\"/>\n      <stop offset=\"50%\" stop-color=\"#00ff00\"/>\n      <stop offset=\"66%\" stop-color=\"#0000ff\"/>\n      <stop offset=\"83%\" stop-color=\"#8b00ff\"/>\n      <stop offset=\"100%\" stop-color=\"#ff0000\"/>\n    </radialGradient>\n  </defs>\n  <g filter=\"url(#shadow-").concat(gid, ")\">\n    ").concat(mainShape, "\n    ").concat(facetLines, "\n    ").concat(highlightShape, "\n    ").concat(specular, "\n    ").concat(specialOverlay, "\n  </g>\n</svg>");
}

/**
 * Get gem glow color by type id
 */
function getGemGlow(typeId) {
  return GEMS[typeId] ? GEMS[typeId].glow : 'rgba(255,255,255,0.5)';
}

/**
 * Render gem into a container element
 */
function renderGem(container, typeId) {
  var special = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'none';
  var type = GEM_IDS[typeId];
  if (!type) return;
  container.innerHTML = createGem(type, special);
  container.style.setProperty('--gem-glow', getGemGlow(typeId));
}