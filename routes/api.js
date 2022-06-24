const express = require('express')
const router = express.Router()

const reversi = require('../public/javascripts/reversi')

let board = reversi.board
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTION'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

router.get('/test', function (req, res) {
  board = reversi.boardInit()
  res.json({
    board: board,
  })
})

router.post('/disk', function (req, res) {
  let { x, y } = req.body
  let a = reversi.PutDisk(x,y,0,board)
  console.log(a)
  if (a.length)board = a
  res.json({ a: board, x: x, y: y })
})

module.exports = router
