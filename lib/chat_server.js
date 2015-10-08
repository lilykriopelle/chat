var guestNumber = 0;
var nicknames = {};
var names = [];

var socketio = require('socket.io');

var createChat = function(server) {
  var io = socketio.listen(server);

  io.on('connection', function (socket) {
    if (nicknames[socket.id] == null) {
      assignGuestNickname(socket, io);
    }
    handleUsersDisplay(socket, io);
    handleMessages(socket, io);
    handleNameChanges(socket, io);
  });
};

var handleUsersDisplay = function(socket, io) {
  socket.on('connect disconnect', function() {
    io.emit('renderUsers', function() {
      text: Object.keys(nicknames).map(function(k){return nicknames[k]}).join(", ");
    })
    delete nicknames[socket.id]
  });
};

var handleNameChanges = function(socket, io) {
  socket.on('nameChangeRequest', function(name) {
    var success = validName(name);
    if (success) {
      var previousName =  nicknames[socket.id];
      delete nicknames[socket.id];
      delete names.splice(names.indexOf(previousName), 1);

      nicknames[socket.id] = name;
      names.push(name);
    }

    data = {
      success: success,
      message: success ? name : "Invalid name"
    }

    io.emit('nameChangeResult', data);
  });
};

var handleMessages = function(socket, io) {
  socket.on('message', function (data) {
    data.author = nicknames[socket.id]
    io.emit('message', data);
  });
};

var assignGuestNickname = function(socket, io) {
  guestNumber++;
  var nickname = "guest" + guestNumber;
  nicknames[socket.id] = nickname

  io.emit('nameChangeResult', {
    success: true,
    message: nickname
  });
};

var validName = function(name) {
  if (names.indexOf(name) > -1) {
    return false;
  }
  return (name.substring(0,5) != "guest") || (isNaN(name.slice(5)));
};

module.exports = createChat;
