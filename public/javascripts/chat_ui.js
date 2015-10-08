(function() {

  var App = window.App = (window.App || {});

  var ChatUI = App.ChatUI = function(chat) {
    this.chat = chat;
    this.$messageInput = $(".message-input");
    this.$messageList = $(".messages");
    this.$currentUser = $(".current-user");
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
        this.$currentUser .text(data.message);
      }
    }.bind(this));

    this.chat.socket.on("error", function(error) {
      this.$errors.text(error);
    }.bind(this));

    this.chat.socket.on("renderUsers", function(data){
      this.displayUsers(data);
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
      this.chat.sendMessage(text);
      this.$messageInput.val("");
    }
  };

  ChatUI.prototype.displayUsers = function(users) {
    this.$users.text(users);
  };

  ChatUI.prototype.displayMessage = function(data) {
    var $li = $("<li>").text(data.text + " -- " + data.author);
    this.$messageList.append($li);
  };

  ChatUI.prototype.handleNameChange = function(name) {
    this.chat.changeName(name);
  };

})();
