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
    QUESTION: "question",
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
  placeBoard(element) {
    element.innerHTM = "";
    for (let row = 0; row < this.height; row++) {
      const cellRow = document.createElement("div");
      cellRow.classList.add("cell-row");
      for (let col = 0; col < this.width; col++) {
        const cell = document.createElement("div");
        const cellContent = document.createElement("p");
        const cellData = this.getCartesian(row, col);
        cell.classList.add("cell");
        // cell.classList.add(`cell-${cellData.state}`);
        if (col == 0 && row == 0) 
          cell.classList.add(`cell-hidden`);
        else 
          cell.classList.add(`cell-show`);
        cellContent.classList.add("cell-content");

        if (cellData.value == this.cv.EMPTY) {
          if (col != 0)
            cellContent.classList.add(`cell-content-n${cellData.neightbors}`);
        } else {
          if (Math.random() > 0.5) 
            cellContent.classList.add("cell-content-flag");
          else
            cellContent.classList.add("cell-content-mine");
        }

        cell.appendChild(cellContent);
        cellRow.appendChild(cell);
      }
      element.appendChild(cellRow);
    }
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  const boardDiv = document.getElementsByClassName("game-board-container")[0];
  const board = new Board(bWidth, bHeight);
  board.randomizeMines(nMines);
  board.placeBoard(boardDiv);
  console.log(board);
});
