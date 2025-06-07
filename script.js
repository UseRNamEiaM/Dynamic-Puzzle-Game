let gridSize = 3;
let tiles = [];
let moveCount = 0;
let timer = 0;
let interval;
let imageSrc = '';

const grid = document.getElementById('puzzle-grid');
const startButton = document.getElementById('start-button');
const moveCounter = document.getElementById('move-counter');
const timerDisplay = document.getElementById('timer');
const message = document.getElementById('message');
const difficultySelect = document.getElementById('difficulty');
const imageUpload = document.getElementById('image-upload');
const highScoreDisplay = document.getElementById('high-score');

const resetButton = document.getElementById('reset-button');
const darkToggle = document.getElementById('dark-toggle');
const musicToggle = document.getElementById('music-toggle');
const tryNewBtn = document.getElementById('try-new');
const volUp = document.getElementById('vol-up');
const volDown = document.getElementById('vol-down');
const volDisplay = document.getElementById('vol-display');

const bgMusic = document.getElementById('bg-music');
const solvedSound = document.getElementById('solved-sound');

const welcomeScreen = document.getElementById('welcome-screen');
const enterButton = document.getElementById('enter-button');
const mainGame = document.getElementById('main-game');
const winScreen = document.getElementById('win-screen');


function createFloatingPieces() {
  const container = document.getElementById('floating-pieces');
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className = 'floating-piece';
    piece.textContent = '🧩';

    const size = Math.random() * 20 + 16; // Font size 16px to 36px
    const left = Math.random() * 100;
    const duration = Math.random() * 20 + 10; // 10s to 30s
    const delay = Math.random() * 5;

    piece.style.left = `${left}vw`;
    piece.style.fontSize = `${size}px`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;

    container.appendChild(piece);
  }
}

// Call it on load
createFloatingPieces();

// Welcome Screen Transition
enterButton.addEventListener('click', () => {
  welcomeScreen.classList.add('hidden');
  mainGame.classList.remove('hidden');
  bgMusic.play();
});

// Volume setup
bgMusic.volume = 0.5;
solvedSound.volume = 0.5;

function updateVolumeDisplay() {
  volDisplay.textContent = `${Math.round(bgMusic.volume * 100)}%`;
}
updateVolumeDisplay();

volUp.addEventListener('click', () => {
  bgMusic.volume = Math.min(1, bgMusic.volume + 0.1);
  solvedSound.volume = bgMusic.volume;
  updateVolumeDisplay();
});

volDown.addEventListener('click', () => {
  bgMusic.volume = Math.max(0, bgMusic.volume - 0.1);
  solvedSound.volume = bgMusic.volume;
  updateVolumeDisplay();
});

// Image Upload
imageUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imageSrc = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

difficultySelect.addEventListener('change', () => {
  gridSize = parseInt(difficultySelect.value);
  showHighScore();
});

function createTiles() {
  tiles = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.draggable = true;
    tile.dataset.index = i;

    const tileSize = 400 / gridSize;
    tile.style.width = tile.style.height = `${tileSize}px`;
    tile.style.backgroundImage = `url('${imageSrc}')`;

    let x = i % gridSize;
    let y = Math.floor(i / gridSize);
    tile.style.backgroundSize = `${400}px ${400}px`;
    tile.style.backgroundPosition = `-${x * tileSize}px -${y * tileSize}px`;

    tile.addEventListener('dragstart', dragStart);
    tile.addEventListener('dragover', dragOver);
    tile.addEventListener('drop', drop);
    tile.addEventListener('dragend', dragEnd);

    tiles.push(tile);
  }

  grid.style.gridTemplateColumns = `repeat(${gridSize}, ${400 / gridSize}px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, ${400 / gridSize}px)`;
}

function renderTiles() {
  grid.innerHTML = '';
  tiles.forEach(tile => grid.appendChild(tile));
}

