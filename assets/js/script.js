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
  MIDDLE_CLICK = 1;
  RIGHT_CLICK = 2;

  constructor(width, height, mines, element) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.mines = mines;
    this.element = element;
    this.reset();
  }
  reset() {
    this.gameOver = false;
    this.data = Array(this.size)
      .fill(0)
      .map(
        () =>
          new Object({
            value: this.EMPTY,
            state: this.HIDDEN,
            neighbors: 0,
            gameOver: false,
          })
      );
    this.randomSampleIndexes(this.size, this.mines).forEach(
      (idx) => (this.data[idx].value = this.MINE)
    );
    this.countNeighbors();
    this.showBoard();
  }

  getIndex(row, col) {
    return row < 0 || col < 0 || row >= this.height || col >= this.width
      ? -1
      : row * this.width + col;
  }
  getCartesian(idx) {
    return { row: Math.floor(idx / this.width), col: idx % this.width };
  }
  getNeighborsIndexes(idx) {
    const { row, col } = this.getCartesian(idx);
    const neighbors = [
      // Top Row
      this.getIndex(row - 1, col - 1),
      this.getIndex(row - 1, col),
      this.getIndex(row - 1, col + 1),

      // Middle row
      this.getIndex(row, col - 1),
      this.getIndex(row, col + 1),

      // Bottom row
      this.getIndex(row + 1, col - 1),
      this.getIndex(row + 1, col),
      this.getIndex(row + 1, col + 1),
    ];
    return neighbors.filter((idx) => idx != -1);
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
  countNeighbors() {
    this.data.forEach((cell, idx) => {
      this.data[idx].neighbors = this.getNeighborsIndexes(idx).reduce(
        (acc, idx) => acc + (this.data[idx].value == this.MINE),
        0
      );
    });
  }

  showBoard() {
    this.element.innerHTML = "";
    this.view = [];
    for (let row = 0; row < this.height; row++) {
      // Row element
      const cellRow = document.createElement("div");
      cellRow.classList.add("cell-row");

      for (let col = 0; col < this.width; col++) {
        const idx = this.getIndex(row, col);
        const cellData = this.data[idx];

        // Cell elements
        const cell = document.createElement("div");
        cell.classList.add("cell");
        const cellContent = document.createElement("p");
        cellContent.classList.add("cell-content");
        cell.appendChild(cellContent);
        cellRow.appendChild(cell);
        cell.onmousedown = (event) => this.cellMouseDown(event, idx);
        cell.onmouseup = (event) => this.cellMouseUp(event, idx);
        this.view.push(cell);

        // Cell value
        switch (cellData.state) {
          case this.SHOW:
            cell.classList.add(`cell-show`);
            if (cellData.value == this.EMPTY) {
              cellContent.classList.add(`cell-content-n${cellData.neighbors}`);
            } else {
              cellContent.classList.add(`cell-content-mine`);
              if (cellData.gameOver) {
                cell.classList.add(`cell-game-over`);
              }
            }
            break;

          case this.FLAG:
          case this.HIDDEN:
            cell.classList.add("cell-hidden");
            if (cellData.state == this.FLAG)
              cellContent.classList.add(`cell-content-flag`);
            break;
        }
      }
      this.element.appendChild(cellRow);
    }
  }
  cellMouseDown(event, idx) {
    if (this.gameOver) return;

    const cellData = this.data[idx];
    switch (event.button) {
      case this.LEFT_CLICK:
        if (cellData.state == this.HIDDEN) {
          event.target.classList.remove("cell-hidden");
          event.target.classList.add("cell-show");
        }
        break;
      case this.MIDDLE_CLICK:
        if (cellData.state == this.SHOW) {
          this.getNeighborsIndexes(idx).forEach((_idx) =>
            this.cellMouseDown(
              { button: this.LEFT_CLICK, target: this.view[_idx] },
              _idx
            )
          );
        }
        break;
    }
  }
  cellMouseUp(event, idx) {
    if (this.gameOver) return;
    const cellData = this.data[idx];

    switch (event.button) {
      case this.LEFT_CLICK:
        if (cellData.state == this.HIDDEN) {
          if (cellData.value == this.EMPTY && cellData.neighbors == 0)
            this.floodFill(idx);
          else cellData.state = this.SHOW;

          if (cellData.value == this.MINE) {
            cellData.gameOver = true;
            this.gameOver = true;
            this.showAllMines();
          }
        }
        break;

      case this.MIDDLE_CLICK:
        if (cellData.state == this.SHOW) {
          this.showNeighbors(idx);
        }
        break;

      case this.RIGHT_CLICK:
        if (cellData.state != this.SHOW) {
          cellData.state =
            cellData.state == this.HIDDEN ? this.FLAG : this.HIDDEN;
        }
        break;
    }
    this.checkVictory();
    this.showBoard();
  }
  showAllMines() {
    this.data
      .filter((cellData) => cellData.value == this.MINE)
      .forEach((cellData) => (cellData.state = this.SHOW));
  }
  floodFill(idx) {
    const cellData = this.data[idx];
    if (idx >= 0 && cellData.state == this.HIDDEN) {
      cellData.state = this.SHOW;
      if (cellData.neighbors == 0) {
        this.getNeighborsIndexes(idx).forEach((_idx) => this.floodFill(_idx));
      }
    }
  }
  showNeighbors(idx) {
    const cellData = this.data[idx];
    const neighbors = this.getNeighborsIndexes(idx);
    const flaggedNeighbors = neighbors.reduce(
      (acc, _idx) => acc + (this.data[_idx].state == this.FLAG),
      0
    );
    if (flaggedNeighbors >= cellData.neighbors) {
      neighbors.forEach((_idx) => {
        if (this.data[_idx].state == this.HIDDEN)
          this.cellMouseUp({ button: this.LEFT_CLICK }, _idx);
      });
    }
  }
  checkVictory() {
    const hiddenCells = this.data.reduce(
      (acc, cellData) => acc + (cellData.state != this.SHOW),
      0
    );
    if (hiddenCells == this.mines) {
      this.gameOver = true;
      this.victory = true;
      this.data.forEach((cellData) => {
        if (cellData.value == this.MINE) cellData.state = this.FLAG;
      });
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
  attachEmojiButton(board, emoji);
});

function attachEmojiButton(board, emoji) {
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

  document.onmousedown = (event) => {
    if (!board.gameOver) {
      emoji.firstElementChild.classList.remove("emoji-dead");
      emoji.firstElementChild.classList.remove("emoji-glasses");
      emoji.firstElementChild.classList.remove("emoji-happy");
      emoji.firstElementChild.classList.add("emoji-worried");
    }
  };
  document.onmouseup = (event) => {
    emoji.firstElementChild.classList.remove("emoji-worried");
    if (board.gameOver) {
      emoji.firstElementChild.classList.add(
        board.victory ? "emoji-glasses" : "emoji-dead"
      );
    } else {
      emoji.firstElementChild.classList.remove("emoji-dead");
      emoji.firstElementChild.classList.remove("emoji-glasses");
      emoji.firstElementChild.classList.add("emoji-happy");
    }
  };
}
