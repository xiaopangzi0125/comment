var mongoose = require("mongoose");

var CommentSchema = mongoose.Schema({
	title:String,
	content :String,
	author :String,
	img:String
});

module.exports = CommentSchema;
