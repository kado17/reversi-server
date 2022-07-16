export const Disc = {
    White: 0,
    Black: 1,
    Putable: 8,
    Empty: 9,
  } as const
  export type Disc = typeof Disc[keyof typeof Disc]
  export type PLColor = 'White' | 'Black' | 'NA'
  export type GameState = 'playerWanted' | 'duringAGame' | 'gameResult'
  export type UserState = 'spectator' | 'waiting' | 'PLWhite' | 'PLBlack'
  
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
  
