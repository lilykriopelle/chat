(function() {

  var App = window.App = (window.App || {});

  var ChatUI = App.ChatUI = function(chat) {
    this.chat = chat;
    this.$messageInput = $(".message-input");
    this.$messageList = $(".messages");
    this.$currentRoom = $(".current-room");
    this.$users = $(".users");
    this.$errors = $(".errors");
    this.$roomsList = $(".rooms-list");
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
      if (data.display_announcement) {
        var $li = $("<li>")
        .text(data.leaving + " has left the room")
        .addClass('announcement');
        this.$messageList.append($li);
      }
    }.bind(this));

    this.chat.socket.on("roomChangeResult", function(data){
      if (data.success) {
        this.$roomsList.empty();
        data.rooms.forEach(function(room){
          if (room === null || room === "") {
            return true;
          }
          var $room = $("<li>").addClass("room");
          var $a = $("<a>").text(room);
          this.$roomsList.append($room.append($a));
        }.bind(this));
        if (data.socket_id == this.chat.socket.id) {
          this.$currentRoom.text(data.message);
          this.$messageList.empty();
        } else {
          var $li = $("<li>")
            .text(data.user + " has entered the room")
            .addClass('announcement');
          this.$messageList.append($li);
        }
      }
    }.bind(this));

    this.chat.socket.on("error", function(error) {
      this.$errors.text(error);
    }.bind(this));

    $(".rooms-list").on("click", function(event) {
      if (event.target.text !== undefined && event.target.text !== this.$currentRoom.text()) {
        this.chat.changeRoom(event.target.text);
      }
    }.bind(this));

    $(".rooms-panel").click(function(e) {
      if ($(e.target).hasClass("add-room")) {
        var $roomForm = $("<form>").addClass("room-form").append($('<input type="text">').addClass("new-room"));
        $(".rooms-panel").find(".add-room").replaceWith($roomForm);
        $roomForm.find("input").focus();
      }
    }.bind(this));

    $(".rooms-panel").on("submit", function(e) {
      e.preventDefault();
      var roomName = $(e.target).find(".new-room").val();
      this.chat.changeRoom(roomName);
      $(e.target).find(".new-room").replaceWith($("<button>").text("+").addClass("add-room"));4
    }.bind(this));

    $(document).on("focusout", function(e) {
      if ($(e.target).hasClass("new-room")) {
        $(e.target).replaceWith($("<button>").text("+").addClass("add-room"));
      }
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
    if (data.socket_id == this.chat.socket.id) {
      $li.addClass("left");
    } else {
      $li.addClass("right");
    }
    this.$messageList.append($li);
  };

  ChatUI.prototype.handleNameChange = function(name) {
    this.chat.changeName(name);
  };

})();
