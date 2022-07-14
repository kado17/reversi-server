const SIZE = 8
const WIDTH = SIZE
const HEIGHT = SIZE
export const Disc = {
  White: 0,
  Black: 1,
  Putable: 8,
  Empty: 9,
} as const

export const PLColor = {
  White: 0,
  Black: 1,
  NA: 99,
} as const

export type Disc = typeof Disc[keyof typeof Disc]
export type PLColor = typeof PLColor[keyof typeof PLColor]
type Conv = { [key in PLColor]: string }
export const colorConvJp: Conv = { 0: '白', 1: '黒', 99: '引き分け' }
export const colorConvEn: Conv = { 0: 'White', 1: 'Black', 99: 'Drow' }

export type NumberOfDisc = {
  [key: string]: number
  White: number
  Black: number
}

export type EntryPL = {
  [key: string]: string
  White: string
  Black: string
}

export const GSKey = {
  board: 'board',
  msg: 'msg',
  turnColor: 'turnColor',
  numberOfDisc: 'numberOfDisc',
  isPlaying: 'isPlaying',
  isGameOver: 'isGameOver',
} as const


export type GameStateType = Disc[][] | string | PLColor | NumberOfDisc | boolean

export type GameState = {
  [key: string]: Disc[][] | string | PLColor | NumberOfDisc | boolean
  board: Disc[][]
  msg: string
  turnColor: PLColor
  numberOfDisc: NumberOfDisc
  isPlaying: boolean
  isGameOver: boolean
}

const oppositeColor = (color: PLColor) => {
  if (color === PLColor.White) return PLColor.Black
  else if (color === PLColor.Black) return PLColor.White
  return PLColor.NA
}

export const getNumberOfDisc = (board: Disc[][]) => {
  let x, y
  const result: NumberOfDisc = { White: 0, Black: 0 }
  for (y = 0; y < HEIGHT; y++) {
    for (x = 0; x < WIDTH; x++) {
      if (board[y][x] === Disc.White) {
        result.White += 1
      } else if (board[y][x] === Disc.Black) {
        result.Black += 1
      }
    }
  }
  return result
}

export const isPutableDisc = (x: number, y: number, oneself: PLColor, board: Disc[][]) => {
  const fixedBoard= fixPutableToEmpty(board)
  if (fixedBoard[y][x] != Disc.Empty) {
    return false
  }

  const opponent = oppositeColor(oneself)
  if (opponent === PLColor.NA) return false
  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue

      if (y + dy < 0 || HEIGHT <= y + dy || x + dx < 0 || WIDTH <= x + dx) continue

      if (fixedBoard[y + dy][x + dx] != opponent) continue

      let tmpX, tmpY

      for (let k = 2; k < SIZE; k++) {
        tmpX = x + dx * k
        tmpY = y + dy * k

        if (tmpY < 0 || HEIGHT <= tmpY || tmpX < 0 || WIDTH <= tmpX) continue

        if (fixedBoard[tmpY][tmpX] === Disc.Empty) break

        if (fixedBoard[tmpY][tmpX] === oneself) return true
      }
    }
  }
  return false
}

const setPutableArea = (turnColor: PLColor, board: Disc[][]): Disc[][] => {
   return board.map((row, y) =>
    row.map((_, x) => (isPutableDisc(x, y, turnColor, board) ? Disc.Putable : board[y][x]))
  )
}

const fixPutableToEmpty = (board: Disc[][]): Disc[][] => {
  return board.map((row, y) =>
    row.map((num, x) => (num === Disc.Putable ? Disc.Empty : board[y][x]))
  )
}

export const createBoard = (): Disc[][] => {
  const board = Array.from(new Array(HEIGHT), () => new Array(WIDTH).fill(Disc.Empty))
  board[HEIGHT / 2][WIDTH / 2] = Disc.White
  board[HEIGHT / 2 - 1][WIDTH / 2 - 1] = Disc.White
  board[HEIGHT / 2 - 1][WIDTH / 2] = Disc.Black
  board[HEIGHT / 2][WIDTH / 2 - 1] = Disc.Black
  const newBoard = setPutableArea(PLColor.Black, board)
  return newBoard
}

export const putDisc = (
  x: number,
  y: number,
  turnColor: PLColor,
  board: Disc[][]
): { newBoard: Disc[][]; newNumberOfDisc: NumberOfDisc } => {
  if (board[y][x] != Disc.Putable)
    return { newBoard: board, newNumberOfDisc: getNumberOfDisc(board) }

  const opponent = oppositeColor(turnColor)
  if (opponent === PLColor.NA) return { newBoard: board, newNumberOfDisc: getNumberOfDisc(board) }
  const newBoard = fixPutableToEmpty(board)

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

        if (board[tmpY][tmpX] === Disc.Empty) break

        if (board[tmpY][tmpX] === turnColor) {
          newBoard[y][x] = turnColor
          for (let n = 1; n < k; n++) {
            newBoard[y + dy * n][x + dx * n] = turnColor
          }
        }
      }
    }
  }

  return {
    newBoard: setPutableArea(opponent, newBoard),
    newNumberOfDisc: getNumberOfDisc(newBoard),
  }
}

export const colorChange = (nowColor: PLColor, board: Disc[][]) => {
  const opponent = oppositeColor(nowColor)
  let x, y
  for (const color of [opponent, nowColor]) {
    for (y = 0; y < HEIGHT; y++) {
      for (x = 0; x < WIDTH; x++) {
        if (isPutableDisc(x, y, color, board)) {
          return color
        }
      }
    }
  }
  return PLColor.NA
}

export const gameOver = (numberOfDisc: NumberOfDisc) => {
  let winner: PLColor
  if (numberOfDisc.Black > numberOfDisc.White) winner = PLColor.Black
  else if (numberOfDisc.White > numberOfDisc.Black) winner = PLColor.White
  else winner = PLColor.NA
  return winner
}
