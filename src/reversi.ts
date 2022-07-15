const SIZE = 8
const WIDTH = SIZE
const HEIGHT = SIZE
export const Disc = {
  White: 0,
  Black: 1,
  Putable: 8,
  Empty: 9,
} as const

export type GameState = 'playerWanted' | 'duringAGame' | 'gameResult'
export type Disc = typeof Disc[keyof typeof Disc]
export type PLColor = 'White' | 'Black' | 'NA'
export type UserStateKey = 'spectator' | 'waiting' | 'PLWhite' | 'PLBlack'
export const colorConvJp: { [key in PLColor]: string } = {
  White: '白',
  Black: '黒',
  NA: '引き分け',
}
export const colorConvDisc: { [key in PLColor]: Disc } = { White: 0, Black: 1, NA: 9 }

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

export type GameInfoKey = 'board' | 'msg' | 'turnColor' | 'numberOfDisc' | 'gameState'
export type GameInfoType = Disc[][] | string | PLColor | NumberOfDisc | boolean

export type GameInfo = {
  [key: string]: Disc[][] | string | PLColor | NumberOfDisc | GameState
  board: Disc[][]
  msg: string
  turnColor: PLColor
  numberOfDisc: NumberOfDisc
  gameState: GameState
}

const oppositeColor = (color: PLColor): PLColor => {
  if (color === 'White') return 'Black'
  else if (color === 'Black') return 'White'
  return 'NA'
}

export const getNumberOfDisc = (board: Disc[][]): NumberOfDisc => {
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

export const isPutableDisc = (x: number, y: number, oneself: PLColor, board: Disc[][]): boolean => {
  const fixedBoard = fixPutableToEmpty(board)
  if (fixedBoard[y][x] != Disc.Empty) {
    return false
  }

  const opponent = oppositeColor(oneself)
  if (opponent === 'NA') return false
  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue

      if (y + dy < 0 || HEIGHT <= y + dy || x + dx < 0 || WIDTH <= x + dx) continue

      if (fixedBoard[y + dy][x + dx] != colorConvDisc[opponent]) continue

      let tmpX, tmpY

      for (let k = 2; k < SIZE; k++) {
        tmpX = x + dx * k
        tmpY = y + dy * k

        if (tmpY < 0 || HEIGHT <= tmpY || tmpX < 0 || WIDTH <= tmpX) continue

        if (fixedBoard[tmpY][tmpX] === Disc.Empty) break

        if (fixedBoard[tmpY][tmpX] === colorConvDisc[oneself]) return true
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
  const newBoard = setPutableArea('Black', board)
  return newBoard
}
const colorChange = (nowColor: PLColor, board: Disc[][]): PLColor => {
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
  return 'NA'
}
export const putDisc = (
  x: number,
  y: number,
  turnColor: PLColor,
  board: Disc[][]
): { newBoard: Disc[][]; newNumberOfDisc: NumberOfDisc; nextColor: PLColor } => {
  if (board[y][x] != Disc.Putable)
    return { newBoard: board, newNumberOfDisc: getNumberOfDisc(board), nextColor: turnColor }

  const opponent = oppositeColor(turnColor)
  if (opponent === 'NA')
    return { newBoard: board, newNumberOfDisc: getNumberOfDisc(board), nextColor: turnColor }
  const newBoard = fixPutableToEmpty(board)

  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue

      if (y + dy < 0 || HEIGHT <= y + dy || x + dx < 0 || WIDTH <= x + dx) continue

      if (board[y + dy][x + dx] != colorConvDisc[opponent]) continue

      let tmpX, tmpY

      for (let k = 2; k < SIZE; k++) {
        tmpX = x + dx * k
        tmpY = y + dy * k

        if (tmpY < 0 || HEIGHT <= tmpY || tmpX < 0 || WIDTH <= tmpX) continue

        if (board[tmpY][tmpX] === Disc.Empty) break

        if (board[tmpY][tmpX] === colorConvDisc[turnColor]) {
          newBoard[y][x] = colorConvDisc[turnColor]
          for (let n = 1; n < k; n++) {
            newBoard[y + dy * n][x + dx * n] = colorConvDisc[turnColor]
          }
        }
      }
    }
  }
  const nextColor = colorChange(turnColor, newBoard)
  return {
    newBoard: setPutableArea(nextColor, newBoard),
    newNumberOfDisc: getNumberOfDisc(newBoard),
    nextColor: nextColor,
  }
}

export const getWinner = (numberOfDisc: NumberOfDisc): PLColor => {
  let winner: PLColor
  if (numberOfDisc.Black > numberOfDisc.White) winner = 'Black'
  else if (numberOfDisc.White > numberOfDisc.Black) winner = 'White'
  else winner = 'NA'
  return winner
}
