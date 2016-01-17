var express = require("express");
var path = require("path");
// create the express app
var mongoose = require('mongoose');

var app = express();

var port = process.env.PORT || 3000

require('./server/config/mongoose.js')

var users = {};

var Chat = mongoose.model('Chat');

app.use(express.static(path.join(__dirname, './client')));

var server = app.listen(port, function() {
 console.log("listening on port %d", port);
})

var io = require('socket.io').listen(server)
// Whenever a connection event happens (the connection event is built in) run the following code
io.sockets.on('connection', function (socket) {
  var chatHistory = Chat.find({}).sort('-createdAt').limit(8).exec(function(err, msgs){
    if(err) throw err;
    socket.emit('load old msgs', msgs);
  })
  socket.on("new user", function (data, callback){
    // if (addedUser) return;
    if(data in users) {
      callback(false)
    } else {
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNicknames();
    }
  });

  function updateNicknames() {
    io.sockets.emit('usernames', Object.keys(users));
  }

  socket.on('send message', function(data, callback) {
    var msg = data.trim();
    if(msg.substr(0,3) === '/w '){
      msg =  msg.substr(3);
      var indexOfTheFirstSpace = msg.indexOf(' ');
      if(indexOfTheFirstSpace !== -1){
        // check if targeted whisper user exists
        var name = msg.substring(0, indexOfTheFirstSpace);
        var msg = msg.substring(indexOfTheFirstSpace + 1);
        if(name in users){
          users[name].emit('whisper', {msg: msg, nick: socket.nickname});
        } else {
          callback("Error!: Enter a valid user.");
        }
      } else {
        callback("Error! Please enter a message for your whisper.");
      }
    } else {
      var newMsg = new Chat({msg: msg, nick: socket.nickname});
      newMsg.save(function(err){
        if(err) throw err;
        io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
      })
    }
  })

  // socket.on('typing', function() {
  //   socket.broadcast.emit('typing', {
  //     nickname: socket.nickname
  //   });
  // });
  //
  // socket.on('stop typing', function() {
  //   socket.broadcast.emit('stop typing', {
  //     nickname: socket.nickname
  //   });
  // });

  socket.on('disconnect', function(){
    if(!socket.nickname) return;
    delete users[socket.nickname];
    updateNicknames();
  });
});
