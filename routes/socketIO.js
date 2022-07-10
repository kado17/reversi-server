var app = require('../app')
var http = require('http')

//サーバーの立ち上げ
const server = http.createServer(app)
const reversi = require('../public/javascripts/reversi')
let board = reversi.board
let turnColor = reversi.turnColor
let entryPL = {}
const entryPLKey = ['white', 'black']
let isPlaying = false
let diskCount = reversi.diskCount

const geneW8EntryMsg = (num) => `参加者募集中 現在${num}/2`
const geneTurnPlayerMsg = (num) => `${reversi.conv[num]}の手番です`
//const geneResult = ()

let msg = geneW8EntryMsg(Object.keys(entryPL).length)
//サーバーをlistenしてsocketIOを設定
var io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

//socketIOモジュール
function socketIO() {
  //socket処理を記載する
  io.on('connection', function (socket) {
    console.log(socket.id, '接続!')
    io.to(socket.id).emit('gameInfo', {
      board: isPlaying ? reversi.setPutableCoord(turnColor,board) : board,
      msg: msg,
      diskCount:diskCount,
      isPlaying: isPlaying,
    })
    //socket処理

    socket.on('putDisk', function (data) {
      const { x, y } = data
      const newBoard = reversi.PutDisk(x, y, turnColor, board)
      const nextColor = reversi.colorChange(turnColor, newBoard)
      board = newBoard
      turnColor = nextColor
      const {whiteCount, blackCount} = reversi.getDiskCount(board)
      diskCount.whiteCount = whiteCount
      diskCount.blackCount = blackCount
      const setPBoard = reversi.setPutableCoord(nextColor, newBoard)
      console.log({ board: board, x: x, y: y, t: nextColor })
      if (turnColor === 9) {
        const result = reversi.gameOver(board)
        io.emit('gameOver', {result:result})
        msg = result.winner
      } else {
        msg = geneTurnPlayerMsg(nextColor)
      }

      io.emit('gameInfo', { board: setPBoard, msg: msg,diskCount:diskCount,turnColor:entryPLKey[turnColor] })
    })

    socket.on('entry', () => {
      let returnData = { type: 'entry', isSuccses: false }
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

    socket.on('disconnect', () => {
      console.log('s', socket.id)
      if (Object.values(entryPL).includes(socket.id)) {
        const delKey = Object.keys(entryPL).reduce(function (r, k) {
          return entryPL[k] === socket.id ? k : r
        }, null)
        delete entryPL[delKey]
        console.log(entryPL, delKey)
        msg = geneW8EntryMsg(Object.keys(entryPL).length)
        console.log(msg)
        io.emit('gameInfo', { msg: msg })
      }
      console.log('disconnect', socket.id)
    })
  })
}

//export
module.exports = { socketio: socketIO(), server: server, app: app }
