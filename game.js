const IMAGES = {
  boy: "./assets/img/Boy.png",
  girl: "./assets/img/Girl.png",
  terror: "./assets/img/Terror.png",
  opp_leader: "./assets/img/opp_leader.png"
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

function showMidMessageIfNeeded() {
  if (score === 1 && !firstKillMessageShown) {
    firstKillMessageShown = true;
    gamePaused = true;
    showOverlay(midOverlay);
    renderBoard();
  }
}

function closeMidMessage() {
  gamePaused = false;
  hideOverlay(midOverlay);
  renderBoard();
}

function endGame() {
  gameOver = true;
  gamePaused = true;

  updateCounters();
  showOverlay(gameOverOverlay);
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
    moveTerror(board);

    setTimeout(() => {
      board = buildInitialBoard();
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

  hideOverlay(midOverlay);
  hideOverlay(gameOverOverlay);

  updateCounters();
  renderBoard();
}

function startGame() {
  initAudio();

  gameStarted = true;
  gameContent.classList.remove("hidden-before-start");
  hideOverlay(startOverlay);

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