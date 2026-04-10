import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  queueDirection,
  randomFoodIndex,
  startGame,
  stepGame,
  togglePause,
} from "./snake-core.js";

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll(".control-button");

let state = createInitialState(randomFoodIndex(GRID_SIZE), GRID_SIZE);
let tickHandle = null;
let pointerStart = null;

function buildBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    fragment.appendChild(cell);
  }

  boardElement.replaceChildren(fragment);
}

function toCellIndex(position) {
  return position.y * GRID_SIZE + position.x;
}

function render() {
  const cells = boardElement.children;

  for (const cell of cells) {
    cell.className = "cell";
  }

  for (const segment of state.snake) {
    cells[toCellIndex(segment)]?.classList.add("cell--snake");
  }

  if (state.food) {
    cells[toCellIndex(state.food)]?.classList.add("cell--food");
  }

  scoreElement.textContent = String(state.score);

  if (state.isGameOver) {
    statusElement.textContent = "Game over. Press Restart to try again.";
    pauseButton.textContent = "Pause";
    return;
  }

  if (!state.isStarted) {
    statusElement.textContent = "Press Start to play.";
    pauseButton.textContent = "Pause";
    return;
  }

  if (state.isPaused) {
    statusElement.textContent = "Paused. Press Space, P, or Pause to resume.";
    pauseButton.textContent = "Resume";
    return;
  }

  statusElement.textContent = "Use keys, swipe, or touch pad to guide the snake.";
  pauseButton.textContent = "Pause";
}

function stopLoop() {
  if (tickHandle !== null) {
    window.clearInterval(tickHandle);
    tickHandle = null;
  }
}

function ensureLoop() {
  stopLoop();
  tickHandle = window.setInterval(() => {
    state = stepGame(state, randomFoodIndex(GRID_SIZE));
    render();

    if (state.isGameOver) {
      stopLoop();
    }
  }, TICK_MS);
}

function restartGame() {
  state = createInitialState(randomFoodIndex(GRID_SIZE), GRID_SIZE);
  render();
  stopLoop();
}

function applyDirection(direction) {
  state = queueDirection(state, direction);

  if (!state.isStarted && !state.isGameOver) {
    state = startGame(state);
    ensureLoop();
  }

  render();
}

function handleKeydown(event) {
  const directionByKey = {
    ArrowUp: "UP",
    w: "UP",
    W: "UP",
    ArrowDown: "DOWN",
    s: "DOWN",
    S: "DOWN",
    ArrowLeft: "LEFT",
    a: "LEFT",
    A: "LEFT",
    ArrowRight: "RIGHT",
    d: "RIGHT",
    D: "RIGHT",
  };

  if (event.key === " " || event.key === "p" || event.key === "P") {
    event.preventDefault();
    state = togglePause(state);

    if (state.isPaused || state.isGameOver || !state.isStarted) {
      stopLoop();
    } else {
      ensureLoop();
    }

    render();
    return;
  }

  const direction = directionByKey[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  applyDirection(direction);
}

function clearPointerStart() {
  pointerStart = null;
}

function handlePointerDown(event) {
  pointerStart = {
    x: event.clientX,
    y: event.clientY,
  };
}

function handlePointerUp(event) {
  if (!pointerStart) {
    return;
  }

  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const minDistance = 18;

  clearPointerStart();

  if (Math.max(absX, absY) < minDistance) {
    return;
  }

  if (absX > absY) {
    applyDirection(deltaX > 0 ? "RIGHT" : "LEFT");
    return;
  }

  applyDirection(deltaY > 0 ? "DOWN" : "UP");
}

buildBoard();
render();

document.addEventListener("keydown", handleKeydown);
boardElement.addEventListener("pointerdown", handlePointerDown);
boardElement.addEventListener("pointerup", handlePointerUp);
boardElement.addEventListener("pointercancel", clearPointerStart);
boardElement.addEventListener("pointerleave", clearPointerStart);

startButton.addEventListener("click", () => {
  state = startGame(state);

  if (!state.isPaused && !state.isGameOver) {
    ensureLoop();
  }

  render();
});

pauseButton.addEventListener("click", () => {
  state = togglePause(state);

  if (state.isPaused || state.isGameOver || !state.isStarted) {
    stopLoop();
  } else {
    ensureLoop();
  }

  render();
});

restartButton.addEventListener("click", restartGame);

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    applyDirection(button.dataset.direction);
  });
}
