<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { findNextMove, isValidMove } from '../Algorithm/warnsdorffsRule'; // Import custom logic for the knight's move
import IsClosedTour from '@/components/Dialogues/IsClosedTour.vue';

const route = useRoute();
const boardSize = parseInt(route.query.size) || 8; // Default size is 8x8 if not provided
const moveCount = ref(0);
const board = ref([]);
const isClosedTour = ref(false);
const knightPosition = ref(null);
const visitedCell = ref([]);
const gameOver = ref(false);
const knightMoves = [
  { x: 2, y: 1 }, { x: 2, y: -1 },
  { x: -2, y: 1 }, { x: -2, y: -1 },
  { x: 1, y: 2 }, { x: 1, y: -2 },
  { x: -1, y: 2 }, { x: -1, y: -2 },
];

// Create the chessboard grid
function createChessboard() {
  board.value = Array.from({ length: boardSize }, (_, y) =>
    Array.from({ length: boardSize }, (_, x) => ({
      x, y, content: null, isVisited: false, isValidMove: false,
    }))
  );
}

// Highlight valid knight moves on the board
function highlightPossibleMoves() {
  board.value.forEach(row => row.forEach(cell => (cell.isValidMove = false)));

  knightMoves.forEach(move => {
    const newX = knightPosition.value?.x + move.x;
    const newY = knightPosition.value?.y + move.y;

    if (isValidMove(newX, newY, boardSize) && !visitedCell.value.some(c => c.x === newX && c.y === newY)) {
      board.value[newY][newX].isValidMove = true;
    }
  });
}

// Handle click on a cell
function handleCellClick(cell) {
  if (gameOver.value) {
    alert("The game is over!");
    return;
  }

  if (!knightPosition.value) {
    knightPosition.value = { x: cell.x, y: cell.y };
    moveCount.value = 1;
    visitedCell.value.push({ ...knightPosition.value, move: moveCount.value });
    cell.content = '♞';
    cell.isVisited = true;
    highlightPossibleMoves();
    return;
  }

  if (cell.isValidMove) {
    knightPosition.value = { x: cell.x, y: cell.y };
    moveCount.value++;
    
    if (!visitedCell.value.some(c => c.x === knightPosition.value.x && c.y === knightPosition.value.y)) {
      visitedCell.value.push({ ...knightPosition.value, move: moveCount.value });
    }

    board.value.forEach(row => row.forEach(c => {
      const visited = visitedCell.value.find(v => v.x === c.x && v.y === c.y);
      if (visited) {
        c.content = visited.move;
        c.isVisited = true;
      }
    }));

    cell.content = '♞';
    highlightPossibleMoves();

    setTimeout(() => {
      if (board.value.every(row => row.every(cell => !cell.isValidMove))) {
        gameOver.value = true;
      }
    }, 0);
  } else {
    alert("Invalid move. Try again.");
  }
}

// Reset the board to the initial state
function resetButton() {
  moveCount.value = 0;
  knightPosition.value = null;
  visitedCell.value = [];
  gameOver.value = false;
  createChessboard();
}

// Undo the last move
function undoButton() {
  if (visitedCell.value.length <= 1) {
    alert("No moves to undo!");
    return;
  }

  visitedCell.value.pop();
  const lastMove = visitedCell.value[visitedCell.value.length - 1];
  knightPosition.value = { x: lastMove.x, y: lastMove.y };
  moveCount.value--;

  board.value.forEach(row => row.forEach(cell => {
    cell.content = null;
    cell.isVisited = false;
  }));

  visitedCell.value.forEach(move => {
    board.value[move.y][move.x].content = move.move;
    board.value[move.y][move.x].isVisited = true;
  });

  board.value[lastMove.y][lastMove.x].content = '♞';
  highlightPossibleMoves();

  gameOver.value = false; 
}

// Start the knight's tour
function completeTour() {
  if (!knightPosition.value) {
    alert("Set a starting position first.");
    return;
  }

  let tourInProgress = true;

  function moveKnight() {
    if (!tourInProgress || gameOver.value) return;

    const nextMove = findNextMove(knightPosition.value, knightMoves, visitedCell.value, boardSize);

    if (!nextMove && moveCount.value === boardSize * boardSize) {
      gameOver.value = true;
      isClosedTour.value = true;
      return;
    } else if (!nextMove) {
      gameOver.value = true;
      isClosedTour.value = false;
      return;
    }

    const nextCell = board.value[nextMove.y][nextMove.x];
    handleCellClick(nextCell);

    setTimeout(moveKnight, 200); // Adjust speed of knight's movement
  }

  moveKnight();
}

// Initialize the chessboard on mount
onMounted(() => {
  createChessboard();
});
</script>

<template>
  <div class="flex tablet:flex-row w-full h-full text-black bg-gradient-to-br from-black to-gray-800">
    <!-- Chessboard Display -->
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

    <!-- Move Tracker and Controls -->
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
          <button class="w-full max-w-xs px-6 py-4 mb-3 font-bold uppercase transition-transform duration-200 bg-black border-2 border-white rounded-md hover:scale-105 hover:bg-gray-800 active:scale-100 text-white" @click="completeTour">
            Start Tour
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog for Tour Completion -->
    <IsClosedTour v-if="isClosedTour" />
  </div>
</template>
