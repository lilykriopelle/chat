(function() {

  var App = window.App = (window.App || {});

  var ChatUI = App.ChatUI = function(chat) {
    this.chat = chat;
    this.$messageInput = $(".message-input");
    this.$messageList = $(".messages");
    this.$currentUser = $(".current-user");
    $(document).ready(this.bindHandlers.bind(this));
  };

  ChatUI.prototype.bindHandlers = function() {
    $(".send-message").on("submit", function(event){
      event.preventDefault();
      this.handleInput();
    }.bind(this));

    this.chat.socket.on("message", function(data) {
      this.displayMessage(data.text)
    }.bind(this));

    this.chat.socket.on("nameChangeResult", function(data){
      $(".current-user").text(data.message);
    });
  }

   ChatUI.prototype.handleInput = function() {
    var text = this.$messageInput.val();
    if (text[0] == "/") {
      var command = text.slice(1).split(" ")[0];
      var arg = text.slice(1).split(" ")[1];
      if (command == "nick") {
        this.handleNameChange(arg);
      }
    } else {
      this.chat.sendMessage(text);
      this.$messageInput.val("");
    }
  };

  ChatUI.prototype.displayMessage = function(message) {
    var $li = $("<li>").text(message.text);
    this.$messageList.append($li);
  };

  ChatUI.prototype.handleNameChange = function(name) {
    this.chat.changeName(name);
  }


})();
