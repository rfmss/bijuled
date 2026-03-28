/**
 * BIJULED · compliments.js
 * Elogios femininos em 3 tiers — aparecem na tela com animação e voz
 * ES5 puro, sem dependências
 */

var Compliments = (function () {

  /* ── 150 adjetivos em 3 tiers ──────────────────────────────── */
  var TIERS = [
    /* tier 1 — combinação simples (3 pedras) */
    [
      'Linda','Bela','Graciosa','Encantadora','Delicada',
      'Suave','Elegante','Charmosa','Doce','Especial',
      'Única','Bonita','Gentil','Carinhosa','Terna',
      'Serena','Luminosa','Alegre','Viva','Talentosa',
      'Criativa','Intuitiva','Sensível','Refinada','Simpática',
      'Amorosa','Querida','Preciosa','Leve','Espontânea',
      'Autêntica','Cativante','Expressiva','Calorosa','Vibrante',
      'Sonhadora','Livre','Corajosa','Determinada','Forte',
      'Brilhante','Perspicaz','Marcante','Inspiradora','Audaciosa',
      'Destemida','Guerreira','Radiante','Atenciosa','Encantada'
    ],
    /* tier 2 — combinação de 4+, combo x2 */
    [
      'Deslumbrante','Magnífica','Esplêndida','Gloriosa','Sublime',
      'Fabulosa','Fascinante','Majestosa','Poderosa','Invencível',
      'Incomparável','Prodigiosa','Admirável','Formidável','Impressionante',
      'Reluzente','Irresistível','Imbatível','Inesquecível','Impecável',
      'Espetacular','Fenomenal','Incrível','Notável','Excepcional',
      'Distinta','Sofisticada','Primorosa','Grandiosa','Altiva',
      'Nobre','Venerável','Ilustre','Imaculada','Triunfante',
      'Vencedora','Conquistadora','Estupenda','Resplandecente','Portentosa',
      'Privilegiada','Exuberante','Soberana','Imponente','Magnânima',
      'Irretocável','Esplandecente','Incontestável','Surpreendente','Flamejante'
    ],
    /* tier 3 — pedra especial criada, combo x3+, match de 5 */
    [
      'Lendária','Mítica','Épica','Imortal','Divina',
      'Celestial','Suprema','Absoluta','Transcendente','Inigualável',
      'Insuperável','Perfeita','Magnífica demais','Estonteante','Hipnótica',
      'Arrebatadora','Avassaladora','Ofuscante','Excelsa','Esplendorosa',
      'Luminescente','Cintilante','Refulgente','Sideral','Galáctica',
      'Cósmica','Sagrada','Singular','Monumental','Titânica',
      'Portentosíssima','Deslumbrosa','Magnífica total','Devastadora','Fulminante',
      'Fenomenal demais','Olímpica','Grandiosa total','Absoluta rainha','Imbatível total',
      'Espetacular demais','Incrível demais','Irresistível total','Invencível total','Fulgorosa',
      'Resplandescente','Ancestral','Primordial','Inaugural','Universal'
    ]
  ];

  /* ── Estado de voz ─────────────────────────────────────────── */
  var voiceReady = false;
  var ptVoice    = null;

  // Nomes de vozes masculinas conhecidas nos sistemas operacionais
  var MALE_NAMES = ['luciano','daniel','reed','jorge','carlos','rodrigo','google uk english male','google us english male'];

  function isMaleVoice(v) {
    var name = v.name.toLowerCase();
    if (name.indexOf('female') !== -1 || name.indexOf('feminina') !== -1) return false;
    if (name.indexOf('male') !== -1 && name.indexOf('female') === -1) return true;
    for (var i = 0; i < MALE_NAMES.length; i++) {
      if (name.indexOf(MALE_NAMES[i]) !== -1) return true;
    }
    return false;
  }

  function loadVoice() {
    if (!window.speechSynthesis) return;
    var load = function () {
      var voices = speechSynthesis.getVoices();
      var ptBrMale = null;   // pt-BR + masculina
      var ptMale   = null;   // pt (qualquer) + masculina
      var ptBrAny  = null;   // pt-BR qualquer
      var ptAny    = null;   // pt qualquer

      for (var i = 0; i < voices.length; i++) {
        var v = voices[i];
        var lang = v.lang.toLowerCase();
        var isPtBr = (lang === 'pt-br' || lang === 'pt_br');
        var isPt   = (lang.indexOf('pt') === 0);
        var male   = isMaleVoice(v);

        if (isPtBr && male && !ptBrMale) ptBrMale = v;
        if (isPt   && male && !ptMale)   ptMale   = v;
        if (isPtBr && !ptBrAny)          ptBrAny  = v;
        if (isPt   && !ptAny)            ptAny    = v;
      }
      // hierarquia de preferência
      ptVoice = ptBrMale || ptMale || ptBrAny || ptAny;
      voiceReady = true;
    };
    if (speechSynthesis.getVoices().length > 0) {
      load();
    } else {
      speechSynthesis.addEventListener('voiceschanged', load);
    }
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang    = 'pt-BR';
    u.pitch   = 0.72;   // grave, aveludado
    u.rate    = 0.80;   // cadência pausada e calorosa
    u.volume  = 0.80;
    if (ptVoice) u.voice = ptVoice;
    speechSynthesis.speak(u);
  }

  /* ── Elemento DOM do elogio ────────────────────────────────── */
  var el = null;
  var hideTimer = null;

  function getEl() {
    if (!el) {
      el = document.getElementById('compliment-display');
    }
    return el;
  }

  /* ── API pública ─────────────────────────────────────────────
     tier: 0 | 1 | 2
  ─────────────────────────────────────────────────────────────── */
  function show(tier) {
    var list = TIERS[Math.min(tier, 2)];
    var word = list[Math.floor(Math.random() * list.length)];

    var node = getEl();
    if (!node) return;

    clearTimeout(hideTimer);
    node.textContent = word;
    node.className   = 'compliment-display tier-' + tier + ' show';

    speak(word);

    hideTimer = setTimeout(function () {
      node.classList.remove('show');
      node.classList.add('hide');
      setTimeout(function () {
        node.className = 'compliment-display';
      }, 600);
    }, 1400);
  }

  loadVoice();
  return { show: show };

})();
