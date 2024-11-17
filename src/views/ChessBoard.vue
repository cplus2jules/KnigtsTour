<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const boardSize = parseInt(route.query.size) || 8; // Default board size to 8x8
const moveCount = ref(0); // Tracks the number of moves
const board = ref([]); // Reactive board data
const knightPosition = ref({ x: 0, y: 0 }); // Initial position of the knight
const visitedCell = ref([]); // To track visited cells and move counts

// Knight's possible moves (2 steps in one direction and 1 in another)
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
      content: null, // Initialize with null content
      isVisited: false, // Mark if the cell is visited
      isValidMove: false // Flag for valid knight moves
    }))
  );
}

// Check if a move is valid (within the bounds of the board)
function isValidMove(x, y) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

// Highlight possible knight moves
function highlightPossibleMoves() {
  // Reset previous highlighted moves
  board.value.forEach(row => {
    row.forEach(cell => {
      cell.isValidMove = false;  // Reset the valid move flag for each cell
    });
  });
  // Calculate the valid knight moves from the current position
  knightMoves.forEach(move => {
    const newX = knightPosition.value.x + move.x;
    const newY = knightPosition.value.y + move.y;

    if (isValidMove(newX, newY) && !visitedCell.value.some(cell => cell.x === newX && cell.y === newY)) {
      const targetCell = board.value[newY][newX];
      targetCell.isValidMove = true; // Mark the valid move cell
    }
  });
}

// Handle cell clicks and simulate knight moves
function handleCellClick(cell) {
  // Only allow the knight to move to the target cell if it's a valid move
  if (cell.isValidMove) {
    knightPosition.value = { x: cell.x, y: cell.y };
    moveCount.value++;

    // Mark the cell with the current move count and as visited
    if (!visitedCell.value.some(c => c.x === knightPosition.value.x && c.y === knightPosition.value.y)) {
      visitedCell.value.push({ ...knightPosition.value, move: moveCount.value });
    }

    highlightPossibleMoves(); // Update highlighted moves after moving

    // Update content for all visited cells with move count
    board.value.forEach(row => {
      row.forEach(c => {
        const visited = visitedCell.value.find(v => v.x === c.x && v.y === c.y);
        if (visited) {
          c.content = visited.move; // Set the move count for visited cells
          c.isVisited = true; // Mark as visited
        }
      });
    });

    // Set knight's symbol for the current cell
    const currentCell = board.value[knightPosition.value.y][knightPosition.value.x];
    currentCell.content = '♞'; // Set knight's symbol for the current cell
  } else {
    alert("Invalid move. Try again.");
  }
}

// Initialize the chessboard
onMounted(() => {
  createChessboard();
  highlightPossibleMoves(); // Highlight possible moves initially
});
</script>

<template>
  <div class="flex w-full h-full text-black bg-gradient-to-br from-black to-gray-800">
    <!-- Chessboard Section -->
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
          :style="{ fontSize: `calc(1rem * (7/ ${boardSize}))` }"
        >
          <!-- Knight's symbol (image) for the current position -->
          <span v-if="cell.content === '♞'" class="text-xl">
            <img
              src="../assets/img/knight.svg" 
              alt="Knight"
              class="w-8 h-8" 
            />
          </span>

          <!-- Show move count for visited cells -->
          <span v-else>{{ cell.isVisited ? cell.content : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Move Tracker Section -->
    <div class="bg-gray-300 h-full w-2/6 p-4">
      <h1 class="text-xl font-bold mb-4">Move Tracker</h1>
      <p>Current Move: {{ moveCount }}</p>
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
