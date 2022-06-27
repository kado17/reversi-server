const express = require('express')
const router = express.Router()

const reversi = require('../public/javascripts/reversi')

let board = reversi.board
let turnColor = reversi.turnColor
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTION')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

router.get('/test', (req, res) => {
  res.json({
    board: board,
    turnColor: turnColor,
  })
})

router.post('/disk', (req, res) => {
  const { x, y } = req.body
  const tmpBoard = reversi.PutDisk(x, y, turnColor, board)
  let msg = ''
  turnColor = reversi.colorChange(turnColor, board)
  if (!tmpBoard.length || JSON.stringify(board) === JSON.stringify(tmpBoard)) {
    msg = 'そこにはおけません'
  } else {
    board = JSON.parse(JSON.stringify(tmpBoard))
  }
  res.json({ a: board, msg: msg, x: x, y: y })
})

module.exports = router
