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
      html += "<a href='#!'class='collection-item whisper'>" + data[i] + "<i class='material-icons'>chat_bubble</i></a>";
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
  
  socket.on("new message", function(data){
    var outputWithEmojis = emojione.shortnameToImage(data.msg);
    $("#chat").append("<span class='msg'><b>" + data.nick + ": </b>" + outputWithEmojis + "</span><br/>");
    $("#chat").animate({scrollTop: $("#chat")[0].scrollHeight}, 2000);
  });

  socket.on("whisper", function(data){
    var outputWithEmojis = emojione.shortnameToImage(data.msg);
    $("#chat").append("<span class='whisper'><b>" + data.nick + ": </b>" + outputWithEmojis + "</span><br/>");
    $("#chat").animate({scrollTop: $("#chat")[0].scrollHeight}, 2000);
  })

  $(".whisper").click(function(){
    alert('clicked');
  })
});
