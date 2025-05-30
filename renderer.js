class Renderer {
  constructor(tetris) {
    this.tetris = tetris;
    this.ctx = tetris.ctx;
    this.canvas = tetris.canvas;
    this.nextPieceCtx = tetris.nextPieceCtx;
  }

  draw() {
    this.tetris.drawBoard();
    this.tetris.drawPiece(this.tetris.currentPiece, this.ctx);
    this.drawNextPiece();
    this.drawHoldPiece();
    document.getElementById('score').innerText = `Score: ${this.tetris.score}`;
    document.getElementById('level').innerText = `Level: ${this.tetris.level}`;
    document.getElementById('lines').innerText = `Lines: ${this.tetris.lines}`;
  }

  drawNextPiece() {
    this.nextPieceCtx.clearRect(0, 0, this.tetris.nextPieceCanvas.width, this.tetris.nextPieceCanvas.height);
    
    const piece = this.tetris.nextPiece;
    const scale = Math.min(
      this.nextPieceCtx.canvas.width / (piece.shape[0].length * BLOCK_SIZE),
      this.nextPieceCtx.canvas.height / (piece.shape.length * BLOCK_SIZE)
    );

    const xOffset = (this.nextPieceCtx.canvas.width - piece.shape[0].length * BLOCK_SIZE * scale) / 2;
    const yOffset = (this.nextPieceCtx.canvas.height - piece.shape.length * BLOCK_SIZE * scale) / 2;

    this.tetris.drawPiece(piece, this.nextPieceCtx, xOffset / BLOCK_SIZE, yOffset / BLOCK_SIZE, scale);
  }

  drawHoldPiece() {
    this.tetris.drawHoldPiece();
  }
}
