var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
var port = process.env.PORT || 5000;
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({'extended':true}));


function apiPost(path, body, _cb, auth){
    var options = {
        url:'http://rustyatom2.azurewebsites.net/'+path,
        method:'POST',
        headers:{'Content-type':'application/json'},
        form: JSON.stringify(body)
    };

    if(auth)
        options.headers.Authorization = 'Bearer '+auth;

    request(options,function(err, response, body){
        if(err)
            _cb(err)
        else
            _cb(null,body)
    });
}

function apiGet(path, _cb, auth){
    var options = {
        url:'http://rustyatom2.azurewebsites.net/'+path,
        method:'GET',
        headers:{'Content-type':'application/json'},
    };

    if(auth)
        options.headers.Authorization = 'Bearer '+auth;

    request(options,function(err, response, body){
        if(err)
            _cb(err)
        else
            _cb(null,body)
    });
}

function createDashboard(_cb){
    res.redirect("/index");
}  

app.post('/createTask',function(req, res){
    req.body.project_id= parseInt(req.body.project_id);
    req.body.status = parseInt(req.body.status);
    req.body.assigned_to = parseInt(req.body.assigned_to);
    apiPost('/project/'+req.body.project_id+'/task',req.body,function(err,data){
        res.send(data);
    }, req.cookies.token);
});

app.post('/move', function(req, res){
    apiPost('/task/'+req.body.id,{
        assigned_to: parseInt(req.body.assigned_to),
        status: parseInt(req.body.status)
    },function(err, data){
    },req.cookies.token);
});

app.get("/", function(req, res){
    if (req.cookies.token)
        res.redirect('/index')
    else
        res.render("login");
});

app.get("/index", function(req, res){
    if (req.cookies.token){
        apiGet("/teams",function(err, teams){
                if(!err){
                    res.render("index", {teams : JSON.parse(teams)});
                }
            }, req.cookies.token
        )
    }
    else {
        res.redirect('/');
    }
});

app.post("/projectsByTeam", function(req, res){
    if(req.cookies.token){
        id = req.body.id
        apiGet("/team/"+id+"/projects", function(err, data){
            res.send( JSON.parse(data));
        }, req.cookies.token )
    }else{
        res.redirect('/');
    }
});

app.post("/tasksByProject",function(req, res){
    if(req.cookies.token){
        id = req.body.id;
        apiGet("/project/"+id+"/tasks", function(err, data){
            res.send(JSON.parse(data));
        }, req.cookies.token);
    }
    else{
        res.redirect('/');
    }
});

app.get("/chat", function(req, res){
    if (req.cookies.token){
        apiGet("/teams",function(err, teams){
                if(!err){
                    res.render("chat", {teams : JSON.parse(teams)});
                }
            }, req.cookies.token
        )
    }
    else {
        res.redirect('/');
    }
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post('/login',function(req, res){
    apiPost('token', req.body, function(err, body){
        if(body.indexOf('<html>')==-1){
            body = JSON.parse(body)
            if(!body.token){
                res.redirect('/');
            }
            else{
                res.cookie('token', body.token, {maxAge:1000*60*15});
                res.redirect('/index');
            }
        }
        else{
            res.redirect('/');
        }
    });
});

app.post("/logout", function(req, res){
    res.render("head");
});

app.get('/teams', function(req, res){
        apiGet('/teams', function(err, body){
            if(body){
                console.log(body);
                // res.render("index", {teams : body});
            }
            else{
                res.render("/login");
            }
        }, req.cookies.token);
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

var online_users = {
    '#global': '#General'
}

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id)
  // online_users[socket.id] = 1

  // io.emit('update online', JSON.stringify(online_users));

  socket.on('add user', function(msg){
    var buff = Buffer.from(msg, 'base64').toString();
    var json = buff.split('}')[1];
    json += '}';
    data = JSON.parse(json);
    username = data.user;

    online_users[socket.id] = username;
    io.emit('update online', JSON.stringify(online_users));
    console.log(username)
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);

    socket.broadcast.emit('chat message', {'msg': msg, 'user': online_users[socket.id]});
  });

  socket.on('send pm', function(payload){
    sid = payload['user']
    msg = payload['msg']
    socket.to(sid).emit('get pm', {'user': online_users[socket.id], 'msg': msg});
  });

  socket.on('start chat', function(msg){
    console.log(msg);
  });

  /*socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });*/

  socket.on('disconnect', function(){
    console.log('user disconnected');
    delete online_users[socket.id]
    io.emit('update online', JSON.stringify(online_users))
  });

});
