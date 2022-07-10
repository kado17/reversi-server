const SIZE = 8
const WIDTH = SIZE
const HEIGHT = SIZE
const WHITE = 0,
  BLACK = 1,
  PUTABLE = 8,
  EMPTY = 9

const conv = ['白', '黒']
const diskCount = { whiteCount: 0, blackCount: 0 }
const oppositeColor = (color: number) => (color === WHITE ? BLACK : color === BLACK ? WHITE : EMPTY)

const getDiskCount = (board: number[][]) => {
  let x, y
  let whiteCount = 0
  let blackCount = 0
  for (y = 0; y < HEIGHT; y++) {
    for (x = 0; x < WIDTH; x++) {
      if (board[y][x] == WHITE) {
        whiteCount += 1
      } else if (board[y][x] == BLACK) {
        blackCount += 1
      }
    }
  }
  return { whiteCount: whiteCount, blackCount: blackCount }
}

const isPutableDisk = (x: number, y: number, oneself: number, board: number[][]) => {
  if (board[y][x] != EMPTY) {
    return false
  }

  const opponent = oppositeColor(oneself)
  if (opponent === EMPTY) {
    return false
  }

  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue

      if (y + dy < 0 || HEIGHT <= y + dy || x + dx < 0 || WIDTH <= x + dx) continue

      if (board[y + dy][x + dx] != opponent) continue

      let tmpX, tmpY

      for (let k = 2; k < SIZE; k++) {
        tmpX = x + dx * k
        tmpY = y + dy * k

        if (tmpY < 0 || HEIGHT <= tmpY || tmpX < 0 || WIDTH <= tmpX) continue

        if (board[tmpY][tmpX] === EMPTY) break

        if (board[tmpY][tmpX] === oneself) return true
      }
    }
  }
  return false
}

const setPutableCoord = (color: number, board: number[][]) => {
  let x, y
  const new_board = JSON.parse(JSON.stringify(board))
  for (y = 0; y < HEIGHT; y++) {
    for (x = 0; x < WIDTH; x++) {
      if (isPutableDisk(x, y, color, board)) {
        new_board[y][x] = PUTABLE
      }
    }
  }
  return new_board
}

const boardInit = (): number[][] => {
  const newBoard = Array.from(new Array(HEIGHT), () => new Array(WIDTH).fill(9))
  newBoard[HEIGHT / 2][WIDTH / 2] = WHITE
  newBoard[HEIGHT / 2 - 1][WIDTH / 2 - 1] = WHITE
  newBoard[HEIGHT / 2 - 1][WIDTH / 2] = BLACK
  newBoard[HEIGHT / 2][WIDTH / 2 - 1] = BLACK
  return newBoard
}

const board = boardInit()
// eslint-disable-line
const turnColor = BLACK

const PutDisk = (x: number, y: number, oneself: number, board: number[][]) => {
  const new_board = JSON.parse(JSON.stringify(board))

  if (board[y][x] != EMPTY) return []

  const opponent = oppositeColor(oneself)
  if (opponent === EMPTY) return []

  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue

      if (y + dy < 0 || HEIGHT <= y + dy || x + dx < 0 || WIDTH <= x + dx) continue

      if (board[y + dy][x + dx] != opponent) continue

      let tmpX, tmpY

      for (let k = 2; k < SIZE; k++) {
        tmpX = x + dx * k
        tmpY = y + dy * k

        if (tmpY < 0 || HEIGHT <= tmpY || tmpX < 0 || WIDTH <= tmpX) continue

        if (board[tmpY][tmpX] === EMPTY) break

        if (board[tmpY][tmpX] === oneself) {
          new_board[y][x] = oneself
          for (let n = 1; n < k; n++) {
            new_board[y + dy * n][x + dx * n] = oneself
          }
        }
      }
    }
  }
  return new_board
}

const colorChange = (nowColor: number, board: number[][]) => {
  const opponent = oppositeColor(nowColor)
  let x, y
  for (const color of [opponent, nowColor]) {
    for (y = 0; y < HEIGHT; y++) {
      for (x = 0; x < WIDTH; x++) {
        if (isPutableDisk(x, y, color, board)) {
          return color
        }
      }
    }
  }
  return EMPTY
}

const gameOver = (board: number[][]) => {
  const { whiteCount, blackCount } = getDiskCount(board)
  let winner

  if (blackCount > whiteCount) {
    winner = BLACK
  } else if (whiteCount > blackCount) {
    winner = WHITE
  } else {
    winner = EMPTY
  }

  return { winner: winner, whiteCount: whiteCount, blackCount: blackCount }
}
export = {
  board: board,
  turnColor: turnColor,
  conv: conv,
  diskCount: diskCount,
  getDiskCount: getDiskCount,
  isPutableDisk: isPutableDisk,
  setPutableCoord: setPutableCoord,
  boardInit: boardInit,
  PutDisk: PutDisk,
  colorChange: colorChange,
  gameOver: gameOver,
}
