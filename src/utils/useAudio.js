/**
 * useAudio — Ambient sound engine for Satu Malam Bulan Purnama
 * Uses the Web Audio API to synthesize sounds without external files.
 */

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// ----------- Low rumble drone (night atmosphere) -----------
let nightDroneNodes = null;

export function startNightAmbience() {
  stopAllAmbience();
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3);
    masterGain.connect(ctx.destination);

    // Low sub-bass drone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(40, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(44, ctx.currentTime + 8);
    osc1.frequency.linearRampToValueAtTime(38, ctx.currentTime + 16);

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(200, ctx.currentTime);
    filter1.Q.setValueAtTime(2, ctx.currentTime);

    osc1.connect(filter1);
    filter1.connect(masterGain);
    osc1.start();

    // Eerie mid tone
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(110, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(105, ctx.currentTime + 6);
    osc2.frequency.linearRampToValueAtTime(115, ctx.currentTime + 12);

    const gainOsc2 = ctx.createGain();
    gainOsc2.gain.setValueAtTime(0.05, ctx.currentTime);
    osc2.connect(gainOsc2);
    gainOsc2.connect(masterGain);
    osc2.start();

    nightDroneNodes = { masterGain, oscs: [osc1, osc2], ctx };
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}

// ----------- Tense day-phase pulse -----------
let dayNodes = null;

export function startDayAmbience() {
  stopAllAmbience();
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2);
    masterGain.connect(ctx.destination);

    // Slightly higher tension tone
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);

    const gainOsc = ctx.createGain();
    gainOsc.gain.setValueAtTime(0.08, ctx.currentTime);
    osc.connect(gainOsc);
    gainOsc.connect(masterGain);
    osc.start();

    // Rhythmic pulse LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.4, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.06, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    dayNodes = { masterGain, oscs: [osc, lfo], ctx };
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}

// ----------- Wolf howl one-shot -----------
export function playWolfHowl() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.0);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
    gainNode.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    // Howl pitch contour
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 1.0);
    osc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 2.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gainNode);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2.6);
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}

// ----------- Vote tension sting -----------
export function playVoteSting() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    [0, 0.15, 0.3].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(80 - i * 15, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.4);
    });
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}

// ----------- Death reveal hit -----------
export function playDeathSound() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const source = ctx.createBufferSource();
    source.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}

// ----------- Lobby tension beat -----------
let lobbyNodes = null;

export function startLobbyAmbience() {
  stopAllAmbience();
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, ctx.currentTime);

    const gainOsc = ctx.createGain();
    gainOsc.gain.setValueAtTime(0.09, ctx.currentTime);
    osc.connect(gainOsc);
    gainOsc.connect(masterGain);
    osc.start();

    lobbyNodes = { masterGain, oscs: [osc], ctx };
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}

// ----------- Stop all ambience -----------
export function stopAllAmbience() {
  [nightDroneNodes, dayNodes, lobbyNodes].forEach(nodes => {
    if (!nodes) return;
    try {
      nodes.masterGain.gain.linearRampToValueAtTime(0, nodes.ctx.currentTime + 1);
      setTimeout(() => {
        nodes.oscs.forEach(o => { try { o.stop(); } catch (_) {} });
      }, 1100);
    } catch (_) {}
  });
  nightDroneNodes = null;
  dayNodes = null;
  lobbyNodes = null;
}
