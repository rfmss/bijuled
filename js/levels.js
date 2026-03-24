/**
 * BIJULED · Level Configurations
 * 50 levels across 5 chapters
 */

const CHAPTERS = [
  { id: 1, name: 'Despertar das Gemas',  levels: [1,10],  color: '#d4af37' },
  { id: 2, name: 'Profundezas de Cristal', levels: [11,20], color: '#1e88e5' },
  { id: 3, name: 'Desafios Prismáticos',  levels: [21,30], color: '#8e24aa' },
  { id: 4, name: 'Tempestade Radiante',   levels: [31,40], color: '#e53935' },
  { id: 5, name: 'Maestria Diamante',     levels: [41,50], color: '#00bcd4' }
];

/**
 * Level config shape:
 * {
 *   id: number,
 *   name: string,
 *   objective: { type: 'score'|'collect', target: number, gemType?: number },
 *   moves: number | null,   // null = unlimited
 *   time: number | null,    // seconds, null = no timer
 *   gemTypes: number,       // how many gem types (5 or 6)
 *   blocked: [row, col][],  // blocked cells
 *   starThresholds: [n1, n2, n3]  // score for 1/2/3 stars
 * }
 */

function makeLevel(id, opts) {
  return {
    id,
    name: opts.name || `Fase ${id}`,
    objective: opts.objective || { type: 'score', target: 500 },
    moves: opts.moves !== undefined ? opts.moves : null,
    time: opts.time || null,
    gemTypes: opts.gemTypes || 5,
    blocked: opts.blocked || [],
    starThresholds: opts.stars || [
      Math.floor(opts.objective?.target * 0.5),
      Math.floor(opts.objective?.target * 0.8),
      opts.objective?.target
    ]
  };
}

