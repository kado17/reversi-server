const express  = require("express");

const app = express();
const path = require('path');
const api = require('./api/reversi.js');
app.use('/api', api);

app.listen(8000, () => {
    console.log('Running at Port 8000...');
  });

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTION"
    )
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    next()
  })

  app.get("/", (req, res) =>{
    res.send('Hello World!');
    console.log("/ へアクセスがありました");
  });