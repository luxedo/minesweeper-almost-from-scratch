/*
minesweeper-almost-from-scratch
This is an attempt of making the game pong using modern programming languages

Copyright (C) 2021  Luiz Eduardo Amaral - <luizamaral306@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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

  constructor(width, height, mines) {
    this.holdRight = false;
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.mines = mines;
    this.element = document.createElement("div");
    this.timeDelta = 0;

    // Setup events
    const timeEvent = new CustomEvent("updateTime", {
      detail: { time: 0 },
    });
    this.element.dispatchEvent(timeEvent);
    this.previousDelta = 0;
    this.clockInterval = setInterval(() => {
      if (!this.gameOver) {
        const delta = (Date.now() - this.startTime) / 1000;
        this.previousDelta = this.timeDelta;
        this.timeDelta = delta > 0 ? delta : 0;
        if (Math.floor(this.previousDelta) != Math.floor(this.timeDelta)) {
          const timeEvent = new CustomEvent("updateTime", {
            detail: { time: this.timeDelta },
          });
          this.element.dispatchEvent(timeEvent);
        }
      }
    }, 100);
    const minesEvent = new CustomEvent("updateMines", {
      detail: { mines: this.mines },
    });
    this.element.dispatchEvent(minesEvent);

    // Reset board
    this.reset();
  }
  reset() {
    this.started = false;
    this.victory = false;
    this.gameOver = false;
    this.startTime = NaN;
    this.finalTime = NaN;
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
    this.showBoard();
    this.checkVictory();
  }
  setSize(width, height, mines) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.mines = mines;
    this.reset();
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
    if (event.button == this.RIGHT_CLICK) this.holdRight = true;
    if (this.gameOver) return;
    const cellData = this.data[idx];
    let click = event.button;
    if (event.button == this.LEFT_CLICK && this.holdRight)
      click = this.MIDDLE_CLICK;
    switch (click) {
      case this.LEFT_CLICK:
        if (cellData.state == this.HIDDEN) {
          event.target.classList.remove("cell-hidden");
          event.target.classList.add("cell-show");
        }
        break;
      case this.MIDDLE_CLICK:
        if (cellData.state == this.SHOW) {
          this.getNeighborsIndexes(idx).forEach((_idx) => {
            if (this.data[_idx].state == this.HIDDEN) {
              this.view[_idx].classList.remove("cell-hidden");
              this.view[_idx].classList.add("cell-show");
            }
          });
        }
        break;
      case this.RIGHT_CLICK:
        if (cellData.state != this.SHOW) {
          cellData.state =
            cellData.state == this.HIDDEN ? this.FLAG : this.HIDDEN;
        }
        this.showBoard();
        break;
    }
  }
  cellMouseUp(event, idx) {
    if (event.button == this.RIGHT_CLICK) this.holdRight = false;
    if (this.gameOver) return;
    const cellData = this.data[idx];
    let click = event.button;
    if (event.button == this.LEFT_CLICK && this.holdRight && !event.middle)
      click = this.MIDDLE_CLICK;
    switch (click) {
      case this.LEFT_CLICK:
        if (!this.started) {
          this.startTime = Date.now();
          this.started = true;
          do {
            this.data.forEach((cell) => (cell.value = this.EMPTY));
            this.randomSampleIndexes(this.size, this.mines).forEach(
              (idx) => (this.data[idx].value = this.MINE)
            );
          } while (cellData.value == this.MINE);
          this.countNeighbors();
        }
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
    }
    if (!this.gameOver) {
      this.checkVictory();
    }
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
          this.cellMouseUp({ button: this.LEFT_CLICK, middle: true }, _idx);
      });
    }
  }
  checkVictory() {
    const hiddenCells = this.data.reduce(
      (acc, cellData) => acc + (cellData.state != this.SHOW),
      0
    );
    this.remaining =
      this.mines -
      this.data.reduce(
        (acc, cellData) => acc + (cellData.state == this.FLAG),
        0
      );
    if (hiddenCells == this.mines) {
      this.gameOver = true;
      this.victory = true;
      this.remaining = 0;
      this.finalTime = (Date.now() - this.startTime) / 1000;
      this.data.forEach((cellData) => {
        if (cellData.value == this.MINE) cellData.state = this.FLAG;
      });
    }

    // Warn others that
    const minesEvent = new CustomEvent("updateMines", {
      detail: { mines: this.remaining },
    });
    this.element.dispatchEvent(minesEvent);
  }
}
