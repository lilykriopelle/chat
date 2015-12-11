(function() {

  var App = window.App = (window.App || {});

  var Chat = App.Chat = function(socket) {
    this.socket = socket;
  };

  Chat.prototype.processCommand = function(command, arg) {
    if (command == "name") {
      this.changeName(arg);
    } else if (command == "join") {
      this.changeRoom(arg);
    }else {
      this.socket.emit('error', 'Unrecognized command');
    }
  };

  Chat.prototype.sendMessage = function(text) {
    this.socket.emit('message', { text: text });
  };

  Chat.prototype.changeName = function(name) {
    this.socket.emit('nameChangeRequest', name);
  };

  Chat.prototype.changeRoom = function(room) {
    this.socket.emit('roomChangeRequest', room);
  };

})();
