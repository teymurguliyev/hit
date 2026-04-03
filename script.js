const IMAGES = {
  boy: "./assets/img/Boy.png",
  girl: "./assets/img/Girl.png",
  terror: "./assets/img/Terror.png"
};

const START_AMMO = 90000000;
const START_TARGETS = 90000000;

const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const ammoEl = document.getElementById("ammo");
const targetsEl = document.getElementById("targets");
const finalScoreEl = document.getElementById("finalScore");
const finalAmmoEl = document.getElementById("finalAmmo");
const finalTargetsEl = document.getElementById("finalTargets");

const restartBtn = document.getElementById("restartBtn");
const overlayRestartBtn = document.getElementById("overlayRestartBtn");
const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");

const startOverlay = document.getElementById("startOverlay");
const midOverlay = document.getElementById("midOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const gameContent = document.getElementById("gameContent");

let board = [];
let score = 0;
let ammunition = START_AMMO;
let potentialTargets = START_TARGETS;
let gameOver = false;
let gameStarted = false;
let gamePaused = true;
let audioCtx = null;
let firstKillMessageShown = false;

const bgMusic = createAudio("./assets/music/music.mp3", {
  loop: true,
  volume: 0.3,
});

const failMusic = createAudio("./assets/music/fail_music.mp3", {
  volume: 0.4,
});

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function createAudio(src, { loop = false, volume = 1 } = {}) {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
}

function formatNumber(value) {
  return value.toLocaleString("en-US");
}

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

function buildInitialBoard() {
  const girlsCount = Math.random() < 0.5 ? 7 : 8;
  const boysCount = 15 - girlsCount;

  const civilians = [
    ...Array(boysCount).fill("boy"),
    ...Array(girlsCount).fill("girl")
  ];

  const terrorIndex = randomInt(16);
  const newBoard = [];
  let civilianCursor = 0;

  for (let i = 0; i < 16; i++) {
    if (i === terrorIndex) {
      newBoard.push("terror");
    } else {
      newBoard.push(civilians[civilianCursor]);
      civilianCursor++;
    }
  }

  return newBoard;
}

function updateCounters() {
  scoreEl.textContent = formatNumber(score);
  ammoEl.textContent = formatNumber(ammunition);
  targetsEl.textContent = formatNumber(potentialTargets);

  finalScoreEl.textContent = `Final score: ${formatNumber(score)}`;
  finalAmmoEl.textContent = `Remaining ammunition: ${formatNumber(ammunition)}`;
  finalTargetsEl.textContent = `Potential targets left: ${formatNumber(potentialTargets)}`;
}

function renderBoard() {
  grid.innerHTML = "";

  board.forEach((type, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.dataset.index = index;
    button.disabled = gameOver || !gameStarted || gamePaused;
    button.setAttribute("aria-label", "Character cell");

    const img = document.createElement("img");
    img.src = IMAGES[type];
    img.alt = "";

    button.appendChild(img);
    button.addEventListener("click", () => handleCellClick(index, button));
    grid.appendChild(button);
  });
}

function getTerrorIndex() {
  return board.indexOf("terror");
}

function moveTerror() {
  const currentIndex = getTerrorIndex();
  const possibleTargets = [];

  for (let i = 0; i < board.length; i++) {
    if (i !== currentIndex) {
      possibleTargets.push(i);
    }
  }

  const targetIndex = possibleTargets[randomInt(possibleTargets.length)];
  [board[currentIndex], board[targetIndex]] = [board[targetIndex], board[currentIndex]];
}

function showMidMessageIfNeeded() {
  if (score === 1 && !firstKillMessageShown) {
    firstKillMessageShown = true;
    gamePaused = true;
    midOverlay.classList.add("show");
    midOverlay.setAttribute("aria-hidden", "false");
    renderBoard();
  }
}

function closeMidMessage() {
  gamePaused = false;
  midOverlay.classList.remove("show");
  midOverlay.setAttribute("aria-hidden", "true");
  renderBoard();
}

function endGame() {
  gameOver = true;
  gamePaused = true;

  updateCounters();
  gameOverOverlay.classList.add("show");
  gameOverOverlay.setAttribute("aria-hidden", "false");
  renderBoard();

  playFailMusic();
}

function spendAmmo() {
  if (ammunition > 0) {
    ammunition -= 1;
  }
}

function handleCellClick(index, cellEl) {
  if (!gameStarted || gameOver || gamePaused) return;
  if (ammunition <= 0) return;

  spendAmmo();

  const clickedType = board[index];

  if (clickedType === "terror") {
    score += 1;

    if (potentialTargets > 0) {
      potentialTargets -= 1;
    }

    updateCounters();
    playHitSound();
    cellEl.classList.add("hit");
    moveTerror();

    setTimeout(() => {
      renderBoard();
      showMidMessageIfNeeded();
    }, 55);
  } else {
    updateCounters();
    playMissSound();
    endGame();
  }
}

function resetGameState() {
  failMusic.pause();
  failMusic.currentTime = 0;

  if (gameStarted) {
    startMusic();
  }

  score = 0;
  ammunition = START_AMMO;
  potentialTargets = START_TARGETS;
  gameOver = false;
  board = buildInitialBoard();
  firstKillMessageShown = false;
  gamePaused = false;

  midOverlay.classList.remove("show");
  midOverlay.setAttribute("aria-hidden", "true");
  gameOverOverlay.classList.remove("show");
  gameOverOverlay.setAttribute("aria-hidden", "true");

  updateCounters();
  renderBoard();
}

function startGame() {
  initAudio();

  gameStarted = true;
  gameContent.classList.remove("hidden-before-start");
  startOverlay.classList.remove("show");
  startOverlay.setAttribute("aria-hidden", "true");

  resetGameState();
}

function restartGame() {
  if (!gameStarted) return;
  resetGameState();
}

startBtn.addEventListener("click", startGame);
continueBtn.addEventListener("click", closeMidMessage);
restartBtn.addEventListener("click", restartGame);
overlayRestartBtn.addEventListener("click", restartGame);

updateCounters();