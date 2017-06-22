var mongoose = require("mongoose");
var CommentSchema = require("../schema/comment");

var Comment = mongoose.model("comment",CommentSchema);

module.exports = Comment;