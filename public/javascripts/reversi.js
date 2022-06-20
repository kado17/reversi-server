const SIZE = 8
const WIDTH = SIZE
const HEIGHT = SIZE

let board = [
  [9, 9, 9, 9, 9, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9],
  [1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 1],
  [9, 9, 9, 9, 9, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9],
]

exports.board_init = () => {
  let new_board = JSON.parse(
    JSON.stringify(new Array(8).fill(new Array(8).fill(9)))
  )
  new_board[HEIGHT / 2][WIDTH / 2] = 0
  new_board[HEIGHT / 2 - 1][WIDTH / 2 - 1] = 0
  new_board[HEIGHT / 2 - 1][WIDTH / 2] = 1
  new_board[HEIGHT / 2][WIDTH / 2 - 1] = 1
  return new_board
}



exports.board = board
