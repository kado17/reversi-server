import http from 'http'
import socketio from 'socket.io'
import * as rev from './reversi'

const PORT = 8000
//サーバーの立ち上げ
const server = http.createServer()
const io = new socketio.Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

const geneW8EntryMsg = (num: number) => `参加者募集中 現在${num}/2`
const geneTurnPlayerMsg = (PLColor: rev.PLColor) => `${rev.colorConvJp[PLColor]}の手番です`
const geneWinnerMsg = (PLColor: rev.PLColor) =>
  PLColor !== rev.PLColor.NA ? `${rev.colorConvJp[PLColor]}の勝ちです` : '引き分けです'

const gameStateInit: rev.GameState = {
  board: rev.createBoard(),
  msg: geneW8EntryMsg(0),
  turnColor: rev.PLColor.Black,
  numberOfDisc: rev.getNumberOfDisc(rev.createBoard()),
  isPlaying: false,
  isGameOver: false,
}

const gameState = { ...gameStateInit }
const entryPLInit: rev.EntryPL = { White: '', Black: '' }
const entryPL = { ...entryPLInit }
const geneEmitData = (keyList: rev.GSKey[]) => {
  const result: { [key: string]: rev.GameStateType } = {}
  Object.keys(gameState).forEach((key) => {
    if (key in keyList) result[key] = gameState[key]
  })
  return result
}

const resetGameState = (): void => {
  Object.keys(gameState).forEach((key) => {
    gameState[key] = gameStateInit[key]
  })
}

const gameOverProcessing = (isGameCancel: boolean) => {
  const winner = rev.gameOver(gameState.numberOfDisc)
  io.emit('gameOver', { isGameCancel: isGameCancel })
  gameState.msg = geneWinnerMsg(winner)
  gameState.isPlaying = false
  gameState.isGameOver = false
  io.emit('gameInfo', geneEmitData([rev.GSKey.msg, rev.GSKey.isPlaying, rev.GSKey.isGameOver]))
}

//socket処理を記載する
io.on('connection', (socket: socketio.Socket) => {
  console.log(socket.id, '接続!')
  io.to(socket.id).emit('gameInfo', gameState)
  //socket処理

  socket.on('putDisc', (data) => {
    const { x, y } = data
    const { newBoard, newNumberOfDisc } = rev.putDisc(x, y, gameState.turnColor, gameState.board)
    const nextColor = rev.colorChange(gameState.turnColor, newBoard)
    console.log({ board: newBoard, x: x, y: y, t: nextColor })

    if (gameState.turnColor === rev.PLColor.NA) {
      //const result = rev.gameOver(board)
      //server.emit('gameOver', { result: result })
      //msg = geneWinnerMsg(result.winner)
      //isPlaying = false
    } else {
      gameState.board = newBoard
      gameState.turnColor = nextColor
      gameState.numberOfDisc = newNumberOfDisc
      gameState.msg = geneTurnPlayerMsg(nextColor)

      server.emit(
        'gameInfo',
        geneEmitData([rev.GSKey.board, rev.GSKey.turnColor, rev.GSKey.NumberOfDisc, rev.GSKey.msg])
      )
    }
  })

  socket.on('entry', () => {
    let isSuccses = false
    console.log('entry:', socket.id)
    if (Object.keys(entryPL).length < 2 && !Object.values(entryPL).includes(socket.id)) {
      //空の時ランダム
      if (
        Object.keys(entryPL).every((key) => {
          entryPL[key] === ''
        })
      ) {
        const randomKey: string =
          Object.keys(entryPL)[Math.floor(Math.random() * Object.keys(entryPL).length)]
        entryPL[randomKey] = socket.id
      } else if (entryPL.black !== '') {
        entryPL.white = socket.id
      } else {
        entryPL.black = socket.id
      }
      isSuccses = true
    }
    io.to(socket.id).emit('btnActionRep', isSuccses)
    console.log('EntryPL:', entryPL)
    if (!isSuccses) {
      const nowEntryNum = Object.keys(entryPL).filter((key) => {
        entryPL[key] === ''
      }).length
      if (nowEntryNum < 2) {
        gameState.msg = geneW8EntryMsg(nowEntryNum)
        io.emit('gameInfo', geneEmitData([rev.GSKey.msg]))
      } else {
        io.to(entryPL.White).emit('startReversi', { color: rev.colorConvEn[rev.PLColor.White] })
        io.to(entryPL.Black).emit('startReversi', { color: rev.colorConvEn[rev.PLColor.Black] })
        gameState.isPlaying = true
        gameState.msg = geneTurnPlayerMsg(gameState.turnColor)
        io.emit('gameInfo', geneEmitData([rev.GSKey.isPlaying, rev.GSKey.msg]))
      }
    }
  })

  socket.on('cancel', () => {
    gameOverProcessing(true)
  })

  socket.on('reset', () => {
    resetGameState()
    server.emit('gameInfo', gameState)
  })
  socket.on('disconnect', () => {
    console.log('s', socket.id)
    if (Object.values(entryPL).includes(socket.id)) {
      const delKey = Object.keys(entryPL).reduce((r: string | null, k: string) => {
        return entryPL[k] === socket.id ? k : r
      }, null)
      if (delKey !== null) {
        delete entryPL[delKey]
        console.log(entryPL, delKey)
        if (gameState.isPlaying === false && gameState.isGameOver === false) {
          gameState.msg = geneW8EntryMsg(Object.keys(entryPL).length)
          console.log(gameState.msg)
          io.emit('gameInfo', geneEmitData([rev.GSKey.msg]))
        }
      } else if (gameState.isPlaying === true && gameState.isGameOver === false) {
        gameOverProcessing(true)
      }
    }
    console.log('disconnect', socket.id)
  })
})

server.listen(PORT, () => console.log(`app listening on port ${PORT}`))
