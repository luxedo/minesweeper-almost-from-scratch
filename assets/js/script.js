const bWidth = 8;
const bHeight = 8;
const nMines = 10;

class Board {
  cv = {
    EMPTY: "empty",
    MINE: "mine",
  };
  cs = {
    HIDDEN: "hidden",
    SHOW: "show",
    FLAG: "flag",
  };

  constructor(width, height, mines) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.data = Array(this.size)
      .fill(0)
      .map(
        () =>
          new Object({
            value: this.cv.EMPTY,
            state: this.cs.HIDDEN,
            neightbors: 0,
          })
      );
  }
  getCartesian(row, col) {
    return row < 0 || col < 0 || row >= this.height || col >= this.width
      ? {}
      : this.data[row * this.width + col];
  }
  randomSampleIndexes(maxIndex, N) {
    const ret = {};
    let n = 0;
    while (n < N) {
      const idx = Math.floor(Math.random() * maxIndex);
      if (!(idx in ret)) {
        ret[idx] = 0;
        n++;
      }
    }
    return Object.keys(ret).map(Number);
  }
  randomizeMines(mines) {
    this.randomSampleIndexes(this.size, mines).forEach(
      (idx) => (this.data[idx].value = this.cv.MINE)
    );
    this.countNeighbors();
  }
  countNeighbors() {
    return this.data.map((cell, idx) => {
      const row = Math.floor(idx / this.width);
      const col = idx % this.width;
      let neightbors = [
        // Top Row
        this.getCartesian(row - 1, col - 1),
        this.getCartesian(row - 1, col),
        this.getCartesian(row - 1, col + 1),

        // Middle row
        this.getCartesian(row, col - 1),
        this.getCartesian(row, col + 1),

        // Bottom row
        this.getCartesian(row + 1, col - 1),
        this.getCartesian(row + 1, col),
        this.getCartesian(row + 1, col + 1),
      ];
      this.data[idx].neightbors = neightbors.reduce(
        (acc, cur) => acc + (cur.value == this.cv.MINE),
        0
      );
    });
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  const board = new Board(bWidth, bHeight);
  board.randomizeMines(nMines);
  console.log(board);
});
