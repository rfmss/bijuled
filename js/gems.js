/**
 * BIJULED · Gem Definitions
 * Premium SVG gems with gradients, facets, highlights
 */

const GEMS = [
  {
    id: 0,
    name: 'ruby',
    label: 'Rubi',
    color: '#e53935',
    glow: 'rgba(229,57,53,0.7)',
    svgGradient: ['#ff8a80', '#e53935', '#b71c1c'],
    createSVG: () => createGem('ruby')
  },
  {
    id: 1,
    name: 'emerald',
    label: 'Esmeralda',
    color: '#43a047',
    glow: 'rgba(67,160,71,0.7)',
    svgGradient: ['#a5d6a7', '#43a047', '#1b5e20'],
    createSVG: () => createGem('emerald')
  },
  {
    id: 2,
    name: 'sapphire',
    label: 'Safira',
    color: '#1e88e5',
    glow: 'rgba(30,136,229,0.7)',
    svgGradient: ['#90caf9', '#1e88e5', '#0d47a1'],
    createSVG: () => createGem('sapphire')
  },
  {
    id: 3,
    name: 'topaz',
    label: 'Topázio',
    color: '#ff8f00',
    glow: 'rgba(255,143,0,0.7)',
    svgGradient: ['#ffe082', '#ff8f00', '#e65100'],
    createSVG: () => createGem('topaz')
  },
  {
    id: 4,
    name: 'amethyst',
    label: 'Ametista',
    color: '#8e24aa',
    glow: 'rgba(142,36,170,0.7)',
    svgGradient: ['#ce93d8', '#8e24aa', '#4a148c'],
    createSVG: () => createGem('amethyst')
  },
  {
    id: 5,
    name: 'diamond',
    label: 'Diamante',
    color: '#00bcd4',
    glow: 'rgba(0,188,212,0.7)',
    svgGradient: ['#ffffff', '#80deea', '#00bcd4'],
    createSVG: () => createGem('diamond')
  }
];

/**
 * Gem shape paths (viewBox 0 0 100 100)
 */
const GEM_SHAPES = {
  ruby: {
    // Circle gem
    shape: 'circle',
    path: null,
    cx: 50, cy: 50, r: 43,
    highlight: { type: 'ellipse', cx: 37, cy: 32, rx: 14, ry: 9, angle: -25 },
    facets: [
      'M 50,7 L 83,28 L 83,72 L 50,93 L 17,72 L 17,28 Z', // inner hex
    ],
    spec: { cx: 32, cy: 26, rx: 7, ry: 4, angle: -20 }
  },
  emerald: {
    // Rectangle / baguette
    shape: 'rect',
    path: 'M 14,20 L 86,20 L 86,80 L 14,80 Z',
    cornerRadius: 8,
    highlight: { type: 'rect', x: 20, y: 26, w: 60, h: 22, rx: 4 },
    facets: [
      'M 22,20 L 78,20 L 86,28 L 86,72 L 78,80 L 22,80 L 14,72 L 14,28 Z'
    ],
    spec: { cx: 30, cy: 32, rx: 10, ry: 5, angle: -15 }
  },
  sapphire: {
    // Hexagon
    path: 'M 50,8 L 87,29 L 87,71 L 50,92 L 13,71 L 13,29 Z',
    highlight: { type: 'polygon', points: '50,8 76,24 76,48 50,56 24,48 24,24' },
    facets: [],
    spec: { cx: 33, cy: 24, rx: 9, ry: 5, angle: -18 }
  },
  topaz: {
    // Pentagon
    path: 'M 50,7 L 91,36 L 75,86 L 25,86 L 9,36 Z',
    highlight: { type: 'polygon', points: '50,7 77,30 67,60 33,60 23,30' },
    facets: [],
    spec: { cx: 34, cy: 25, rx: 10, ry: 5, angle: -15 }
  },
  amethyst: {
    // Triangle / Trillion cut
    path: 'M 50,5 L 95,82 L 5,82 Z',
    highlight: { type: 'polygon', points: '50,14 78,65 22,65' },
    facets: [
      'M 50,5 L 72,44 L 50,62 L 28,44 Z'
    ],
    spec: { cx: 38, cy: 30, rx: 9, ry: 5, angle: -12 }
  },
  diamond: {
    // Classic diamond (kite)
    path: 'M 50,5 L 88,40 L 50,95 L 12,40 Z',
    highlight: { type: 'polygon', points: '50,5 76,34 50,50 24,34' },
    facets: [
      'M 50,5 L 68,32 L 50,42 L 32,32 Z',
      'M 50,95 L 68,52 L 50,42 L 32,52 Z'
    ],
    spec: { cx: 36, cy: 22, rx: 8, ry: 4, angle: -25 }
  }
};

