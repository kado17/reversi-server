import http from 'http'
import socketio from 'socket.io'
import * as rev from './reversi'

const port= process.env.PORT || 8000
//サーバーの立ち上げ
const server = http.createServer()
const io = new socketio.Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

const geneW8EntryMsg = () => `参加者募集中 現在${getEntryPLNum()}/2`
const geneTurnPlayerMsg = (PLColor: rev.PLColor) => `${rev.colorConvJp[PLColor]}の手番です`
const geneWinnerMsg = (PLColor: rev.PLColor) =>
  PLColor !== 'NA' ? `${rev.colorConvJp[PLColor]}の勝ちです` : '引き分けです'
const entryPL: { [key: string]: string } = { White: '', Black: '' }
const gameInfoInit: rev.GameInfo = {
  board: rev.createBoard(),
  msg: geneW8EntryMsg(),
  turnColor: 'Black',
  numberOfDisc: rev.getNumberOfDisc(rev.createBoard()),
  gameState: 'playerWanted',
}

const gameInfo = { ...gameInfoInit }


const resetGameState = (): void => {
  Object.keys(gameInfo).forEach((key) => {
    gameInfo[key] = gameInfoInit[key]
  })
}
const resetEntryPL = (): void => {
  Object.keys(entryPL).forEach((key) => {
    entryPL[key] = ''
  })
}
const gameOverProcessing = (isGameCancel: boolean) => {
  const winner = rev.getWinner(gameInfo.numberOfDisc)
  gameInfo.msg = geneWinnerMsg(winner)
  gameInfo.gameState = 'gameResult'
  const alertMsg = isGameCancel ? 'ゲームが中止になりました' : 'ゲームが終了しました'
  sendUserInfo(['board', 'turnColor', 'numberOfDisc', 'msg', 'gameState'])
  sendShowAlert(alertMsg)
  sendSetUserState('spectator')
}
const sendSetUserState =(userStateKey:rev.UserStateKey, socketId:string|null = null)=> {
  if(socketId !== null)
    io.to(socketId).emit('setUserState', { userStateKey: userStateKey })
  else
    io.emit('setUserState', { userStateKey: userStateKey })
  
}

const sendUserInfo = (keyList: rev.GameInfoKey[],socketId:string|null = null) => {
  const sKeyList: string[] = keyList
  const emitData: { [key: string]: rev.GameInfoType } = {}
  Object.keys(gameInfo).forEach((key) => {
    if (sKeyList.includes(key)) emitData[key] = gameInfo[key]
  })
  console.log('geneE', emitData)
  if(socketId !== null)
    io.to(socketId).emit('gameInfo', emitData)
  else
  io.emit('gameInfo', emitData)
}

const sendShowAlert =(alertMsg:string, socketId:string|null = null)=> {
  if(socketId !== null)
    io.to(socketId).emit('showAlert', { alertMsg: alertMsg })
  else
    io.emit('showAlert', {alertMsg: alertMsg })
  
}
const getEntryPLNum = ():number =>{return Object.keys(entryPL).filter((key) => {
  return entryPL[key] !== ''
}).length }

//socket処理を記載する
io.on('connection', (socket: socketio.Socket) => {
  console.log(socket.id, '接続!')
  sendUserInfo(['board','gameState','msg','numberOfDisc','turnColor'], socket.id)
  //socket処理

  socket.on('putDisc', (data) => {
    const { x, y } = data
    const { newBoard, newNumberOfDisc, nextColor } = rev.putDisc(
      x,
      y,
      gameInfo.turnColor,
      gameInfo.board
    )
    gameInfo.board = newBoard
    gameInfo.numberOfDisc = newNumberOfDisc
    gameInfo.turnColor = nextColor
    if (nextColor === 'NA') {
      gameOverProcessing(false)
    } else {
      gameInfo.msg = geneTurnPlayerMsg(nextColor)
      sendUserInfo(['board', 'turnColor', 'numberOfDisc', 'msg'])
    }
  })

  socket.on('entry', () => {
    let isSuccses = false
    console.log('entry:', socket.id)
    if (!Object.values(entryPL).includes(socket.id)) {
      //空の時ランダム
      if (
        Object.keys(entryPL).every((key) => {
          entryPL[key] === ''
        })
      ) {
        const randomKey: string =
          Object.keys(entryPL)[Math.floor(Math.random() * Object.keys(entryPL).length)]
        entryPL[randomKey] = socket.id
      } else if (entryPL.White === '') {
        entryPL.White = socket.id
      } else {
        entryPL.Black = socket.id
      }
      isSuccses = true
    }
    console.log('EntryPL:', entryPL)
    if (isSuccses) {
      const nowEntryNum = getEntryPLNum()
      const alertMsg = isSuccses ? 'エントリーしました' : 'エントリーに失敗しました'
      sendShowAlert(alertMsg, socket.id)
      if (nowEntryNum < 2) {
        gameInfo.msg = geneW8EntryMsg()
        sendUserInfo(['msg'])
        sendSetUserState('waiting')
      } else {
        sendSetUserState('PLWhite', entryPL.White)
        sendSetUserState('PLBlack', entryPL.Black)
        gameInfo.gameState = 'duringAGame'
        gameInfo.msg = geneTurnPlayerMsg(gameInfo.turnColor)
        sendUserInfo(['gameState', 'msg'])
      }
    }
   
  })

  socket.on('cancel', () => {
    gameOverProcessing(true)
  })

  socket.on('reset', () => {
    resetGameState()
    resetEntryPL()
    sendUserInfo(['board','gameState','msg','numberOfDisc','turnColor'])
  })
  socket.on('disconnect', () => {
    console.log('s', socket.id)
    if (Object.values(entryPL).includes(socket.id)) {
      const delKey = Object.keys(entryPL).find((key: string) => {
        return entryPL[key] === socket.id
      })
      if (delKey !== undefined) {
        entryPL[delKey] = ''
        console.log(entryPL, delKey,gameInfo.gameState)
        if (gameInfo.gameState === 'playerWanted') {
          gameInfo.msg = geneW8EntryMsg()
          sendUserInfo(['msg'])
        }else if (gameInfo.gameState === 'duringAGame') {
        console.log('STOP')
        gameOverProcessing(true)
      }
      } 
    }
    console.log('disconnect', socket.id)
  })
})

server.listen(port, () => console.log(`app listening on port ${port}`))
