(function() {

  var App = window.App = (window.App || {});

  var ChatUI = App.ChatUI = function(chat) {
    this.chat = chat;
    this.$messageInput = $(".message-input");
    this.$messageList = $(".messages");
    this.$currentRoom = $(".current-room");
    this.$users = $(".users");
    this.$errors = $(".errors");
    $(document).ready(this.bindHandlers.bind(this));
  };

  ChatUI.prototype.bindHandlers = function() {
    $(".send-message").on("submit", function(event){
      event.preventDefault();
      this.handleInput();
    }.bind(this));

    this.chat.socket.on("message", function(data) {
      this.displayMessage(data);
    }.bind(this));

    this.chat.socket.on("nameChangeResult", function(data){
      if (data.success) {
        if (!data.guestName) {
          var $li = $("<li>")
            .text(data.previous + " changed name to " + data.name)
            .addClass('announcement');
          this.$messageList.append($li);
        }
      }
    }.bind(this));

    this.chat.socket.on('usersChanged', function(data) {
      this.displayUsers(data.users);
    }.bind(this));

    this.chat.socket.on("roomChangeResult", function(data){
      if (data.success) {
        if (data.socket_id == this.chat.socket.id) {
          this.$currentRoom.text(data.message);
          this.$messageList.empty();
        }
      }
    }.bind(this));

    this.chat.socket.on("error", function(error) {
      this.$errors.text(error);
    }.bind(this));
  };

  ChatUI.prototype.handleInput = function() {
    this.$errors.text("");
    var text = this.$messageInput.val();
    if (text[0] == "/") {
      var command = text.slice(1).split(" ")[0];
      var arg = text.slice(1).split(" ")[1];
      this.chat.processCommand(command, arg);
    } else {
      if (text !== "") {
        this.chat.sendMessage(text);
      }
    }
    this.$messageInput.val("");
  };

  ChatUI.prototype.displayUsers = function(users) {
    this.$users.text(users.join(", "));
  };

  ChatUI.prototype.displayMessage = function(data) {
    var $p = $("<p>");
    var $str = $("<strong>").text(data.author + ": ");
    $p.append($str).append(data.text);
    var $li = $("<li>").append($p);
    this.$messageList.append($li);
  };

  ChatUI.prototype.handleNameChange = function(name) {
    this.chat.changeName(name);
  };

})();
