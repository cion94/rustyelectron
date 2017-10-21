var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");

var app = express()

var port = process.env.PORT || 8000; 

app.use(bodyParser.json())
app.use(express.static('public'))


app.get("/", function(req, res){
    fs.readFile("private/htmls/index.html", function(err, buff){
        if(err){
            console.log(err);
        }
        else {
            res.send(buff.toString());
        }
    });
});

app.listen(port);

