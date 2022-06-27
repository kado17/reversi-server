var app = require('../app')
var http = require('http')

//サーバーの立ち上げ
const server = http.createServer(app)

//サーバーをlistenしてsocketIOを設定
var io = require('socket.io')(server)

//socketIOモジュール
function socketIO() {
  //socket処理を記載する
  io.on('connection', function (socket) {
    //socket処理
    socket.on('socketName', function (data) {
      console.log(data)
      io.sockets.emit('socketName2', data)
    })
  })
}

//export
module.exports = { socketio: socketIO(), server: server, app: app }
