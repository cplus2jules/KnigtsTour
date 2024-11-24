// warnsdorffsRule.js
export function isValidMove(x, y, boardSize) {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
  }
  
  export function countOnwardMoves(x, y, knightMoves, visitedCell, boardSize) {
    let count = 0;
    knightMoves.forEach(move => {
      const newX = x + move.x;
      const newY = y + move.y;
      if (isValidMove(newX, newY, boardSize) && !visitedCell.some(c => c.x === newX && c.y === newY)) {
        count++;
      }
    });
    return count;
  }
  
  export function findNextMove(knightPosition, knightMoves, visitedCell, boardSize) {
    // Find all possible moves
    const possibleMoves = knightMoves
      .map(move => {
        const newX = knightPosition.x + move.x;
        const newY = knightPosition.y + move.y;
        if (isValidMove(newX, newY, boardSize) && !visitedCell.some(c => c.x === newX && c.y === newY)) {
          return { x: newX, y: newY, onwardMoves: countOnwardMoves(newX, newY, knightMoves, visitedCell, boardSize) };
        }
        return null;
      })
      .filter(Boolean);
  
    // Select the move with the least onward moves
    possibleMoves.sort((a, b) => a.onwardMoves - b.onwardMoves);
    return possibleMoves[0] || null; // Return the best move or null if no moves are available
  }
  