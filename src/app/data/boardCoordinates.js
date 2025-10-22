// app/data/boardCoordinates.js

const TILE_WIDTH = 10; // Width of a square in 3D space
const TILE_DEPTH = 10; // Depth of a square in 3D space
const BOARD_WIDTH_TILES = 15;
const BOARD_HEIGHT_TILES = 7;

// Calculate the starting corner of the board in 3D space
const startX = -((BOARD_WIDTH_TILES - 1) * TILE_WIDTH) / 2;
const startZ = -((BOARD_HEIGHT_TILES - 1) * TILE_DEPTH) / 2;

export const boardCoordinates = [];

for (let i = 0; i <= 100; i++) {
  const row = Math.floor(i / BOARD_WIDTH_TILES);
  let col;

  if (row % 2 === 0) { // Even rows (0, 2, 4...) go left to right
    col = i % BOARD_WIDTH_TILES;
  } else { // Odd rows (1, 3, 5...) go right to left
    col = BOARD_WIDTH_TILES - 1 - (i % BOARD_WIDTH_TILES);
  }

  const x = startX + col * TILE_WIDTH;
  const y = 0.6; // A small offset to prevent visual glitches with the board
  const z = startZ + row * TILE_DEPTH;
  
  boardCoordinates.push([x, y, z]);
}