document.addEventListener('DOMContentLoaded', () => {
  const ROWS = 20;
  const COLS = 10;
  let tetris = new Tetris(ROWS, COLS);
  const controller = new Controller(tetris);
  const renderer = new Renderer(tetris);

  const themeSong = document.getElementById('theme-song');
  const playPauseButton = document.getElementById('play-pause-button');
  const soundToggleButton = document.getElementById('sound-toggle-button');
  const legalNotice = document.getElementById('legal-notice');
  const gameContainer = document.querySelector('.game-container');

  let soundEnabled = true;
  tetris.gamePaused = false;
  tetris.gameRunning = false;

  soundToggleButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleButton.innerText = soundEnabled ? '🔊' : '🔇';
    themeSong.muted = !soundEnabled;
  });

  playPauseButton.addEventListener('click', () => {
    if (tetris.gameRunning) {
      tetris.gamePaused = !tetris.gamePaused;
      if (tetris.gamePaused) {
        themeSong.pause();
        playPauseButton.innerText = '▶';
      } else {
        startCountdown(() => {
          themeSong.play().catch(() => {});
          playPauseButton.innerText = '⏸';
          lastTime = performance.now();
          update();
        });
      }
    } else {
      tetris.reset();
      tetris.gameRunning = true;
      tetris.gamePaused = false;
      legalNotice.style.display = 'none'; // Hide the legal notice
      gameContainer.style.display = 'flex'; // Show the game container
      startCountdown(() => {
        themeSong.play().catch(() => {});
        playPauseButton.innerText = '⏸';
        lastTime = performance.now();
        update();
      });
    }
  });

  function startCountdown(callback) {
    let countdown = 3;
    const countdownElement = document.createElement('div');
    countdownElement.id = 'countdown';
    countdownElement.style.position = 'absolute';
    countdownElement.style.top = '50%';
    countdownElement.style.left = '50%';
    countdownElement.style.transform = 'translate(-50%, -50%)';
    countdownElement.style.fontSize = '72px';
    countdownElement.style.color = '#007BFF';
    countdownElement.style.fontWeight = 'bold';
    countdownElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    countdownElement.style.padding = '20px';
    countdownElement.style.borderRadius = '10px';
    countdownElement.style.textAlign = 'center';
    countdownElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(countdownElement);

    const countdownInterval = setInterval(() => {
      countdownElement.innerText = countdown;
      countdown--;
      if (countdown < 0) {
        clearInterval(countdownInterval);
        document.body.removeChild(countdownElement);
        callback();
      }
    }, 1000);
  }

  function displayGameOver() {
    const gameOverElement = document.createElement('div');
    gameOverElement.id = 'game-over';
    gameOverElement.style.position = 'absolute';
    gameOverElement.style.top = '50%';
    gameOverElement.style.left = '50%';
    gameOverElement.style.transform = 'translate(-50%, -50%)';
    gameOverElement.style.fontSize = '48px';
    gameOverElement.style.color = '#FF0000';
    gameOverElement.style.fontWeight = 'bold';
    gameOverElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    gameOverElement.style.padding = '10px';
    gameOverElement.style.borderRadius = '10px';
    gameOverElement.style.textAlign = 'center';
    gameOverElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    gameOverElement.innerText = 'Game Over';
    document.body.appendChild(gameOverElement);

    setTimeout(() => {
      document.body.removeChild(gameOverElement);
      tetris.ctx.clearRect(0, 0, tetris.canvas.width, tetris.canvas.height);
    }, 3000);
  }

  let lastTime = 0;
  const dropInterval = 1000;

  function update(time = 0) {
    if (tetris.gamePaused || tetris.gameOver || !tetris.gameRunning) return;

    const deltaTime = time - lastTime;

    if (deltaTime > dropInterval / tetris.level) {
      tetris.drop();
      lastTime = time;
    }

    renderer.draw();
    if (!tetris.gameOver) {
      requestAnimationFrame(update);
    } else {
      displayGameOver();
      setTimeout(() => {
        tetris.gameRunning = false;
        tetris.gamePaused = true;
        tetris.ctx.clearRect(0, 0, tetris.canvas.width, tetris.canvas.height);
      }, 3000);
    }
  }

  function resetGame() {
    tetris.reset();
    renderer.draw();
    playPauseButton.innerText = '▶';
    tetris.gameRunning = false;
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      tetris.stopGame();
    }
  });

  // Show the legal notice at the beginning
  legalNotice.style.display = 'block';
  setTimeout(() => {
    legalNotice.style.display = 'none';
    gameContainer.style.display = 'flex';
  }, 5000); // Adjust the duration as needed
});
