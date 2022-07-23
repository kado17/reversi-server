import http from 'http'
import socketio from 'socket.io'
import * as t from './typedef'
import * as rev from './reversi'

const port = process.env.PORT || 8000
//サーバーの立ち上げ
const server = http.createServer()
const io = new socketio.Server(server ,{
  cors: {
    origin: 'https://kado17.github.io',
    methods: ['GET', 'POST'],
    credentials:true
  },
})

const entryPL: { [key: string]: string } = { White: '', Black: '' }
const getEntryPLNum = (): number => {
  return Object.keys(entryPL).filter((key) => {
    return entryPL[key] !== ''
  }).length
}
//クライアントに送信するメッセージ分の生成
const geneW8EntryMsg = () => `参加者募集中 現在${getEntryPLNum()}/2`
const geneTurnPlayerMsg = (PLColor: t.PLColor) => `${rev.colorConvJp[PLColor]}の手番です`
const geneWinnerMsg = (PLColor: t.PLColor) =>
  PLColor !== 'NA' ? `${rev.colorConvJp[PLColor]}の勝ちです` : '引き分けです'
const geneSkipTurnAlert = (PLColor: t.PLColor) =>
  `置ける場所がないので、\n${rev.colorConvJp[PLColor]}の手番がスキップされました`

const gameInfoInit: t.GameInfo = {
  board: rev.createBoard(),
  msg: geneW8EntryMsg(),
  turnColor: 'Black',
  numberOfDisc: rev.getNumberOfDisc(rev.createBoard()),
  gameState: 'playerWanted',
}
const gameInfo = { ...gameInfoInit }

let connectCount = 0
/*クライアントに向けてそれぞれのデータを送信する関数
引数にsocketIdがあればそのidのクライアントのみに送信
なければクライアント全員に送信
*/
const sendUserInfo = (keyList: t.GameInfoKey[], socketId: string | null = null) => {
  const sKeyList: string[] = keyList
  const emitData: { [key: string]: t.GameInfoType } = {}
  Object.keys(gameInfo).forEach((key) => {
    if (sKeyList.includes(key)) emitData[key] = gameInfo[key]
  })
  if (socketId !== null) io.to(socketId).emit('gameInfo', emitData)
  else io.emit('gameInfo', emitData)
}
const sendUserState = (userState: t.UserState, socketId: string | null = null) => {
  if (socketId !== null) io.to(socketId).emit('userState', { newUserState: userState })
  else io.emit('userState', { newUserState: userState })
}

const sendShowAlert = (alertMsg: string, socketId: string | null = null) => {
  if (socketId !== null) io.to(socketId).emit('showAlert', { alertMsg: alertMsg })
  else io.emit('showAlert', { alertMsg: alertMsg })
}

const sendconnectCount = (count: number) => {
  io.emit('connectCount', { newConnectCount: count })
}

//ゲームが終了した時の処理
const gameOverProcessing = (isGameCancel: boolean) => {
  const winner = rev.getWinner(gameInfo.numberOfDisc)
  gameInfo.msg = geneWinnerMsg(winner)
  gameInfo.gameState = 'gameResult'
  const alertMsg = isGameCancel ? 'ゲームが中止になりました' : 'ゲームが終了しました'
  sendUserInfo(['board', 'turnColor', 'numberOfDisc', 'msg', 'gameState'])
  sendShowAlert(alertMsg)
  console.log('gameOver')
}

//GameInfoをすべて初期状態にする
const resetGameInfo = (): void => {
  Object.keys(gameInfo).forEach((key) => {
    gameInfo[key] = gameInfoInit[key]
  })
}
//entryPLのvalueを初期化する
const resetEntryPL = (): void => {
  Object.keys(entryPL).forEach((key) => {
    entryPL[key] = ''
  })
}

//ゲームリセット時に様々な変数を初期化したうえでクライアントに送信する
const gameResetProcessing = () => {
  resetGameInfo()
  resetEntryPL()
  sendUserState('spectator')
  sendUserInfo(['board', 'gameState', 'msg', 'numberOfDisc', 'turnColor'])
  sendShowAlert('ゲームがリセットされました')
  console.log('gameReset')
}

