import * as t from './typedef'
const SIZE = 8
const WIDTH = SIZE
const HEIGHT = SIZE

export const colorConvJp: { [key in t.PLColor]: string } = {
  White: '白',
  Black: '黒',
  NA: '引き分け',
}

const colorConvDisc: { [key in t.PLColor]: t.Disc } = { White: 0, Black: 1, NA: 9 }

//手番の反対の色を返す
const oppositeColor = (color: t.PLColor): t.PLColor => {
  if (color === 'White') return 'Black'
  else if (color === 'Black') return 'White'
  return 'NA'
}

//boardの8(Putable)を9(empty)に置き換え
const fixPutableToEmpty = (board: t.Disc[][]): t.Disc[][] => {
  return board.map((row, y) =>
    row.map((num, x) => (num === t.Disc.Putable ? t.Disc.Empty : board[y][x]))
  )
}

//座標にオセロ石が置けるかを判断
export const isPutableDisc = (
  x: number,
  y: number,
  oneself: t.PLColor,
  board: t.Disc[][]
): boolean => {
  //この後の処理のためにboardの8(Putable)を9(empty)に置き換え
  const fixedBoard = fixPutableToEmpty(board)
  if (fixedBoard[y][x] != t.Disc.Empty) {
    return false
  }

  const opponent = oppositeColor(oneself)
  if (opponent === 'NA') return false
  //引数で指定した座標の周り8マスを順番に処理
  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue
      if (y + dy < 0 || HEIGHT <= y + dy || x + dx < 0 || WIDTH <= x + dx) continue
      if (fixedBoard[y + dy][x + dx] != colorConvDisc[opponent]) continue

      let tmpX, tmpY
      //fixedBoard[y + dy][x + dx]が相手の色の石の時に、その方向の次のマスを確認
      for (let k = 2; k < SIZE; k++) {
        tmpX = x + dx * k
        tmpY = y + dy * k

        if (tmpY < 0 || HEIGHT <= tmpY || tmpX < 0 || WIDTH <= tmpX) continue
        if (fixedBoard[tmpY][tmpX] === t.Disc.Empty) break
        /*(石を置く場所)-(相手の石:一個以上)-(自分の石)が一直線になるので
        引数座標に石が置けると判断
        */
        if (fixedBoard[tmpY][tmpX] === colorConvDisc[oneself]) return true
      }
    }
  }
  return false
}

//手番プレイヤーが置ける場所を8(Putable)に変更
const setPutableArea = (turnColor: t.PLColor, board: t.Disc[][]): t.Disc[][] => {
  return board.map((row, y) =>
    row.map((_, x) => (isPutableDisc(x, y, turnColor, board) ? t.Disc.Putable : board[y][x]))
  )
}
//boardの初期化処理 
export const createBoard = (): t.Disc[][] => {
  const board = Array.from(new Array(HEIGHT), () => new Array(WIDTH).fill(t.Disc.Empty))
  board[HEIGHT / 2][WIDTH / 2] = t.Disc.White
  board[HEIGHT / 2 - 1][WIDTH / 2 - 1] = t.Disc.White
  board[HEIGHT / 2 - 1][WIDTH / 2] = t.Disc.Black
  board[HEIGHT / 2][WIDTH / 2 - 1] = t.Disc.Black
  const newBoard = setPutableArea('Black', board)
  return newBoard
}

//次の手番プレイヤーの色を返す
const colorChange = (nowColor: t.PLColor, board: t.Disc[][]): t.PLColor => {
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
  //どちらも置けない場合はNAを返す
  return 'NA'
}

//boardの白と黒の石の数をそれぞれ返す
export const getNumberOfDisc = (board: t.Disc[][]): t.NumberOfDisc => {
  let x, y
  const result: t.NumberOfDisc = { White: 0, Black: 0 }
  for (y = 0; y < HEIGHT; y++) {
    for (x = 0; x < WIDTH; x++) {
      if (board[y][x] === t.Disc.White) {
        result.White += 1
      } else if (board[y][x] === t.Disc.Black) {
        result.Black += 1
      }
    }
  }
  return result
}

//オセロ石を置く処理
export const putDisc = (
  x: number,
  y: number,
  turnColor: t.PLColor,
  board: t.Disc[][]
): { newBoard: t.Disc[][]; newNumberOfDisc: t.NumberOfDisc; nextColor: t.PLColor } => {
  const failureResData = {
    newBoard: board,
    newNumberOfDisc: getNumberOfDisc(board),
    nextColor: turnColor,
  }
  if (board[y][x] != t.Disc.Putable) return failureResData

  const opponent = oppositeColor(turnColor)
  if (opponent === 'NA') return failureResData
  //この後の処理のためにboardの8(Putable)を9(empty)に置き換え
  const newBoard = fixPutableToEmpty(board)
  //引数で指定した座標の周り8マスを順番に処理
  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue
      if (y + dy < 0 || HEIGHT <= y + dy || x + dx < 0 || WIDTH <= x + dx) continue
      if (board[y + dy][x + dx] != colorConvDisc[opponent]) continue

      let tmpX, tmpY
      //board[y + dy][x + dx]が相手の色の石の時に、その方向の次のマスを確認
      for (let k = 2; k < SIZE; k++) {
        tmpX = x + dx * k
        tmpY = y + dy * k

        if (tmpY < 0 || HEIGHT <= tmpY || tmpX < 0 || WIDTH <= tmpX) continue
        if (board[tmpY][tmpX] === t.Disc.Empty) break
        /*(石を置く場所)-(相手の石:一個以上)-(自分の石)が一直線になるので
        間にある相手の石を全てひっくり返す
        */
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

//現在の石の数から勝者を決める
export const getWinner = (numberOfDisc: t.NumberOfDisc): t.PLColor => {
  let winner: t.PLColor
  if (numberOfDisc.Black > numberOfDisc.White) winner = 'Black'
  else if (numberOfDisc.White > numberOfDisc.Black) winner = 'White'
  else winner = 'NA'
  return winner
}
