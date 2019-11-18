const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)

const port = 3000

app.use(bodyParser.urlencoded({ extended: true }))
.use(express.static('public'))
.get('/', home)
http.listen(port, function(){
  console.log(`Museum app listening on port ${port}!`)})

function home(req, res) {
    res.render('index.html')
}