/*接続中のクライアントの人数を増減させて、
クライアントに現在の人数を送信*/
const connectCountPlus = () => {
  connectCount += 1
  sendconnectCount(connectCount)
}
const connectCountMinus = () => {
  connectCount -= 1
  sendconnectCount(connectCount)
}

//socket処理
io.on('connection', (socket: socketio.Socket) => {
  //接続したクライアントに現在のゲーム情報を送信
  console.log('connect:', socket.id)
  connectCountPlus()
  sendUserInfo(['board', 'gameState', 'msg', 'numberOfDisc', 'turnColor'], socket.id)

  //オセロ石が置かれたときの処理
  socket.on('putDisc', (data) => {
    const { x, y } = data
    const { newBoard, newNumberOfDisc, nextColor } = rev.putDisc(
      x,
      y,
      gameInfo.turnColor,
      gameInfo.board
    )
    if(gameInfo.turnColor === nextColor){
      sendShowAlert(geneSkipTurnAlert(nextColor))
    }
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

  //クライアントをエントリーさせる処理
  socket.on('entry', () => {
    let isSuccses = false
    if (!Object.values(entryPL).includes(socket.id)) {
      //空の時色をランダム
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
    if (isSuccses) {
      const nowEntryNum = getEntryPLNum()
      const alertMsg = isSuccses ? 'エントリーしました' : 'エントリーに失敗しました'
      sendShowAlert(alertMsg, socket.id)
      //二人そろっていなければmsgの更新だけ行う
      if (nowEntryNum < 2) {
        gameInfo.msg = geneW8EntryMsg()
        sendUserInfo(['msg'])
        sendUserState('waiting', socket.id)
      } else if (nowEntryNum === 2) { //二人そろったらゲーム開始
        sendUserState('PLWhite', entryPL.White)
        sendUserState('PLBlack', entryPL.Black)
        gameInfo.gameState = 'duringAGame'
        gameInfo.msg = geneTurnPlayerMsg(gameInfo.turnColor)
        sendUserInfo(['gameState', 'msg'])
        sendShowAlert('ゲーム開始!')
        console.log('gameStart')

      }
    }
  })

  //エントリーしたユーザーを外す処理
  socket.on('entryCancel', () => {
    if (Object.values(entryPL).includes(socket.id)) {
      const delKey = Object.keys(entryPL).find((key: string) => {
        return entryPL[key] === socket.id
      })
      if (delKey !== undefined) {
        if (gameInfo.gameState === 'playerWanted') {
          entryPL[delKey] = ''
          gameInfo.msg = geneW8EntryMsg()
          sendUserInfo(['msg'])
          sendUserState('spectator', socket.id)
        }
      }
    }
  })

  //ゲーム終了
  socket.on('cancel', () => {
    gameOverProcessing(true)
  })
  //ゲームリセット
  socket.on('reset', () => {
    gameResetProcessing()
  })

  //ユーザーの通信が切断されたとき
  socket.on('disconnect', () => {
    if (Object.values(entryPL).includes(socket.id)) {
      const delKey = Object.keys(entryPL).find((key: string) => {
        return entryPL[key] === socket.id
      })
      if (delKey !== undefined) {
        entryPL[delKey] = ''
        //外したユーザーがエントリーした場合、ゲーム中ならばゲームを終了させる
        if (gameInfo.gameState === 'playerWanted') {
          gameInfo.msg = geneW8EntryMsg()
          sendUserInfo(['msg'])
        } else if (gameInfo.gameState === 'duringAGame') {
          gameOverProcessing(true)
        }
      }
    }
    console.log('disconnect:', socket.id)
    connectCountMinus()
    //接続しているクライアントが0になったときにゲームをリセットする
    if (connectCount < 1) {
      gameResetProcessing()
    }
  })
})

//サーバー起動
server.listen(port, () => console.log(`app listening on port ${port}`))
