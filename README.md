# MINESWEEPER ALMOST FROM SCRATCH

This is an attempt of making the game [Minesweeper](https://en.wikipedia.org/wiki/Minesweeper)
using modern programming languages. The idea is to time the development and track the progress of each stage in this document. If possible I want to finish this project in under 24 h.

Minesweeper is a classic for Windows machines and is still rolling.

For previous projects, I worked a lot with [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), this time I'm
going to use HTML elements. I'd also love to write the sprites with CSS.

I'll try to create the looks of the Windows 3.x version of Minesweeper in a

![Minesweeper](report-assets/windows-minesweeper.png)

And the background should look like the old times Windows

![Windows 3.x](report-assets/windows3x.png)

#### Check it out [here](https://minesweeper-almost-from-scratch.firebaseapp.com/)

## Goals

- ~~Host somewhere~~
- Create sprites
  - ~~Window~~
  - Cell
  - Numbered cells
  - Flag cell
  - Question mark cell
  - Mine cells
  - Explosion cell
  - Score/Time digits
  - Emoji expressions (~~Happy~~, Worried, Dead)
  - ~~Ask friends for desktop pixelart~~
- ~~Create the board data structure~~
- ~~Create random mine placing algorithm~~
- Place board data in the screen
- Create click mechanics
- Create game over mechanics
- Create top bar Menus
  - New Game
  - Board Settings
  - About/Credits
- Opengraph and icons
- Fix playtesters requests
- Finished!

## Progress reports

### 00:00 - START!

Well, now it's 26th of February 2019 15:10. There's no power at home,
that's why I'm starting now with around 2h of battery.

### 00:30 - START AGAIN!

Well, now it's 10th of April 2021 11:30. This is taking quite some
time XP

### 00:40 - Hosting Guess Where?!

[GH-PAGES!](https://pages.github.com/)

### 02:00 - First Sprite!

Just made the first version of the window for the game and the happy
emoji sprite! The window is mainly `div`s with borders and the sprite
I've done in [GIMP](https://www.gimp.org/) quickly.
Also, I asked some friends to draw half a dozen of desktop icons to
place in the background. Researching a little bit more, there's a CSS
standard that allows drawing shapes in the screen, so maybe I'll try
to make the game sprites with that spec.

![First sprite](report-assets/first-sprite.png)

### 03:30 - Board data structure and random sampling algorithm

The structure of the board in memory should store the values and states
of each cell. We need to know if the cell contains a mine or not, if it
has been clicked or not, and how many neighbors contains mines.
To do so, first we uniformly random sample **n** mines in the board and
then calculate the number of mine containing neighbors.

![Data structure](report-assets/data-structure.png)

## License

> This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
>
> This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
>
> You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
