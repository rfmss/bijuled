/**
 * BIJULED · Gem Definitions
 * Emoji gems with lightweight special badges
 */

var GEM_EMOJIS = {
  ruby: '♦️',
  emerald: '🔶',
  sapphire: '🔷',
  topaz: '💠',
  amethyst: '🔹',
  diamond: '💎'
};

var GEM_SPECIAL_BADGES = {
  row: '↔',
  col: '↕',
  bomb: '💥',
  rainbow: '🌈'
};

var GEM_CLASS_NAMES = ['gem-0', 'gem-1', 'gem-2', 'gem-3', 'gem-4', 'gem-5', 'gem-6', 'gem-special-row', 'gem-special-col', 'gem-special-bomb', 'gem-special-rainbow'];

function clearGemClasses(container) {
  for (var i = 0; i < GEM_CLASS_NAMES.length; i++) {
    container.classList.remove(GEM_CLASS_NAMES[i]);
  }
}

var GEMS = [{
  id: 0,
  name: 'ruby',
  label: 'Terra',
  color: '#cd7b5f',
  glow: 'rgba(205,123,95,0.8)',
  createSVG: function createSVG() {
    return createGem('ruby');
  }
}, {
  id: 1,
  name: 'emerald',
  label: 'Sage',
  color: '#8fb3ae',
  glow: 'rgba(143,179,174,0.8)',
  createSVG: function createSVG() {
    return createGem('emerald');
  }
}, {
  id: 2,
  name: 'sapphire',
  label: 'Azul',
  color: '#6b9ab8',
  glow: 'rgba(107,154,184,0.8)',
  createSVG: function createSVG() {
    return createGem('sapphire');
  }
}, {
  id: 3,
  name: 'topaz',
  label: 'Ouro',
  color: '#d4af37',
  glow: 'rgba(212,175,55,0.8)',
  createSVG: function createSVG() {
    return createGem('topaz');
  }
}, {
  id: 4,
  name: 'amethyst',
  label: 'Lavanda',
  color: '#9b8fc4',
  glow: 'rgba(155,143,196,0.8)',
  createSVG: function createSVG() {
    return createGem('amethyst');
  }
}, {
  id: 5,
  name: 'diamond',
  label: 'Rosa',
  color: '#c4708a',
  glow: 'rgba(196,112,138,0.8)',
  createSVG: function createSVG() {
    return createGem('diamond');
  }
}];

var GEM_IDS = ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst', 'diamond'];

function createGem(type) {
  var special = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
  var emoji = GEM_EMOJIS[type] || '💠';
  var badge = '';
  if (special && special !== 'none' && GEM_SPECIAL_BADGES[special]) {
    badge = '<span class="gem-badge" aria-hidden="true">' + GEM_SPECIAL_BADGES[special] + '</span>';
  }
  return '<span class="gem-emoji" aria-hidden="true">' + emoji + '</span>' + badge;
}

function getGemGlow(typeId) {
  return GEMS[typeId] ? GEMS[typeId].glow : 'rgba(255,255,255,0.5)';
}

function renderGem(container, typeId) {
  var special = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'none';
  var type = GEM_IDS[typeId];
  if (!type) return;
  clearGemClasses(container);
  container.classList.add('gem-' + typeId);
  container.classList.add('gem-type-' + typeId);
  if (special && special !== 'none') container.classList.add('gem-special-' + special);
  container.innerHTML = createGem(type, special);
  container.style.setProperty('--gem-glow', getGemGlow(typeId));
}
