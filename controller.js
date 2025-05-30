class Controller {
  constructor(tetris) {
    this.tetris = tetris;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    if (this.tetris.gameOver || !this.tetris.gameRunning || this.tetris.gamePaused) return;

    switch (event.key) {
      case 'ArrowLeft':
        this.tetris.move(this.tetris.currentPiece, -1);
        break;
      case 'ArrowRight':
        this.tetris.move(this.tetris.currentPiece, 1);
        break;
      case 'ArrowDown':
        this.tetris.drop();
        break;
      case 'ArrowUp':
        this.tetris.rotate(this.tetris.currentPiece, 1);
        break;
      case ' ':
        event.preventDefault(); // Prevent default action for space bar
        while (!this.tetris.collide(this.tetris.currentPiece)) {
          this.tetris.currentPiece.y++;
        }
        this.tetris.currentPiece.y--;
        this.tetris.drop();
        if (this.tetris.gameOver) {
          this.tetris.stopGame();
        }
        break;
      case 'Shift':
      case 'C':
        this.tetris.hold();
        break;
      case 'Escape':
        this.tetris.stopGame();
        break;
    }
    this.tetris.drawBoard();
    this.tetris.drawPiece(this.tetris.currentPiece, this.tetris.ctx);
  }
}
