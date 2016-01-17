emojione.ascii = true;
$(document).ready(function(){
  $("#chat").animate({scrollTop: $("#chat")[0].scrollHeight}, 2000);
  var socket = io.connect();
  $("#setNick").submit(function(e){
    e.preventDefault();
    socket.emit('new user', $('#nickname').val(), function(data){
      if(data) {
        $("#nickWrap").hide();
        $("#contentWrap").show();
      } else {
        $("#nickError").html('That username is already taken! Try again.');
      }
    });
    $("#nickname").val('');
  });

  socket.on('usernames', function(data){
    var html = "";
    for (var i = 0; i < data.length; i++) {
      html += "<a class='collection-item' alt='"+ data[i] +"'>" + data[i] + "<i class='material-icons'>chat_bubble</i></a>";
    }
    $("#users").html(html);
  });

  $("#send-message").submit(function(e){
    e.preventDefault();
    socket.emit('send message', $("#message").val(), function(data){
      $("#chat").append("<span class='error'><b>" + data + "</span><br/>");
    });
    $("#message").val('');
  });

  socket.on('load old msgs', function(msgs){
    for(var i = msgs.length - 1; i >= 0; i--){
      displayMsg(msgs[i]);
    }
  })

  socket.on("new message", function(data){
    displayMsg(data);
    $("#chat").animate({scrollTop: $("#chat")[0].scrollHeight}, 2000);
  });

  socket.on("whisper", function(data){
    var outputWithEmojis = emojione.shortnameToImage(data.msg);
    $("#chat").append("<span class='whisper'><b>" + data.nick + ": </b>" + outputWithEmojis + "</span><br/>");
    $("#chat").animate({scrollTop: $("#chat")[0].scrollHeight}, 2000);
  })

  $("body").on('click', '.collection-item', function(){
    var name = $(this).attr('alt')
    $("#message").val('/w ' + name + ' ');
  })

  function displayMsg(data){
    var outputWithEmojis = emojione.shortnameToImage(data.msg);
    $("#chat").append("<span class='msg'><b>" + data.nick + ": </b>" + outputWithEmojis + "</span><br/>");
  }
});
