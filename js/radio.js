/**
 * BIJULED · radio.js
 * Rádio de fundo em cadeia automática — MPB e clássicos internacionais
 * ES5 puro: compatível com iOS 9.3.5 / iPad mini 2012
 *
 * API:
 *   RadioBG.init({ volume: 0.25 })   — chame dentro de um evento de clique
 *   RadioBG.stop()                   — para a rádio
 *   RadioBG.setVolume(0.18)          — ajusta volume em tempo real
 */

var RadioBG = (function () {

  /* ── Streams em ordem de preferência ─────────────────────────
     Critérios: MPB primeiro, depois clássicos internacionais,
     priorizados pelos que têm infraestrutura mais robusta.
  ─────────────────────────────────────────────────────────────── */
  /* Todas as URLs abaixo foram verificadas com HTTP 200 ─────── */
  var STREAMS = [
    {
      nome: 'JB FM — Música popular brasileira',
      url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JBFM.mp3'
    },
    {
      nome: 'Antena 1 — Clássicos internacionais',
      url: 'https://antenaone.crossradio.com.br/stream/1/'
    },
    {
      nome: 'SomaFM Seventies — Hits anos 70',
      url: 'https://ice2.somafm.com/seventies-128-mp3'
    },
    {
      nome: 'SomaFM Underground 80s — Hits anos 80',
      url: 'https://ice1.somafm.com/u80s-256-mp3'
    },
    {
      nome: 'Rádio Eldorado — Clássicos BR',
      url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_ELDORADO.mp3'
    },
    {
      nome: 'Radio Swiss Jazz — Jazz internacional',
      url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128'
    },
    {
      nome: 'SomaFM Illinois Street — Soul / Lounge',
      url: 'https://ice1.somafm.com/illstreet-128-mp3'
    },
    {
      nome: 'SomaFM Groove Salad — Downtempo / Chill',
      url: 'https://ice1.somafm.com/groovesalad-256-mp3'
    }
  ];

  /* ── Estado interno ─────────────────────────────────────────── */
  var audio        = null;
  var currentIndex = 0;
  var volume       = 0.25;
  var running      = false;
  var initialized  = false;
  var silenceTimer = null;
  var SILENCE_SEC  = 9;   // segundos sem avanço = stream morta
  var RETRY_MS     = 3000;

  /* ── Watchdog de silêncio ────────────────────────────────────
     Detecta streams congeladas que não emitem `onerror`.
  ─────────────────────────────────────────────────────────────── */
  function startSilenceWatch(index) {
    clearSilenceWatch();
    var lastTime = -1;
    var frozen   = 0;
    silenceTimer = setInterval(function () {
      if (!audio || !running) return;
      var t = audio.currentTime;
      if (t === lastTime && !audio.paused) {
        frozen++;
        if (frozen >= SILENCE_SEC) {
          clearSilenceWatch();
          tryStream(index + 1);
        }
      } else {
        frozen = 0;
      }
      lastTime = t;
    }, 1000);
  }

  function clearSilenceWatch() {
    if (silenceTimer) {
      clearInterval(silenceTimer);
      silenceTimer = null;
    }
  }

  /* ── Núcleo de fallback em cadeia ───────────────────────────── */
  function tryStream(index) {
    if (!running) return;
    if (index >= STREAMS.length) {
      setTimeout(function () { tryStream(0); }, 10000);
      return;
    }
    currentIndex = index;

    if (audio) {
      audio.pause();
      audio.src = '';
      audio.load();
    }

    audio          = new Audio();
    audio.volume   = volume;
    audio.preload  = 'none';

    audio.onerror = function () {
      clearSilenceWatch();
      setTimeout(function () { tryStream(index + 1); }, RETRY_MS);
    };

    audio.onstalled = function () {
      clearSilenceWatch();
      setTimeout(function () { tryStream(index + 1); }, RETRY_MS);
    };

    audio.onended = function () {
      clearSilenceWatch();
      tryStream(index + 1);
    };

    audio.onplaying = function () {
      startSilenceWatch(index);
    };

    audio.src = STREAMS[index].url;

    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p['catch'](function () {
        clearSilenceWatch();
        setTimeout(function () { tryStream(index + 1); }, RETRY_MS);
      });
    }
  }

  /* ── API pública ─────────────────────────────────────────────── */
  function init(opts) {
    if (initialized) return;   // já tocando — não reinicia
    initialized = true;
    running     = true;
    if (opts && opts.volume !== undefined) volume = opts.volume;
    tryStream(0);
  }

  function stop() {
    running     = false;
    initialized = false;
    clearSilenceWatch();
    if (audio) {
      audio.pause();
      audio.src = '';
    }
  }

  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    if (audio) audio.volume = volume;
  }

  var muted = false;
  function toggleMute() {
    muted = !muted;
    if (audio) audio.volume = muted ? 0 : volume;
    return muted;
  }
  function isMuted() { return muted; }

  return { init: init, stop: stop, setVolume: setVolume, toggleMute: toggleMute, isMuted: isMuted };

})();
