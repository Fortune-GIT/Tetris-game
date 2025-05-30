const COLS = 10;
const ROWS = 20;
const VISIBLE_ROWS = 20;
const BLOCK_SIZE = 20;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
  [[1, 0, 0], [1, 1, 1]], // J
  [[0, 0, 1], [1, 1, 1]], // L
];

const COLORS = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];

class Tetris {
  constructor() {
    this.canvas = document.getElementById('tetris');
    this.ctx = this.canvas.getContext('2d');
    this.nextPieceCanvas = document.getElementById('next-piece-canvas');
    this.nextPieceCtx = this.nextPieceCanvas.getContext('2d');
    this.holdPieceCanvas = document.getElementById('hold-piece-canvas');
    this.holdPieceCtx = this.holdPieceCanvas.getContext('2d');
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.currentPiece = this.randomPiece();
    this.nextPiece = this.randomPiece();
    this.heldPiece = null;
    this.canHold = true;
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.lines = 0;

    if (!this.ctx || !this.nextPieceCtx || !this.holdPieceCtx) {
      console.error("Failed to get 2D context from one or more canvas elements.");
    }

    this.drawNextPiece();
    this.drawHoldPiece();
  }

  // Generate a random piece
  randomPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIndex];
    const color = COLORS[shapeIndex];
    return { shape, color, x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2), y: 0 };
  }

  // Draw a piece on the canvas
  drawPiece(piece, ctx, xOffset = piece.x, yOffset = piece.y, scale = 1, isGhost = false) {
    piece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value !== 0) {
                // Semi-transparent color for ghost pieces
                ctx.fillStyle = isGhost ? "rgba(200, 200, 200, 0.5)" : piece.color;
                
                // Draw the block
                ctx.fillRect(
                    (dx + xOffset) * BLOCK_SIZE * scale,
                    (dy + yOffset) * BLOCK_SIZE * scale,
                    BLOCK_SIZE * scale,
                    BLOCK_SIZE * scale
                );

                // Draw the border only if it's not a ghost piece
                if (!isGhost) {
                    ctx.strokeRect(
                        (dx + xOffset) * BLOCK_SIZE * scale,
                        (dy + yOffset) * BLOCK_SIZE * scale,
                        BLOCK_SIZE * scale,
                        BLOCK_SIZE * scale
                    );
                }
            }
        });
    });
  }

  // Draw the game board
  drawBoard() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the ghost piece
    const ghost = this.calculateGhostPiece();
    this.drawPiece(ghost, this.ctx, ghost.x, ghost.y, 1, true); // Pass `true` for ghost mode

    // Draw the current board
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (this.board[y][x]) {
                this.ctx.fillStyle = COLORS[this.board[y][x] - 1];
                this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    // Draw the active piece
    this.drawPiece(this.currentPiece, this.ctx);
  }

  // Check for collisions
  collide(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && this.board[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Merge the piece into the board
  merge(piece) {
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          this.board[piece.y + y][piece.x + x] = COLORS.indexOf(piece.color) + 1;
        }
      });
    });
  }

  // Clear completed lines
  clearLines() {
    let lines = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.board[y].every(value => value !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(COLS).fill(0));
        lines++;
      }
    }
    if (lines > 0) {
      this.lines += lines;
      this.score += lines * 100;
      this.level = Math.floor(this.lines / 10) + 1;
    }
  }

  // Drop the piece
  drop() {
    this.currentPiece.y++;
    if (this.collide(this.currentPiece)) {
      this.currentPiece.y--;
      this.merge(this.currentPiece);
      this.clearLines();
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.randomPiece();
      this.drawNextPiece();
      if (this.collide(this.currentPiece)) {
        this.gameOver = true;
      }
    }
  }

  // Draw the next piece
  drawNextPiece() {
    this.nextPieceCtx.clearRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);

    // Ensure the next piece fits within the small canvas
    const scale = Math.min(
        this.nextPieceCanvas.width / (this.nextPiece.shape[0].length * BLOCK_SIZE),
        this.nextPieceCanvas.height / (this.nextPiece.shape.length * BLOCK_SIZE)
    );

    const xOffset = (this.nextPieceCanvas.width - this.nextPiece.shape[0].length * BLOCK_SIZE * scale) / 2;
    const yOffset = (this.nextPieceCanvas.height - this.nextPiece.shape.length * BLOCK_SIZE * scale) / 2;

    this.drawPiece(this.nextPiece, this.nextPieceCtx, xOffset / BLOCK_SIZE, yOffset / BLOCK_SIZE, scale);
  }

  // Draw the hold piece
  drawHoldPiece() {
    this.holdPieceCtx.clearRect(0, 0, this.holdPieceCanvas.width, this.holdPieceCanvas.height);

    if (this.heldPiece) {
      const scale = Math.min(
        this.holdPieceCanvas.width / (this.heldPiece.shape[0].length * BLOCK_SIZE),
        this.holdPieceCanvas.height / (this.heldPiece.shape.length * BLOCK_SIZE)
      );

      const xOffset = (this.holdPieceCanvas.width - this.heldPiece.shape[0].length * BLOCK_SIZE * scale) / 2;
      const yOffset = (this.holdPieceCanvas.height - this.heldPiece.shape.length * BLOCK_SIZE * scale) / 2;

      this.drawPiece(this.heldPiece, this.holdPieceCtx, xOffset / BLOCK_SIZE, yOffset / BLOCK_SIZE, scale);
    }
  }

  // Move the piece left or right
  move(piece, dir) {
    piece.x += dir;
    if (this.collide(piece)) {
      piece.x -= dir;
    }
  }

  // Rotate the piece
  rotate(piece, dir) {
    const originalShape = piece.shape;
    piece.shape = piece.shape[0].map((_, i) =>
      dir > 0 ? piece.shape.map(row => row[i]).reverse() : piece.shape.map(row => row[row.length - 1 - i])
    );

    const kicks = [
      [0, 0], [-1, 0], [1, 0], [0, 1], [0, -1]
    ];

    let valid = false;
    for (const [dx, dy] of kicks) {
      piece.x += dx;
      piece.y += dy;
      if (!this.collide(piece)) {
        valid = true;
        break;
      }
      piece.x -= dx;
      piece.y -= dy;
    }

    if (!valid) {
      piece.shape = originalShape;
    }
  }

  // Hold the current piece
  hold() {
    if (!this.canHold) return;
    if (this.heldPiece) {
      [this.currentPiece, this.heldPiece] = [this.heldPiece, this.currentPiece];
      this.currentPiece.x = Math.floor(COLS / 2) - Math.ceil(this.currentPiece.shape[0].length / 2);
      this.currentPiece.y = 0;
    } else {
      this.heldPiece = this.currentPiece;
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.randomPiece();
    }
    this.canHold = false;
    this.drawNextPiece();
    this.drawHoldPiece();
  }

  // Reset the game
  reset() {
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.currentPiece = this.randomPiece();
    this.nextPiece = this.randomPiece();
    this.heldPiece = null;
    this.canHold = true;
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.drawNextPiece();
    this.drawHoldPiece();
  }

  // Calculate the ghost piece position
  calculateGhostPiece() {
    const ghost = { ...this.currentPiece, y: this.currentPiece.y }; // Clone the current piece
  
    while (!this.collide(ghost)) {
        ghost.y++; // Keep moving the ghost down
    }
    ghost.y--; // Move back to the last valid position
  
    return ghost;
  }

  // Stop the game completely
  stopGame() {
    this.gameRunning = false;
    this.gamePaused = true;
    this.gameOver = true;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.displayGameOver();
  }

  // Display game over message
  displayGameOver() {
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
    gameOverElement.innerText = 'Game Over';
    document.body.appendChild(gameOverElement);

    setTimeout(() => {
      document.body.removeChild(gameOverElement);
    }, 3000);
  }
}