const LEVELS = [
  // ═══════ CHAPTER 1: Despertar das Gemas (1-10) ═══════
  makeLevel(1, {
    name: 'Primeiro Brilho',
    objective: { type: 'score', target: 500 },
    moves: null, gemTypes: 5,
    stars: [200, 350, 500]
  }),
  makeLevel(2, {
    name: 'Combinações Simples',
    objective: { type: 'score', target: 1000 },
    moves: null, gemTypes: 5,
    stars: [400, 700, 1000]
  }),
  makeLevel(3, {
    name: 'Cascata Dourada',
    objective: { type: 'score', target: 1500 },
    moves: null, gemTypes: 5,
    stars: [600, 1100, 1500]
  }),
  makeLevel(4, {
    name: 'Primeiros Passos',
    objective: { type: 'score', target: 2000 },
    moves: 30, gemTypes: 5,
    stars: [800, 1400, 2000]
  }),
  makeLevel(5, {
    name: 'Ritmo Crescente',
    objective: { type: 'score', target: 2500 },
    moves: 28, gemTypes: 5,
    stars: [1000, 1800, 2500]
  }),
  makeLevel(6, {
    name: 'Seis Cores',
    objective: { type: 'score', target: 3000 },
    moves: 26, gemTypes: 6,
    stars: [1200, 2200, 3000]
  }),
  makeLevel(7, {
    name: 'Combinador',
    objective: { type: 'score', target: 3500 },
    moves: 25, gemTypes: 6,
    stars: [1400, 2600, 3500]
  }),
  makeLevel(8, {
    name: 'Fluxo de Gemas',
    objective: { type: 'score', target: 4000 },
    moves: 24, gemTypes: 6,
    stars: [1600, 3000, 4000]
  }),
  makeLevel(9, {
    name: 'Coleta de Rubis',
    objective: { type: 'collect', target: 20, gemType: 0, label: 'Rubis' },
    moves: 22, gemTypes: 6,
    stars: [8, 15, 20]
  }),
  makeLevel(10, {
    name: 'Grande Acúmulo',
    objective: { type: 'score', target: 5000 },
    moves: 22, gemTypes: 6,
    stars: [2000, 3500, 5000]
  }),

  // ═══════ CHAPTER 2: Profundezas de Cristal (11-20) ═══════
  makeLevel(11, {
    name: 'Obstáculos',
    objective: { type: 'score', target: 5500 },
    moves: 20, gemTypes: 6,
    blocked: [[3,3],[4,4]],
    stars: [2200, 4000, 5500]
  }),
  makeLevel(12, {
    name: 'Quatro Pilares',
    objective: { type: 'score', target: 6000 },
    moves: 20, gemTypes: 6,
    blocked: [[2,2],[2,5],[5,2],[5,5]],
    stars: [2400, 4500, 6000]
  }),
  makeLevel(13, {
    name: 'Coleta de Esmeraldas',
    objective: { type: 'collect', target: 25, gemType: 1, label: 'Esmeraldas' },
    moves: 18, gemTypes: 6,
    blocked: [[3,3],[4,4]],
    stars: [10, 18, 25]
  }),
  makeLevel(14, {
    name: 'Labirinto de Gemas',
    objective: { type: 'score', target: 7000 },
    moves: 18, gemTypes: 6,
    blocked: [[1,3],[2,2],[2,5],[3,7],[5,0],[5,3],[6,5],[7,4]],
    stars: [2800, 5000, 7000]
  }),
  makeLevel(15, {
    name: 'Cruz de Cristal',
    objective: { type: 'score', target: 8000 },
    moves: 18, gemTypes: 6,
    blocked: [[3,0],[3,7],[4,0],[4,7],[0,3],[0,4],[7,3],[7,4]],
    stars: [3200, 5800, 8000]
  }),
  makeLevel(16, {
    name: 'Safiras da Profundeza',
    objective: { type: 'collect', target: 30, gemType: 2, label: 'Safiras' },
    moves: 16, gemTypes: 6,
    blocked: [[2,2],[2,5],[5,2],[5,5],[3,3],[4,4]],
    stars: [12, 22, 30]
  }),
  makeLevel(17, {
    name: 'Pressão Crescente',
    objective: { type: 'score', target: 10000 },
    moves: 16, gemTypes: 6,
    blocked: [[0,0],[0,7],[7,0],[7,7],[3,3],[3,4],[4,3],[4,4]],
    stars: [4000, 7500, 10000]
  }),
  makeLevel(18, {
    name: 'Corredor Estreito',
    objective: { type: 'score', target: 11000 },
    moves: 15, gemTypes: 6,
    blocked: [[1,0],[1,1],[1,6],[1,7],[6,0],[6,1],[6,6],[6,7],[3,3],[4,4]],
    stars: [4400, 8000, 11000]
  }),
  makeLevel(19, {
    name: 'Topázios do Abismo',
    objective: { type: 'collect', target: 35, gemType: 3, label: 'Topázios' },
    moves: 15, gemTypes: 6,
    blocked: [[2,0],[2,7],[5,0],[5,7],[0,2],[0,5],[7,2],[7,5]],
    stars: [14, 26, 35]
  }),
  makeLevel(20, {
    name: 'Fim do Capítulo II',
    objective: { type: 'score', target: 15000 },
    moves: 14, gemTypes: 6,
    blocked: [[2,2],[2,5],[5,2],[5,5],[0,0],[0,7],[7,0],[7,7],[3,3],[4,4]],
    stars: [6000, 11000, 15000]
  }),

  // ═══════ CHAPTER 3: Desafios Prismáticos (21-30) ═══════
  makeLevel(21, {
    name: 'Contra o Tempo',
    objective: { type: 'score', target: 8000 },
    moves: null, time: 90, gemTypes: 6,
    blocked: [[3,3],[4,4]],
    stars: [3200, 5500, 8000]
  }),
  makeLevel(22, {
    name: 'Ametistas Vivas',
    objective: { type: 'collect', target: 30, gemType: 4, label: 'Ametistas' },
    moves: 20, gemTypes: 6,
    blocked: [[1,3],[1,4],[6,3],[6,4],[3,1],[4,1],[3,6],[4,6]],
    stars: [12, 22, 30]
  }),
  makeLevel(23, {
    name: 'Sprint de Gemas',
    objective: { type: 'score', target: 10000 },
    moves: null, time: 75, gemTypes: 6,
    blocked: [[0,0],[0,7],[7,0],[7,7]],
    stars: [4000, 7000, 10000]
  }),
  makeLevel(24, {
    name: 'Diamantes Eternos',
    objective: { type: 'collect', target: 25, gemType: 5, label: 'Diamantes' },
    moves: 18, gemTypes: 6,
    blocked: [[2,2],[2,5],[5,2],[5,5],[3,3],[3,4],[4,3],[4,4]],
    stars: [10, 18, 25]
  }),
  makeLevel(25, {
    name: 'Meia Hora de Brilho',
    objective: { type: 'score', target: 12000 },
    moves: null, time: 60, gemTypes: 6,
    blocked: [[2,2],[2,5],[5,2],[5,5]],
    stars: [4800, 8500, 12000]
  }),
  makeLevel(26, {
    name: 'Labirinto Profundo',
    objective: { type: 'score', target: 16000 },
    moves: 16, gemTypes: 6,
    blocked: [[0,2],[0,5],[2,0],[2,7],[5,0],[5,7],[7,2],[7,5],[3,3],[4,4],[3,4],[4,3]],
    stars: [6400, 12000, 16000]
  }),
  makeLevel(27, {
    name: 'Corrida Relâmpago',
    objective: { type: 'score', target: 15000 },
    moves: null, time: 50, gemTypes: 6,
    blocked: [[1,1],[1,6],[6,1],[6,6]],
    stars: [6000, 11000, 15000]
  }),
  makeLevel(28, {
    name: 'Grande Coleta',
    objective: { type: 'collect', target: 50, gemType: 0, label: 'Rubis' },
    moves: 20, gemTypes: 6,
    blocked: [[2,2],[5,5],[2,5],[5,2]],
    stars: [20, 35, 50]
  }),
  makeLevel(29, {
    name: 'Palco de Cristal',
    objective: { type: 'score', target: 18000 },
    moves: 15, gemTypes: 6,
    blocked: [[0,3],[0,4],[7,3],[7,4],[3,0],[4,0],[3,7],[4,7],[3,3],[4,4]],
    stars: [7200, 13000, 18000]
  }),
  makeLevel(30, {
    name: 'Fim do Capítulo III',
    objective: { type: 'score', target: 20000 },
    moves: null, time: 45, gemTypes: 6,
    blocked: [[0,0],[0,7],[7,0],[7,7],[2,2],[2,5],[5,2],[5,5],[3,3],[4,4]],
    stars: [8000, 15000, 20000]
  }),

  // ═══════ CHAPTER 4: Tempestade Radiante (31-40) ═══════
  makeLevel(31, {
    name: 'Olho da Tempestade',
    objective: { type: 'score', target: 22000 },
    moves: 14, gemTypes: 6,
    blocked: [[0,0],[0,1],[0,6],[0,7],[1,0],[1,7],[6,0],[6,7],[7,0],[7,1],[7,6],[7,7]],
    stars: [8800, 16000, 22000]
  }),
  makeLevel(32, {
    name: 'Fusão Explosiva',
    objective: { type: 'score', target: 25000 },
    moves: null, time: 40, gemTypes: 6,
    blocked: [[1,1],[1,3],[1,5],[3,1],[3,5],[5,1],[5,3],[5,5]],
    stars: [10000, 18000, 25000]
  }),
  makeLevel(33, {
    name: 'Coletor Supremo',
    objective: { type: 'collect', target: 60, gemType: 1, label: 'Esmeraldas' },
    moves: 18, gemTypes: 6,
    blocked: [[3,3],[4,4],[3,4],[4,3],[0,0],[7,7]],
    stars: [24, 42, 60]
  }),
  makeLevel(34, {
    name: 'Velocidade Máxima',
    objective: { type: 'score', target: 20000 },
    moves: null, time: 35, gemTypes: 6,
    blocked: [[2,2],[2,5],[5,2],[5,5]],
    stars: [8000, 14000, 20000]
  }),
  makeLevel(35, {
    name: 'Xadrez de Gemas',
    objective: { type: 'score', target: 28000 },
    moves: 16, gemTypes: 6,
    blocked: [[0,1],[0,3],[0,5],[0,7],[1,0],[1,2],[1,4],[1,6],
              [6,1],[6,3],[6,5],[6,7],[7,0],[7,2],[7,4],[7,6]],
    stars: [11200, 21000, 28000]
  }),
  makeLevel(36, {
    name: 'Pressão Máxima',
    objective: { type: 'score', target: 30000 },
    moves: 14, gemTypes: 6,
    blocked: [[0,0],[0,7],[7,0],[7,7],[1,1],[1,6],[6,1],[6,6],
              [3,3],[3,4],[4,3],[4,4]],
    stars: [12000, 22000, 30000]
  }),
  makeLevel(37, {
    name: 'Tempestade de Safiras',
    objective: { type: 'collect', target: 70, gemType: 2, label: 'Safiras' },
    moves: 22, gemTypes: 6,
    blocked: [[2,2],[2,5],[5,2],[5,5],[0,0],[0,7],[7,0],[7,7]],
    stars: [28, 50, 70]
  }),
  makeLevel(38, {
    name: 'Blitz Final',
    objective: { type: 'score', target: 25000 },
    moves: null, time: 30, gemTypes: 6,
    blocked: [[3,3],[4,4]],
    stars: [10000, 18000, 25000]
  }),
  makeLevel(39, {
    name: 'Maestria das Cores',
    objective: { type: 'score', target: 35000 },
    moves: 15, gemTypes: 6,
    blocked: [[0,3],[0,4],[3,0],[4,0],[3,7],[4,7],[7,3],[7,4],
              [2,2],[2,5],[5,2],[5,5],[3,3],[4,4]],
    stars: [14000, 26000, 35000]
  }),
  makeLevel(40, {
    name: 'Fim do Capítulo IV',
    objective: { type: 'score', target: 40000 },
    moves: null, time: 60, gemTypes: 6,
    blocked: [[0,0],[0,7],[7,0],[7,7],[1,1],[1,6],[6,1],[6,6],
              [2,2],[2,5],[5,2],[5,5],[3,3],[3,4],[4,3],[4,4]],
    stars: [16000, 30000, 40000]
  }),

  // ═══════ CHAPTER 5: Maestria Diamante (41-50) ═══════
  makeLevel(41, {
    name: 'Iniciação ao Diamante',
    objective: { type: 'score', target: 45000 },
    moves: 14, gemTypes: 6,
    blocked: [[0,0],[0,1],[0,6],[0,7],[1,0],[6,0],[1,7],[6,7],
              [7,0],[7,1],[7,6],[7,7],[3,3],[4,4]],
    stars: [18000, 34000, 45000]
  }),
  makeLevel(42, {
    name: 'Velocidade do Mestre',
    objective: { type: 'score', target: 35000 },
    moves: null, time: 45, gemTypes: 6,
    blocked: [[2,2],[2,5],[5,2],[5,5],[3,3],[4,4]],
    stars: [14000, 26000, 35000]
  }),
  makeLevel(43, {
    name: 'Coleção Suprema',
    objective: { type: 'collect', target: 80, gemType: 5, label: 'Diamantes' },
    moves: 24, gemTypes: 6,
    blocked: [[0,0],[0,7],[7,0],[7,7],[3,3],[4,4]],
    stars: [32, 55, 80]
  }),
  makeLevel(44, {
    name: 'Labirinto Final',
    objective: { type: 'score', target: 50000 },
    moves: 14, gemTypes: 6,
    blocked: [[0,2],[0,5],[2,0],[2,7],[5,0],[5,7],[7,2],[7,5],
              [1,3],[1,4],[6,3],[6,4],[3,1],[4,1],[3,6],[4,6],
              [3,3],[4,4]],
    stars: [20000, 37000, 50000]
  }),
  makeLevel(45, {
    name: 'Contagem Regressiva',
    objective: { type: 'score', target: 40000 },
    moves: null, time: 40, gemTypes: 6,
    blocked: [[1,1],[1,6],[6,1],[6,6],[3,3],[4,4],[0,0],[7,7],[0,7],[7,0]],
    stars: [16000, 30000, 40000]
  }),
  makeLevel(46, {
    name: 'Pressão Suprema',
    objective: { type: 'score', target: 55000 },
    moves: 13, gemTypes: 6,
    blocked: [[0,0],[0,3],[0,4],[0,7],[3,0],[4,0],[3,7],[4,7],
              [7,0],[7,3],[7,4],[7,7],[2,2],[5,5],[2,5],[5,2]],
    stars: [22000, 41000, 55000]
  }),
  makeLevel(47, {
    name: 'Relâmpago Dourado',
    objective: { type: 'score', target: 45000 },
    moves: null, time: 35, gemTypes: 6,
    blocked: [[0,0],[0,7],[7,0],[7,7],[2,2],[2,5],[5,2],[5,5]],
    stars: [18000, 33000, 45000]
  }),
  makeLevel(48, {
    name: 'Mestre Colecionador',
    objective: { type: 'collect', target: 100, gemType: 4, label: 'Ametistas' },
    moves: 28, gemTypes: 6,
    blocked: [[3,3],[4,4],[3,4],[4,3]],
    stars: [40, 70, 100]
  }),
  makeLevel(49, {
    name: 'Penúltimo Desafio',
    objective: { type: 'score', target: 60000 },
    moves: 13, gemTypes: 6,
    blocked: [[0,0],[0,1],[0,6],[0,7],[1,0],[1,7],[6,0],[6,7],
              [7,0],[7,1],[7,6],[7,7],[2,2],[2,5],[5,2],[5,5],
              [3,3],[4,4],[3,4],[4,3]],
    stars: [24000, 45000, 60000]
  }),
  makeLevel(50, {
    name: '★ Diamante Eterno ★',
    objective: { type: 'score', target: 100000 },
    moves: null, time: 120, gemTypes: 6,
    blocked: [[0,0],[0,7],[7,0],[7,7],[0,3],[0,4],[7,3],[7,4],
              [3,0],[4,0],[3,7],[4,7]],
    stars: [40000, 70000, 100000]
  })
];

