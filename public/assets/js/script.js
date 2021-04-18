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
const DIFFICUTIES = {
  beginner: {
    width: 9,
    height: 9,
    mines: 10,
  },
  intermediate: {
    width: 16,
    height: 16,
    mines: 40,
  },
  advanced: {
    width: 30,
    height: 16,
    mines: 99,
  },
};
window.addEventListener("DOMContentLoaded", (event) => {
  // Instantiate board
  const boardElement = document.getElementsByClassName(
    "game-board-container"
  )[0];
  const board = new Board(
    DIFFICUTIES.beginner.width,
    DIFFICUTIES.beginner.height,
    DIFFICUTIES.beginner.mines
  );
  board.difficulty = "beginner";
  board.sentHighScore = false;
  boardElement.appendChild(board.element);

  setupEvents(board);
  setupEmojiButton(board);
  setupMenu();
  fb.loadFirebase();
});

function setupEvents(board) {
  // Board event listeners
  const timeElement = document.getElementById("score-time");
  board.element.addEventListener("updateTime", (event) => {
    window.setDigits(event.detail.time, timeElement);
  });
  const minesElement = document.getElementById("score-mines");
  board.element.addEventListener("updateMines", (event) => {
    window.setDigits(event.detail.mines, minesElement);
  });
  window.setDigits(0, timeElement);
  window.setDigits(board.mines, minesElement);

  // DOM functions
  window.newGame = () => {
    board.sentHighScore = false;
    board.reset();
  };
  window.setDifficulty = (difficulty) => {
    const { width, height, mines } = DIFFICUTIES[difficulty];
    board.difficulty = difficulty;
    board.setSize(width, height, mines);
  };
  const highScoresElement = document.getElementById("high-scores-container");
  const highScores = document.getElementById("high-scores");
  const highScoreName = document.getElementById("high-score-name");
  const scoreSpan = document.getElementById("score-span");
  const submitHighScoreBtn = document.getElementById("submit-high-score");
  const playerNameEl = document.getElementById("player-name");
  window.loadHighScores = () => {
    highScoresElement.style.removeProperty("max-width");
    highScoresElement.style.setProperty("display", "block");
    highScores.style.setProperty("display", "flex");
    highScoreName.style.setProperty("display", "none");
    fb.loadHighScores().then((scores) => {
      for (const difficulty in scores) {
        const scoreElement = document.getElementById(
          `high-scores-${difficulty}`
        );
        scoreElement.innerHTML = "";
        scores[difficulty].forEach((s) => {
          const li = document.createElement("li");
          li.textContent = `${s.score} ${s.name} `;
          scoreElement.appendChild(li);
        });
      }
    });
  };
  window.closeHighScores = () => {
    highScoresElement.style.setProperty("display", "none");
    highScores.style.setProperty("display", "none");
    highScoreName.style.setProperty("display", "block");
  };
  window.setHighScore = (score, difficulty, timestamp) => {
    highScoresElement.style.setProperty("display", "block");
    highScoresElement.style.setProperty("max-width", "20em");
    highScores.style.setProperty("display", "none");
    highScoreName.style.setProperty("display", "block");
    scoreSpan.textContent = score;
    submitHighScoreBtn.onclick = () => {
      const playerName = playerNameEl.value;
      if (playerName.length >= 3) {
        fb.setScore(playerName, score, difficulty, timestamp);
        window.loadHighScores();
      }
    };
  };
  const aboutElement = document.getElementById("about-container");
  window.showAbout = () => {
    aboutElement.style.setProperty("display", "block");
  };
  window.closeAbout = () => {
    aboutElement.style.setProperty("display", "none");
  };

  // Keyboard events
  playerNameEl.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitHighScoreBtn.click();
    }
  });
  let cheatInput = "";
  const cheatCode = "xyzzy";
  const cheatDiv = document.getElementById("cheat-div");
  document.addEventListener("keyup", (event) => {
    if (event.key == "F2") {
      window.newGame();
    } else if (event.key === cheatCode.charAt(cheatInput.length)) {
      cheatInput += event.key;
    } else {
      if (cheatInput == cheatCode && event.key == "Enter" && event.shiftKey) {
        board.cellMouseEnter = (cellEl, idx) => {
          const cellData = board.data[idx];
          if (cellData.value == board.MINE)
            cheatDiv.style.setProperty("background-color", "#000");
          else cheatDiv.style.removeProperty("background-color");
        };
      } else if (event.key === cheatCode.charAt(0))
        cheatInput = cheatCode.charAt(0);
      else cheatInput = "";
    }
  });
}

function setupEmojiButton(board) {
  const emoji = document.getElementById("emoji");

  emoji.onmousedown = (event) => {
    emoji.classList.add("pressed");
  };
  emoji.onmouseup = (event) => {
    emoji.classList.remove("pressed");
    window.newGame();
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
      if (board.victory) {
        emoji.firstElementChild.classList.add("emoji-glasses");
        if (!board.sentHighScore) {
          window.setHighScore(board.timeDelta, board.difficulty, Date.now());
          board.sentHighScore = true;
        }
      } else {
        emoji.firstElementChild.classList.add("emoji-dead");
      }
    } else {
      emoji.firstElementChild.classList.remove("emoji-dead");
      emoji.firstElementChild.classList.remove("emoji-glasses");
      emoji.firstElementChild.classList.add("emoji-happy");
    }
  };
}

function setupMenu() {
  const menus = document.querySelectorAll("nav > ul > li");
  menus.forEach((menu) => {
    const menuItems = menu.querySelector("ul");
    menu.onclick = () => {
      const visibility = menuItems.style.getPropertyValue("visibility");
      menuItems.style.setProperty(
        "visibility",
        visibility == "visible" ? "hidden" : "visible"
      );
    };
    let leftBox = false;
    menu.onmouseleave = () => {
      leftBox = true;
      window.setTimeout(() => {
        if (leftBox) menuItems.style.setProperty("visibility", "hidden");
      }, 400);
    };
    menu.onmouseenter = () => {
      leftBox = false;
    };
  });
}

function fillHighScores(scores) {
  for (const difficulty of scores) {
    const scoreElement = document.getElementById(`high-scores-${difficulty}`);
    scoreElement.innerHTML = "";
    scores.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = `${s.score} ${truncateString(s.name, 12)} `;
      scoreElement.appendChild(li);
    });
  }
}
