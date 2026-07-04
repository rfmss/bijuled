/**
 * BIJULED · Gem Definitions
 * Fluent Emoji 3D (Microsoft, MIT license — github.com/microsoft/fluentui-emoji)
 * Rostinhos = pedras normais · Criaturas = pedras especiais (combos 4+)
 */

var EMOJI_PATH = 'assets/emojis/';

var GEMS = [{
  id: 0,
  name: 'angry',
  label: 'Raivinha',
  file: 'angry.png',
  color: '#f8312f',
  glow: 'rgba(248,49,47,0.8)'
}, {
  id: 1,
  name: 'nauseated',
  label: 'Enjoadinho',
  file: 'nauseated.png',
  color: '#63c159',
  glow: 'rgba(99,193,89,0.8)'
}, {
  id: 2,
  name: 'cold',
  label: 'Congelado',
  file: 'cold.png',
  color: '#6d9ee8',
  glow: 'rgba(109,158,232,0.8)'
}, {
  id: 3,
  name: 'grinning',
  label: 'Risadinha',
  file: 'grinning.png',
  color: '#ffb02e',
  glow: 'rgba(255,176,46,0.8)'
}, {
  id: 4,
  name: 'devil',
  label: 'Diabinho',
  file: 'devil.png',
  color: '#a55fd6',
  glow: 'rgba(165,95,214,0.8)'
}, {
  id: 5,
  name: 'ghost',
  label: 'Fantasminha',
  file: 'ghost.png',
  color: '#cfc4ee',
  glow: 'rgba(207,196,238,0.85)'
}];

/**
 * Special gems — creatures take over the cell but keep a colored
 * aura ring showing which gem type they still match with.
 *  row     (4 na linha)   → 👾 Invader  — varre a linha inteira
 *  col     (4 na coluna)  → 👽 Alien    — raio abdutor limpa a coluna
 *  bomb    (formato T/L)  → ☠️ Caveira  — explode área 3×3
 *  rainbow (5 seguidas)   → ❤️‍🔥 Coração — queima todas as pedras de uma cor
 */
var SPECIAL_GEMS = {
  row: {
    file: 'invader.png',
    badge: '↔'
  },
  col: {
    file: 'alien.png',
    badge: '↕'
  },
  bomb: {
    file: 'skull.png',
    badge: ''
  },
  rainbow: {
    file: 'heartfire.png',
    badge: ''
  }
};
var GEM_IDS = GEMS.map(function (g) {
  return g.name;
});

var GEM_CLASS_NAMES = ['gem-type-0', 'gem-type-1', 'gem-type-2', 'gem-type-3', 'gem-type-4', 'gem-type-5', 'gem-special-row', 'gem-special-col', 'gem-special-bomb', 'gem-special-rainbow'];
function clearGemClasses(container) {
  for (var i = 0; i < GEM_CLASS_NAMES.length; i++) {
    container.classList.remove(GEM_CLASS_NAMES[i]);
  }
}

/**
 * Build gem HTML. `type` is the gem name (e.g. 'angry'), `special`
 * one of 'none' | 'row' | 'col' | 'bomb' | 'rainbow'.
 */
function createGem(type) {
  var special = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
  var gem = GEMS.find(function (g) {
    return g.name === type;
  }) || GEMS[0];
  if (special !== 'none' && SPECIAL_GEMS[special]) {
    var sp = SPECIAL_GEMS[special];
    var badge = sp.badge ? "<span class=\"gem-sp-badge\">" + sp.badge + "</span>" : '';
    return "<span class=\"gem-special gem-sp-" + special + "\" style=\"--type-color:" + gem.color + "\">" + "<img class=\"gem-emoji\" src=\"" + EMOJI_PATH + sp.file + "\" alt=\"" + gem.label + " especial\" draggable=\"false\">" + badge + "</span>";
  }
  return "<img class=\"gem-emoji\" src=\"" + EMOJI_PATH + gem.file + "\" alt=\"" + gem.label + "\" draggable=\"false\">";
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
  clearGemClasses(container);
  container.classList.add('gem-type-' + typeId);
  if (special && special !== 'none') container.classList.add('gem-special-' + special);
  container.innerHTML = createGem(type, special);
  container.style.setProperty('--gem-glow', getGemGlow(typeId));
}

// Preload all emoji images so swaps/cascades never flicker
(function preloadEmojis() {
  var files = GEMS.map(function (g) {
    return g.file;
  });
  Object.keys(SPECIAL_GEMS).forEach(function (k) {
    files.push(SPECIAL_GEMS[k].file);
  });
  files.forEach(function (f) {
    var img = new Image();
    img.src = EMOJI_PATH + f;
  });
})();
