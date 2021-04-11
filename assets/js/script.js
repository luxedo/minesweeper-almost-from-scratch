class Board {
  // Board values
  EMPTY = "empty";
  MINE = "mine";

  // Board states
  HIDDEN = "hidden";
  SHOW = "show";
  FLAG = "flag";

  // Buttons
  LEFT_CLICK = 0;
  RIGHT_CLICK = 2;

  constructor(width, height, mines, element) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.mines = mines;
    this.element = element;
    this.reset();
  }
  getIndex(row, col) {
    return row < 0 || col < 0 || row >= this.height || col >= this.width
      ? -1
      : row * this.width + col;
  }
  getCartesian(row, col) {
    const idx = this.getIndex(row, col);
    return idx >= 0 ? this.data[idx] : {};
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
  reset() {
    this.data = Array(this.size)
      .fill(0)
      .map(
        () =>
          new Object({
            value: this.EMPTY,
            state: this.HIDDEN,
            neighbors: 0,
          })
      );
    this.randomSampleIndexes(this.size, this.mines).forEach(
      (idx) => (this.data[idx].value = this.MINE)
    );
    this.countNeighbors();
    this.placeBoard();
  }
  countNeighbors() {
    return this.data.map((cell, idx) => {
      const row = Math.floor(idx / this.width);
      const col = idx % this.width;
      let neighbors = [
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
      this.data[idx].neighbors = neighbors.reduce(
        (acc, cur) => acc + (cur.value == this.MINE),
        0
      );
    });
  }
  placeBoard() {
    this.element.innerHTML = "";
    for (let row = 0; row < this.height; row++) {
      const cellRow = document.createElement("div");
      cellRow.classList.add("cell-row");
      for (let col = 0; col < this.width; col++) {
        const cellData = this.getCartesian(row, col);
        const index = row * this.width + col;
        const cell = document.createElement("div");
        const cellContent = document.createElement("p");
        cell.classList.add("cell");
        cellContent.classList.add("cell-content");

        if (cellData.state != this.SHOW) {
          cell.classList.add("cell-hidden");
          cell.setAttribute("index", index);
          cell.onmousedown = (event) => this.cellMouseDown(event, index);
          cell.onmouseup = (event) => this.cellMouseUp(event, index);
          if (cellData.state == this.FLAG)
            cellContent.classList.add(`cell-content-flag`);
        } else {
          cell.classList.add(`cell-show`);
          if (cellData.value == this.EMPTY)
            cellContent.classList.add(`cell-content-n${cellData.neighbors}`);
          else cellContent.classList.add(`cell-content-mine`);
        }
        cell.appendChild(cellContent);
        cellRow.appendChild(cell);
      }
      this.element.appendChild(cellRow);
    }
  }
  cellMouseDown(event, index) {
    this.pressIdx = index;
    if (event.button == this.LEFT_CLICK) {
      const cellData = this.data[index];
      if (cellData.state == this.HIDDEN) {
        event.target.classList.remove("cell-hidden");
        event.target.classList.add("cell-show");
      }
    }
  }
  cellMouseUp(event, index) {
    if (this.pressIdx == index) {
      const cellData = this.data[index];
      if (event.button == this.LEFT_CLICK) {
        if (cellData.state == this.FLAG) return;
        if (cellData.value == this.EMPTY && cellData.neighbors == 0)
          this.floodFill(index);
        else cellData.state = this.SHOW;
      } else if (event.button == this.RIGHT_CLICK) {
        if (cellData.state != this.SHOW) {
          cellData.state =
            cellData.state == this.HIDDEN ? this.FLAG : this.HIDDEN;
        }
      }
    }
    this.placeBoard();
  }
  floodFill(idx) {
    const cellData = this.data[idx];
    if (idx < 0 || cellData.state != this.HIDDEN) return;

    cellData.state = this.SHOW;
    if (cellData.neighbors == 0) {
      const row = Math.floor(idx / this.width);
      const col = idx % this.width;
      const neighborsIdx = [
        this.getIndex(row - 1, col - 1),
        this.getIndex(row - 1, col),
        this.getIndex(row - 1, col + 1),
        this.getIndex(row, col - 1),
        this.getIndex(row, col + 1),
        this.getIndex(row + 1, col - 1),
        this.getIndex(row + 1, col),
        this.getIndex(row + 1, col + 1),
      ];
      neighborsIdx.forEach((_idx) => this.floodFill(_idx));
    }
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  const bWidth = 8;
  const bHeight = 8;
  const nMines = 10;
  const boardDiv = document.getElementsByClassName("game-board-container")[0];
  const board = new Board(bWidth, bHeight, nMines, boardDiv);

  const emoji = document.getElementById("emoji");
  emoji.onmousedown = (event) => {
    emoji.classList.add("pressed");
  };
  emoji.onmouseup = (event) => {
    emoji.classList.remove("pressed");
    board.reset();
  };
  emoji.onmouseleave = (event) => {
    emoji.classList.remove("pressed");
  };
});