const GEM_IDS = ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst', 'diamond'];

let _gradientCounter = 0;

function createGem(type, special = 'none') {
  const gem = GEMS.find(g => g.name === type);
  const shape = GEM_SHAPES[type];
  const gid = `g${type}${++_gradientCounter}`;

  const [c1, c2, c3] = gem.svgGradient;

  let mainShape = '';
  if (type === 'ruby') {
    mainShape = `<circle cx="50" cy="50" r="43" fill="url(#${gid})"/>`;
  } else if (type === 'emerald') {
    mainShape = `<rect x="14" y="20" width="72" height="60" rx="8" ry="8" fill="url(#${gid})"/>`;
  } else {
    mainShape = `<path d="${shape.path}" fill="url(#${gid})"/>`;
  }

  // Highlight shape
  let highlightShape = '';
  const h = shape.highlight;
  if (h.type === 'ellipse') {
    highlightShape = `<ellipse cx="${h.cx}" cy="${h.cy}" rx="${h.rx}" ry="${h.ry}" fill="rgba(255,255,255,0.38)" transform="rotate(${h.angle},${h.cx},${h.cy})"/>`;
  } else if (h.type === 'polygon') {
    highlightShape = `<polygon points="${h.points}" fill="rgba(255,255,255,0.18)"/>`;
  } else if (h.type === 'rect') {
    highlightShape = `<rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" rx="${h.rx}" fill="rgba(255,255,255,0.2)"/>`;
  }

  // Facets
  const facetLines = (shape.facets || []).map(f =>
    `<path d="${f}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>`
  ).join('');

  // Specular
  const s = shape.spec;
  const specular = `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="rgba(255,255,255,0.7)" transform="rotate(${s.angle},${s.cx},${s.cy})"/>`;

  // Special gem overlay
  let specialOverlay = '';
  if (special === 'row') {
    specialOverlay = `<text x="50" y="54" text-anchor="middle" font-size="18" fill="rgba(255,255,255,0.9)" font-family="Arial">▶◀</text>`;
  } else if (special === 'col') {
    specialOverlay = `<text x="50" y="54" text-anchor="middle" font-size="18" fill="rgba(255,255,255,0.9)" font-family="Arial" transform="rotate(90,50,50)">▶◀</text>`;
  } else if (special === 'bomb') {
    specialOverlay = `<circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-dasharray="4 3"/>`;
  } else if (special === 'rainbow') {
    specialOverlay = `<circle cx="50" cy="50" r="18" fill="url(#rainbow-grad)" opacity="0.7"/>`;
  }

  return `<svg class="gem-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gid}" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="45%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
    <filter id="shadow-${gid}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${gem.color}" flood-opacity="0.5"/>
    </filter>
    <radialGradient id="rainbow-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff0000"/>
      <stop offset="16%" stop-color="#ff7f00"/>
      <stop offset="33%" stop-color="#ffff00"/>
      <stop offset="50%" stop-color="#00ff00"/>
      <stop offset="66%" stop-color="#0000ff"/>
      <stop offset="83%" stop-color="#8b00ff"/>
      <stop offset="100%" stop-color="#ff0000"/>
    </radialGradient>
  </defs>
  <g filter="url(#shadow-${gid})">
    ${mainShape}
    ${facetLines}
    ${highlightShape}
    ${specular}
    ${specialOverlay}
  </g>
</svg>`;
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
function renderGem(container, typeId, special = 'none') {
  const type = GEM_IDS[typeId];
  if (!type) return;
  container.innerHTML = createGem(type, special);
  container.style.setProperty('--gem-glow', getGemGlow(typeId));
}