/**
 * Get level config by id (1-indexed)
 */
function getLevel(id) {
  return LEVELS.find(l => l.id === id) || LEVELS[0];
}

/**
 * Get chapter for a level id
 */
function getChapterForLevel(levelId) {
  return CHAPTERS.find(c => levelId >= c.levels[0] && levelId <= c.levels[1]);
}

/**
 * Calculate stars earned
 */
function calcStars(level, score) {
  const t = level.starThresholds;
  if (score >= t[2]) return 3;
  if (score >= t[1]) return 2;
  if (score >= t[0]) return 1;
  return 0;
}

// Saved progress (localStorage)
const Progress = {
  data: null,

  load() {
    try {
      this.data = JSON.parse(localStorage.getItem('bijuled_progress') || '{}');
    } catch {
      this.data = {};
    }
    if (!this.data.stars) this.data.stars = {};
    if (this.data.maxLevel === undefined) this.data.maxLevel = 1;
    return this;
  },

  save() {
    try {
      localStorage.setItem('bijuled_progress', JSON.stringify(this.data));
    } catch {}
  },

  getLevelStars(id) {
    return (this.data.stars && this.data.stars[id]) || 0;
  },

  setLevelStars(id, stars) {
    const prev = this.getLevelStars(id);
    if (stars > prev) {
      this.data.stars[id] = stars;
    }
    if (id >= this.data.maxLevel) {
      this.data.maxLevel = id + 1;
    }
    this.save();
  },

  isUnlocked(id) {
    return id <= (this.data.maxLevel || 1);
  },

  isCompleted(id) {
    return this.getLevelStars(id) > 0;
  }
};
