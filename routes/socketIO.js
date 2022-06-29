var app = require('../app')
var http = require('http')

//サーバーの立ち上げ
const server = http.createServer(app)
const reversi = require('../public/javascripts/reversi')
let board = reversi.board
let turnColor = reversi.turnColor
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
    io.to(socket.id).emit('board', { board: board, s: socket.id })
    //socket処理
    socket.on('putDisk', function (data) {
      const { x, y } = data
      const tmpBoard = reversi.PutDisk(x, y, turnColor, board)
      let msg = ''
      if (!tmpBoard.length || JSON.stringify(board) === JSON.stringify(tmpBoard)) {
        msg = 'そこにはおけません'
      } else {
        board = JSON.parse(JSON.stringify(tmpBoard))
        turnColor = reversi.colorChange(turnColor, board)
      }
      console.log({ board: board, x: x, y: y, msg: msg, t: turnColor })
      io.emit('board', { board: board, x: x, y: y, msg: msg })
    })

    socket.on('disconnect', () => {
      console.log('disconnect', socket.id)
    })
  })
}

//export
module.exports = { socketio: socketIO(), server: server, app: app }
