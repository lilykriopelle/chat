(function() {

  var App = window.App = (window.App || {});

  var Chat = App.Chat = function(socket) {
    this.socket = socket;
  }

  Chat.prototype.sendMessage = function(text) {
    this.socket.emit('message', { text: text });
  }

  Chat.prototype.changeName = function(name) {
    this.socket.emit('nameChangeRequest', name);
  }

})();
