var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var app = express();
var port = process.env.PORT || 5000;

app.use(express.static('public'))
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get("/", function(req, res){
    res.render("login");
});

app.get("/index", function(req, res){
    res.render("index");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/chat", function(req, res){
    res.render("chat")
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/login", function(req, res){

});

app.post("/logout", function(req, res){
    res.render("head");
});


const server = app.listen(port, function(err){
    if(err){
        console.log("[ERR]Could not listen on " + port, err)
    }
    else{
        console.log("Listening on port " + port);
    }
});

const io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    socket.broadcast.emit('chat message', msg);
  });

  /*socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });*/

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

