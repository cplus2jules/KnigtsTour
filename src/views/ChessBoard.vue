<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const boardSize = parseInt(route.query.size) || 8; // Default board size to 8x8
const moveCount = ref(0); // Tracks the number of moves
const board = ref([]); // Reactive board data
const knightPosition = ref(null); // Initially null, set dynamically
const visitedCell = ref([]); // To track visited cells and move counts
const gameOver = ref(false); // Track if the game is over
// Knight's possible moves
const knightMoves = [
  { x: 2, y: 1 }, { x: 2, y: -1 },
  { x: -2, y: 1 }, { x: -2, y: -1 },
  { x: 1, y: 2 }, { x: 1, y: -2 },
  { x: -1, y: 2 }, { x: -1, y: -2 }
];

// Generate the chessboard
function createChessboard() {
  board.value = Array.from({ length: boardSize }, (_, y) =>
    Array.from({ length: boardSize }, (_, x) => ({
      x,
      y,
      content: null,
      isVisited: false,
      isValidMove: false,
    }))
  );
}

// Check if a move is valid
function isValidMove(x, y) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

// Highlight possible moves
function highlightPossibleMoves() {
  board.value.forEach(row => {
    row.forEach(cell => (cell.isValidMove = false));
  });

  knightMoves.forEach(move => {
    const newX = knightPosition.value.x + move.x;
    const newY = knightPosition.value.y + move.y;

    if (isValidMove(newX, newY) && !visitedCell.value.some(c => c.x === newX && c.y === newY)) {
      board.value[newY][newX].isValidMove = true;
    }
  });
}

// Handle cell clicks
// Handle cell clicks
function handleCellClick(cell) {
  if (gameOver.value) {
    alert("The game is over!");
    return;
  }

  // Set starting position on first click
  if (!knightPosition.value) {
    knightPosition.value = { x: cell.x, y: cell.y };
    moveCount.value = 1;
    visitedCell.value.push({ ...knightPosition.value, move: moveCount.value });
    cell.content = '♞';
    cell.isVisited = true;
    highlightPossibleMoves();
    return;
  }

  // Handle knight moves after starting position is set
  if (cell.isValidMove) {
    // Update knight's position
    knightPosition.value = { x: cell.x, y: cell.y };
    moveCount.value++;

    // Track the move
    if (!visitedCell.value.some(c => c.x === knightPosition.value.x && c.y === knightPosition.value.y)) {
      visitedCell.value.push({ ...knightPosition.value, move: moveCount.value });
    }

    // Update the board to reflect visited cells
    board.value.forEach(row =>
      row.forEach(c => {
        const visited = visitedCell.value.find(v => v.x === c.x && v.y === c.y);
        if (visited) {
          c.content = visited.move;
          c.isVisited = true;
        }
      })
    );

    // Place knight at the new position
    cell.content = '♞';

    // Highlight possible moves
    highlightPossibleMoves();

    // Check if there are no valid moves left
    setTimeout(() => {
      if (board.value.every(row => row.every(cell => !cell.isValidMove))) {
        gameOver.value = true;
        alert("No valid moves left! The game is over.");
      }
    }, 0); // Allow DOM updates before showing the alert
  } else {
    alert("Invalid move. Try again.");
  }
}


// Reset the game
function resetButton() {
  gameOver.value = false;
  moveCount.value = 0;
  knightPosition.value = null;
  visitedCell.value = [];
  createChessboard();
}

function undoButton() {
  if (visitedCell.value.length <= 1) {
    alert("No moves to undo!");
    return;
  }

  // Remove the last move from the history
  visitedCell.value.pop();

  // Update knight's position to the previous move
  const lastMove = visitedCell.value[visitedCell.value.length - 1];
  knightPosition.value = { x: lastMove.x, y: lastMove.y };

  // Decrease the move count
  moveCount.value--;

  // Reset the board
  board.value.forEach(row =>
    row.forEach(cell => {
      cell.content = null;
      cell.isVisited = false;
    })
  );

  // Mark all visited cells again
  visitedCell.value.forEach(move => {
    board.value[move.y][move.x].content = move.move;
    board.value[move.y][move.x].isVisited = true;
  });

  // Place the knight at the updated position
  board.value[lastMove.y][lastMove.x].content = '♞';

  // Highlight possible moves
  highlightPossibleMoves();

  gameOver.value = false; // Allow the game to continue if it was previously marked as over
}

// Initialize the chessboard
onMounted(() => {

  createChessboard();

});
</script>


<template>
    <div class="flex w-full h-full text-black bg-gradient-to-br from-black to-gray-800">
      <div class="h-full w-4/6 flex items-center justify-center p-4">
        <div
          id="chessboard"
          class="grid"
          :style="{
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
            gridTemplateRows: `repeat(${boardSize}, 1fr)`,
            width: `min(90vw, 90vh)`,
            height: `min(90vw, 90vh)`,
          }"
        >
          <div
            v-for="cell in board.flat()"
            :key="`${cell.x}-${cell.y}`"
            :class="[
              'border',
              (cell.x + cell.y) % 2 === 0 ? 'bg-gray-200 text-black' : 'bg-gray-700 text-white',
              'flex items-center justify-center text-s font-bold cursor-pointer',
              cell.isValidMove ? 'bg-green-500' : '',
            ]"
            class="aspect-square"
            @click="handleCellClick(cell)"
          >
            <span v-if="cell.content === '♞'">
              <img
                src="../assets/img/knight.svg"
                alt="Knight"

                :style="{ 
                    width: `calc(200px / ${boardSize})`, 
                    height: `calc(200px / ${boardSize})` 
                }"
                />
            </span>
            <span v-else :style="{ fontSize: `calc(1.5rem / ${boardSize / 8})` }">{{ cell.isVisited ? cell.content : '' }}</span>
          </div>
        </div>
      </div>
      <div class="bg-gray-300 h-full w-2/6 p-4 flex flex-col justify-between">
      <h1 class="text-xl font-bold mb-4">Move Tracker</h1>
      <p>Current Move: {{ moveCount }}</p>
      <p v-if="moveCount < 1" class="text-green-600">Click on any cell to set the starting position.</p>
      <div class="text-black flex flex-col">
        <div class="text-black flex ">
            <button class="w-full max-w-xs px-6 py-4 mb-3 font-bold uppercase transition-transform duration-200 bg-black border-2 border-white rounded-md hover:scale-105 hover:bg-gray-800 active:scale-100 text-white" @click="undoButton">Undo</button>
            <button class="w-full max-w-xs px-6 py-4 mb-3 font-bold uppercase transition-transform duration-200 bg-black border-2 border-white rounded-md hover:scale-105 hover:bg-gray-800 active:scale-100 text-white"  @click="resetButton">Reset</button>
        </div>
        <div>

            <button class="w-full max-w-xs px-6 py-4 mb-3 font-bold uppercase transition-transform duration-200 bg-black border-2 border-white rounded-md hover:scale-105 hover:bg-gray-800 active:scale-100 text-white">Complete this tour</button>
        </div>
    </div>
    </div>
    </div>
  </template>
  

<style>
#chessboard {
  max-width: 100%; /* Prevent overflow */
  max-height: 100%; /* Prevent overflow */
}

.aspect-square {
  position: relative;
}

.border {
  border: 1px solid #ccc;
}

.bg-green-500 {
  background-color: #48bb78; /* Green color for valid knight moves */
}

.bg-blue-500 {
  background-color: #63b3ed; /* Blue color for visited knight moves */
}
</style>
