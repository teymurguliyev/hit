function buildInitialBoard() {
  const girlsCount = Math.random() < 0.5 ? 7 : 8;
  const boysCount = 15 - girlsCount;

  const civilians = [
    ...Array(boysCount).fill("boy"),
    ...Array(girlsCount).fill("girl")
  ];

  const terrorIndex = randomInt(16);
  const newBoard = [];
  let civilianCursor = 0;

  for (let i = 0; i < 16; i++) {
    if (i === terrorIndex) {
      newBoard.push("terror");
    } else {
      newBoard.push(civilians[civilianCursor]);
      civilianCursor++;
    }
  }

  return newBoard;
}

function getTerrorIndex(board) {
  return board.indexOf("terror");
}

function moveTerror(board) {
  const currentIndex = getTerrorIndex(board);
  const possibleTargets = [];

  for (let i = 0; i < board.length; i++) {
    if (i !== currentIndex) {
      possibleTargets.push(i);
    }
  }

  const targetIndex = possibleTargets[randomInt(possibleTargets.length)];
  [board[currentIndex], board[targetIndex]] = [board[targetIndex], board[currentIndex]];
}
