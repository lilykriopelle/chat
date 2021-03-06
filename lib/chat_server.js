var guestNumber = 0;
var nicknames = {};
var currentRooms = {};
var names = [];

var socketio = require('socket.io');

var createChat = function(server) {
  var io = socketio.listen(server);

  io.on('connection', function (socket) {
    if (typeof nicknames[socket.id] === "undefined") {
      assignGuestNickname(socket, io);
    }

    joinRoom(socket, 'lobby');
    data = {
      success: true,
      message: 'lobby',
      socket_id: socket.id,
      user: nicknames[socket.id],
      rooms: activeRooms()
    };

    io.to('lobby').emit('usersChanged', { users: usersForRoom('lobby'), display_announcement: false });
    io.emit('roomChangeResult', data);

    handleMessages(socket, io);
    handleNameChanges(socket, io);
    handleUsersDisconnect(socket, io);
    handleRoomChangeRequest(socket, io);
    activeRooms();
  });
};

var usersForRoom = function(room) {
  var userIds = Object.keys(currentRooms).filter(function(socketId){
    return currentRooms[socketId] == room;
  });

  var users = userIds.map(function(userId) {
    return nicknames[userId];
  });

  return users.filter(Boolean);
};

Array.prototype.unique = function() {
  var unique = [];
  for (var i = 0; i < this.length; i++) {
    if (unique.indexOf(this[i]) == -1) {
        unique.push(this[i]);
    }
  }
  return unique;
};

var activeRooms = function () {
  rooms = ['lobby'];
  for (var key in currentRooms) {
    rooms = rooms.concat(currentRooms[key]);
  }
  return rooms.unique();
};

var handleRoomChangeRequest = function(socket, io) {
  socket.on('roomChangeRequest', function(room) {
    var oldRoom = currentRooms[socket.id];

    joinRoom(socket, room);

    data = {
      success: true,
      message: room,
      socket_id: socket.id,
      user: nicknames[socket.id],
      rooms: activeRooms()
    };

    io.to(oldRoom).emit('usersChanged', { users: usersForRoom(oldRoom), leaving: nicknames[socket.id], display_announcement: true });
    io.to(currentRooms[socket.id]).emit('usersChanged', { users: usersForRoom(currentRooms[socket.id]), display_announcement: false });
    io.to(currentRooms[socket.id]).emit('roomChangeResult', data);
  });
};

var joinRoom = function(socket, room) {
  socket.leave(currentRooms[socket.id]);
  socket.join(room);
  currentRooms[socket.id] = room;
};

var handleUsersDisconnect = function(socket, io) {
  socket.on('disconnect', function() {
    deleteUserName(socket);
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
    var previous = nicknames[socket.id];

    if (success) {
      deleteUserName(socket);
      nicknames[socket.id] = name;
      names.push(name);
    }

    data = {
      success: success,
      guestName: false,
      name: success ? name : "Invalid name",
      previous: previous
    };

    var room = currentRooms[socket.id];
    io.to(room).emit('usersChanged', { users: usersForRoom(room), display_announcement: false });
    io.to(room).emit('nameChangeResult', data);
  });
};


var handleMessages = function(socket, io) {
  socket.on('message', function (data) {
    data.author = nicknames[socket.id];
    data.socket_id = socket.id;
    io.to(currentRooms[socket.id]).emit('message', data);
  });
};

var assignGuestNickname = function(socket, io) {
  guestNumber++;
  var nickname = "guest" + guestNumber;
  nicknames[socket.id] = nickname;

  io.emit('nameChangeResult', {
    success: true,
    guestName: true,
    previous: nickname,
    name: nickname
  });
};

var validName = function(name) {
  if (names.indexOf(name) > -1) {
    return false;
  }
  return (name.substring(0,5) != "guest") || (isNaN(name.slice(5)));
};

module.exports = createChat;