function shuffleTiles() {
  moveCount = 0;
  timer = 0;
  updateMoveCounter();
  updateTimer();
  message.textContent = '';
  clearInterval(interval);
  winScreen.classList.add('hidden');

  let shuffled = tiles.slice();
  do {
    shuffled.sort(() => Math.random() - 0.5);
  } while (!isSolvable(shuffled));

  tiles = shuffled;
  renderTiles();

  interval = setInterval(() => {
    timer++;
    updateTimer();
  }, 1000);
}

function isSolvable(arr) {
  let inversions = 0;
  let order = arr.map(t => +t.dataset.index);
  for (let i = 0; i < order.length - 1; i++) {
    for (let j = i + 1; j < order.length; j++) {
      if (order[i] > order[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

function dragStart(e) {
  const dragIndex = tiles.findIndex(tile => tile === e.target);
  e.dataTransfer.setData('text/plain', dragIndex);
  e.target.classList.add('dragging');
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
  const toIndex = tiles.findIndex(tile => tile === e.target);
  if (fromIndex !== toIndex) {
    swapTilesByIndex(fromIndex, toIndex);
    moveCount++;
    updateMoveCounter();
    checkIfSolved();
  }
}

function dragEnd(e) {
  e.target.classList.remove('dragging');
}

function swapTilesByIndex(fromIndex, toIndex) {
  const temp = tiles[fromIndex];
  tiles[fromIndex] = tiles[toIndex];
  tiles[toIndex] = temp;
  renderTiles();
}

function updateMoveCounter() {
  moveCounter.textContent = `Moves: ${moveCount}`;
}

function updateTimer() {
  timerDisplay.textContent = `Time: ${timer}s`;
}

function checkIfSolved() {
  const isSolved = tiles.every((tile, index) => tile.dataset.index == index);
  if (isSolved) {
    clearInterval(interval);
    solvedSound.play();
    winScreen.classList.remove('hidden');
    mainGame.classList.add('hidden');
    saveHighScore();
  }
}

function saveHighScore() {
  const key = `highscore_${gridSize}x${gridSize}`;
  const existing = JSON.parse(localStorage.getItem(key));
  if (!existing || timer < existing.time || (timer === existing.time && moveCount < existing.moves)) {
    localStorage.setItem(key, JSON.stringify({ moves: moveCount, time: timer }));
  }
}

function showHighScore() {
  const key = `highscore_${gridSize}x${gridSize}`;
  const score = JSON.parse(localStorage.getItem(key));
  if (score) {
    highScoreDisplay.textContent = `🏆 Best for ${gridSize}x${gridSize} → Moves: ${score.moves}, Time: ${score.time}s`;
  } else {
    highScoreDisplay.textContent = '';
  }
}

startButton.addEventListener('click', () => {
  if (!imageSrc) {
    alert("Please upload an image before starting.");
    return;
  }
  createTiles();
  shuffleTiles();
});

resetButton.addEventListener('click', () => {
  if (tiles.length > 0) shuffleTiles();
});

tryNewBtn.addEventListener('click', () => {
  clearInterval(interval);
  tiles = [];
  grid.innerHTML = '';
  message.textContent = '';
  moveCount = 0;
  timer = 0;
  updateMoveCounter();
  updateTimer();
  imageSrc = '';
  imageUpload.value = '';
  mainGame.classList.remove('hidden');
  winScreen.classList.add('hidden');
  alert("Upload a new image to play again!");
});

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkToggle.textContent = document.body.classList.contains('dark')
    ? '☀️ '
    : '🌙 ';
});

musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicToggle.textContent = '🔊';
  } else {
    bgMusic.pause();
    musicToggle.textContent = '🎵';
  }
});

const backToMain = document.getElementById('back-to-main');

backToMain.addEventListener('click', () => {
  winScreen.classList.add('hidden');
  mainGame.classList.remove('hidden');
  grid.innerHTML = '';
  moveCount = 0;
  timer = 0;
  updateMoveCounter();
  updateTimer();
  message.textContent = '';
});

