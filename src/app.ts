import http from 'http'
import socketio from 'socket.io'
import reversi from './reversi'

const PORT = 8000
//サーバーの立ち上げ
const server = http.createServer()
const io = new socketio.Server(server,{cors: {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST'],
}},)

let board = reversi.board
let turnColor = reversi.turnColor
let entryPL: { [key: string]: string } = {}
const entryPLKey = ['white', 'black']
let isPlaying = false
let diskCount = reversi.diskCount

const geneW8EntryMsg = (num: number) => `参加者募集中 現在${num}/2`
const geneTurnPlayerMsg = (num: number) => `${reversi.conv[num]}の手番です`
const geneWinnerMsg = (num: number) =>
  num !== 9 ? `${reversi.conv[num]}の勝ちです` : '引き分けです'

let msg = geneW8EntryMsg(Object.keys(entryPL).length)

//socket処理を記載する
io.on('connection', function (socket: socketio.Socket) {
  console.log(socket.id, '接続!')
  io.to(socket.id).emit('gameInfo', {
    board: isPlaying ? reversi.setPutableCoord(turnColor, board) : board,
    msg: msg,
    diskCount: diskCount,
    isPlaying: isPlaying,
  })
  //socket処理

  socket.on('putDisk', (data) => {
    const { x, y } = data
    const newBoard = reversi.PutDisk(x, y, turnColor, board)
    const nextColor = reversi.colorChange(turnColor, newBoard)
    board = newBoard
    turnColor = nextColor
    const { whiteCount, blackCount } = reversi.getDiskCount(board)
    diskCount.whiteCount = whiteCount
    diskCount.blackCount = blackCount
    const setPBoard = reversi.setPutableCoord(nextColor, newBoard)
    console.log({ board: board, x: x, y: y, t: nextColor })
    if (turnColor === 9) {
      const result = reversi.gameOver(board)
      server.emit('gameOver', { result: result })
      msg = geneWinnerMsg(result.winner)
      isPlaying = false
    } else {
      msg = geneTurnPlayerMsg(nextColor)
    }

    server.emit('gameInfo', {
      board: setPBoard,
      msg: msg,
      diskCount: diskCount,
      turnColor: entryPLKey[turnColor],
    })
  })

  socket.on('entry', () => {
    const returnData = { type: 'entry', isSuccses: false }
    console.log('entry:', socket.id)
    if (Object.keys(entryPL).length < 2 && !Object.values(entryPL).includes(socket.id)) {
      console.log('log')
      //空の時ランダム
      if (!Object.keys(entryPL).length) {
        entryPL[entryPLKey[Math.floor(Math.random() * entryPLKey.length)]] = socket.id
      } else if (!(entryPLKey[0] in entryPL)) {
        entryPL[entryPLKey[0]] = socket.id
      } else {
        entryPL[entryPLKey[1]] = socket.id
      }
      returnData.isSuccses = true
    }
    io.to(socket.id).emit('btnActionRep', returnData)
    console.log('EntryPL:', entryPL)

    if (Object.keys(entryPL).length !== 2) {
      msg = geneW8EntryMsg(Object.keys(entryPL).length)
      console.log(msg)
      io.emit('gameInfo', { msg: msg })
    } else {
      io.to(entryPL[entryPLKey[0]]).emit('startReversi', { color: entryPLKey[0] })
      io.to(entryPL[entryPLKey[1]]).emit('startReversi', { color: entryPLKey[1] })
      io.emit('startReversi', { color: null })
      isPlaying = true
      turnColor = 1
      msg = geneTurnPlayerMsg(turnColor)
      board = reversi.boardInit()
      console.log('start', board)
      io.emit('gameInfo', { board: reversi.setPutableCoord(turnColor, board), msg: msg })
    }
  })

  socket.on('cancel', () => {
    const result = reversi.gameOver(board)
    io.emit('gameOver', { result: result, isCancel: true })
    msg = geneWinnerMsg(result.winner)
    io.emit('gameInfo', { msg: msg, diskCount: diskCount })
    isPlaying = false
  })
  socket.on('reset', () => {
    board = reversi.board
    turnColor = reversi.turnColor
    entryPL = {}
    diskCount = reversi.diskCount
    msg = geneW8EntryMsg(Object.keys(entryPL).length)
    server.emit('gameInfo', {
      board: board,
      msg: msg,
      diskCount: diskCount,
      turnColor: turnColor,
    })
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
        msg = geneW8EntryMsg(Object.keys(entryPL).length)
        console.log(msg)
        io.emit('gameInfo', { msg: msg })
      }
    }
    console.log('disconnect', socket.id)
  })
})

server.listen(PORT, () => console.log(`app listening on port ${PORT}`))
