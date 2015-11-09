var guestNumber = 0;
var nicknames = {};
var currentRooms = {};
var names = [];
var currentRooms = {};

var socketio = require('socket.io');

var createChat = function(server) {
  var io = socketio.listen(server);

  io.on('connection', function (socket) {
    currentRooms[socket.id] = "lobby";
    socket.join("lobby");
    io.emit('roomChangeResult', {success: true, message: 'lobby'});

    if (typeof nicknames[socket.id] === "undefined") {
      assignGuestNickname(socket, io);
    }
    handleUsersDisplay(socket, io);
    handleMessages(socket, io);
    handleNameChanges(socket, io);
    handleUsersDisconnect(socket, io);
    handleRoomChangeRequest(socket, io);
  });
};

var handleRoomChangeRequest = function(socket, io) {
  socket.on('roomChangeRequest', function(room) {
    currentRooms[socket.id] = room;
    data = {
      success: true,
      message: room
    };
    socket.join(room);
    io.emit('roomChangeResult', data);
  });
};

var handleUsersDisconnect = function(socket, io) {
  socket.on('disconnect', function() {
    deleteUserName(socket);
  });
};

var handleUsersDisplay = function(socket, io) {
  io.on('connection disconnect', function() {
    io.emit('renderUsers', function() {
      text: Object.keys(nicknames).map(function(k){return nicknames[k]}).join(", ");
    });
  });
};

var deleteUserName = function(socket) {
  var previousName =  nicknames[socket.id];
  delete nicknames[socket.id];
  names = names.splice(names.indexOf(previousName) + 1, 1);
};

var handleNameChanges = function(socket, io) {
  socket.on('nameChangeRequest', function(name) {
    var success = validName(name);
    if (success) {
      deleteUserName(socket);
      nicknames[socket.id] = name;
      names.push(name);
    }

    data = {
      success: success,
      message: success ? name : "Invalid name"
    };

    console.log(currentRooms[socket.id]);
    io.to(currentRooms[socket.id]).emit('nameChangeResult', data);
  });
};

var joinRoom = function(socket, room) {
  socket.leave(currentRooms[socket.id]);
  socket.join(room);
  currentRooms[socket.id] = room;
};

var handleMessages = function(socket, io) {
  socket.on('message', function (data) {
    data.author = nicknames[socket.id];
    io.emit('message', data);
  });
};

var assignGuestNickname = function(socket, io) {
  guestNumber++;
  var nickname = "guest" + guestNumber;
  nicknames[socket.id] = nickname;

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
