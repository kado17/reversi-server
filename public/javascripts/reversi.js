const SIZE = 8
const WIDTH = SIZE
const HEIGHT = SIZE
const WHITE = 0,
  BLACK = 1,
  PUTABLE = 8,
  EMPTY = 9

const conv = ['白', '黒']
const diskCount = {whiteCount: 0, blackCount: 0 }
const oppositeColor = (color) => (color === WHITE ? BLACK : color === BLACK ? WHITE : EMPTY)

exports.getDiskCount = (board) =>{
  let x,y;
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
return  {whiteCount: whiteCount, blackCount: blackCount }

}

const isPutableDisk = (x, y, oneself, board) => {
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

exports.setPutableCoord = (color, board) => {
  let x, y
  let new_board = JSON.parse(JSON.stringify(board))
  for (y = 0; y < HEIGHT; y++) {
    for (x = 0; x < WIDTH; x++) {
      if (isPutableDisk(x, y, color, board)) {
        new_board[y][x] = PUTABLE
      }
    }
  }
  return new_board
}

exports.boardInit = () => {
  let newBoard = Array.from(new Array(HEIGHT), () => new Array(WIDTH).fill(9))
  newBoard[HEIGHT / 2][WIDTH / 2] = WHITE
  newBoard[HEIGHT / 2 - 1][WIDTH / 2 - 1] = WHITE
  newBoard[HEIGHT / 2 - 1][WIDTH / 2] = BLACK
  newBoard[HEIGHT / 2][WIDTH / 2 - 1] = BLACK
  return newBoard
}

const board = this.boardInit()
// eslint-disable-line
const turnColor = BLACK

exports.PutDisk = (x, y, oneself, board) => {
  let new_board = JSON.parse(JSON.stringify(board))

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

exports.colorChange = (nowColor, board) => {
  const opponent = oppositeColor(nowColor)
  let x, y
  for (let color of [opponent, nowColor]) {
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



exports.gameOver = (board) => {
  const{ whiteCount,
    blackCount } = this.getDiskCount(board)
  let winner = ''

  if (blackCount > whiteCount) {
    winner = 'black'
  } else if (whiteCount > blackCount) {
    winner = 'white'
  } else {
    winner = 'draw'
  }

  return { winner: winner, whiteCount: whiteCount, blackCount: blackCount }
}

exports.board = board
exports.turnColor = turnColor
exports.conv = conv
exports.diskCount = diskCount
