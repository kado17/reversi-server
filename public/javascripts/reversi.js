const SIZE = 8
const WIDTH = SIZE
const HEIGHT = SIZE
const WHITE = 0,
  BLACK = 1,
  //ISPUTABLE = 8,
  EMPTY = 9

exports.colorChange = (color) => (color === WHITE ? BLACK : WHITE)

exports.boardInit = () => {
  let new_board = JSON.parse(JSON.stringify(new Array(8).fill(new Array(8).fill(EMPTY))))
  new_board[HEIGHT / 2][WIDTH / 2] = WHITE
  new_board[HEIGHT / 2 - 1][WIDTH / 2 - 1] = WHITE
  new_board[HEIGHT / 2 - 1][WIDTH / 2] = BLACK
  new_board[HEIGHT / 2][WIDTH / 2 - 1] = BLACK
  return new_board
}

const board = JSON.parse(JSON.stringify(this.boardInit()))
const color = [WHITE, BLACK]
// eslint-disable-line
const turnColor = color[Math.floor(Math.random() * color.length)]

exports.isPutableDisk = (x, y, oneself, board) => {
  if (board[y][x] != EMPTY) {
    return false
  }

  let opponent
  if (oneself === WHITE) {
    opponent = BLACK
  } else if (oneself === BLACK) {
    opponent = WHITE
  } else {
    return false
  }

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue
      }

      if (y + j < 0 || HEIGHT < y + j || x + i < 0 || WIDTH < x + i) {
        continue
      }

      if (board[y + j][x + i] != opponent) {
        continue
      }

      let tmpX, tmpY

      for (let k = 2; k < SIZE; k++) {
        tmpX = x + i * k
        tmpY = y + j * k

        if (tmpY < 0 || HEIGHT < tmpY || tmpX < 0 || WIDTH < tmpX) {
          continue
        }

        if (board[tmpY][tmpX] === EMPTY) {
          break
        }

        if (board[tmpY][tmpX] === oneself) {
          return true
        }
      }
    }
  }
  return false
}

exports.PutDisk = (x, y, oneself, board) => {
  let new_board = JSON.parse(JSON.stringify(board))

  if (board[y][x] != EMPTY) {
    return []
  }

  let opponent
  if (oneself === WHITE) {
    opponent = BLACK
  } else if (oneself === BLACK) {
    opponent = WHITE
  } else {
    return []
  }

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue
      }

      if (y + j < 0 || HEIGHT <= y + j || x + i < 0 || WIDTH <= x + i) {
        continue
      }

      if (board[y + j][x + i] != opponent) {
        continue
      }

      let tmpX, tmpY

      for (let k = 2; k < SIZE; k++) {
        tmpX = x + i * k
        tmpY = y + j * k

        if (tmpY < 0 || HEIGHT < tmpY || tmpX < 0 || WIDTH < tmpX) {
          continue
        }

        if (board[tmpY][tmpX] === EMPTY) {
          break
        }

        if (board[tmpY][tmpX] === oneself) {
          new_board[y][x] = oneself
          for (let n = 1; n < k; n++) {
            new_board[y + j * n][x + i * n] = oneself
          }
        }
      }
    }
  }
  return new_board
}

exports.board = board
exports.turnColor = turnColor
