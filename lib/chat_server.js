var guestNumber = 0;
var nicknames = {};

var createChat = function(server) {
  var io = socketio.listen(server);

  assignGuestNickname(io);

  io.on('connection', function (socket) {
    handleMessages(socket, io);
    handleNameChanges(socket, io);
  });

};

var handleNameChanges = function(socket, io) {
  socket.on('nameChangeRequest', function(data) {
    data = {
      success: validName(data),
      message: validName(data) ? data : "Invalid name"
    }

    io.emit('nameChangeResult', data);
  });
};

var handleMessages = function(socket, io) {
  socket.on('message', function (data) {
    io.emit('message', { text: data });
  });
};

var assignGuestNickname = function(io) {
  guestNumber++;
  var nickname = "guest" + guestNumber;
  nicknames[socket.id] = nickname

  io.emit('nameChangeResult', {
    success: true,
    message: nickname
  });
};

var validName = function(name) {
  for (var key in nicknames) {
    if (name == nicknames[key]) {
      return false;
    }
  }
  return (name.substring(0,5) != "guest") || (isNaN(name.slice(5)));
};

module.exports = createChat;
