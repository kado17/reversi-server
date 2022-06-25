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
  let { x, y } = req.body
  let a = reversi.PutDisk(x, y, turnColor, board)
  turnColor = reversi.colorChange(turnColor)
  if (a.length) board = JSON.parse(JSON.stringify(a))
  res.json({ a: board, x: x, y: y })
})

module.exports = router
