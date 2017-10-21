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


app.post("/login", function(req, res){

});

app.post("/logout", function(req, res){
    res.render("head");
});

app.listen(port, function(err){
    if(err){
        console.log("[ERR]Could not listen on " + port, err)
    }
    else{
        console.log("Listening on port " + port);
    }
});

