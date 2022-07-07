var app = require('../app')
var http = require('http')

//サーバーの立ち上げ
const server = http.createServer(app)
const reversi = require('../public/javascripts/reversi')
let board = reversi.board
let turnColor = reversi.turnColor
let entryPL = []
let msg = ''
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
    io.to(socket.id).emit('gameInfo', { board: reversi.setPutableCoord(turnColor, board) })
    //socket処理

    socket.on('putDisk', function (data) {
      const { x, y } = data
      const newBoard = reversi.PutDisk(x, y, turnColor, board)
        const nextColor = reversi.colorChange(turnColor, newBoard)
        board = newBoard
        turnColor = nextColor
        const setPBoard = JSON.parse(JSON.stringify(reversi.setPutableCoord(nextColor, newBoard)))

        console.log({ board: board, x: x, y: y, t: nextColor })
        if (turnColor === 9) {
          io.emit('result', reversi.result(board))
          msg = '終了'
        }else{
          msg = `${reversi.conv[nextColor]}の手番です`
        }

        io.emit('gameInfo', { board: setPBoard, msg: msg })
    })

    socket.on('entry', () => {
      let returnData = { type: 'entry', isSuccses: false }
      console.log('entry:', socket.id)
      if (entryPL.length < 2 && !entryPL.includes(socket.id)) {
        entryPL.push(socket.id)
        returnData.isSuccses = true
      }
      io.to(socket.id).emit('btn_action_rep', returnData)
      console.log('EntryPL:', entryPL)
    })

    socket.on('disconnect', () => {
      console.log('s', socket.id)
      if (entryPL.includes(socket.id)) {
        entryPL = entryPL.filter((s) => s !== socket.id)
        console.log(entryPL)
      }
      console.log('disconnect', socket.id)
    })
  })
}

//export
module.exports = { socketio: socketIO(), server: server, app: app }
