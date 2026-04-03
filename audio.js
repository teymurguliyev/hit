function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  bgMusic.load();
  failMusic.load();
}

function playTone(freq, duration, type, volume) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playHitSound() {
  playTone(880, 0.08, "square", 0.06);
  setTimeout(() => playTone(1180, 0.06, "square", 0.04), 40);
}

function playMissSound() {
  playTone(220, 0.18, "sawtooth", 0.08);
  setTimeout(() => playTone(140, 0.24, "sawtooth", 0.06), 60);
}

function startMusic() {
  failMusic.pause();
  failMusic.currentTime = 0;

  bgMusic.pause();
  bgMusic.currentTime = 0;
  bgMusic.play().catch((err) => console.log("bgMusic play error:", err));
}

function playFailMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;

  failMusic.pause();
  failMusic.currentTime = 0;
  failMusic.play().catch((err) => console.log("failMusic play error:", err));
}