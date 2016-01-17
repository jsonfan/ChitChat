var mongoose = require('mongoose');

var ChatSchema = mongoose.Schema({
  nick: String,
  msg: String,
  createdAt: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Chat', ChatSchema);
