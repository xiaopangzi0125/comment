var express = require("express");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var session = require("express-session");
var mongoose = require("mongoose");

var app = express();

var User = require("./model/user");
var Comment = require("./model/comment");

var upload = require("./util/upload");

mongoose.connect("mongodb://127.0.0.1:27017/1702demo");

var db = mongoose.connection;

db.on("open",function(){
	console.log("数据库链接成功");
});

app.use(session({
	cookie:{maxAge: 60000},
	secret:"1702democt",
	maxAge : 60000
}));

app.use(express.static("uploadcache"));
app.use(express.static("static"));

app.set("views","./views");
app.engine(".html",ejs.__express);
app.set("view engine","html");

app.get("/",function(req,res){
	res.send("hello pz");
})

app.get("/login",function(req,res){
	if(req.session.username){
		res.redirect("/comment");
		return;
	};
	res.render("login");
})

app.get("/register",function(req,res){
	res.render("/register");
})

app.get("/comment",function(req,res){
	if(!req.session.username){
		res.redirect("/login");
		return;
	};
	
	Comment.find({},function(err,doc){
		if(err){
			return;
		}
		
		var username = req.session.username;
		res.render("comment",{username:username,list:doc})
	})
})

app.post("/login",function(req,res){
	User.find({"username":req.body.username},function(err,doc){
		if(err){
			res.json({code:1,msg:"登陆失败"});
		}
		
		if(doc.length === 1){
			req.session.username = doc[0].username;
			res.redirect("/comment");
		}else{
			res.json({code:1,msg:"用户不存在"});
		}
	})
})

app.post("/register",function(req,res){
	var user = req.body;
	var u = new User({
		username:user.username,
		pwd : user.pwd
	});
	
	u.save(function(err,doc){
		if(err){
			res.json({code:1,msg:"保存失败"});
			return;
		};
		res.json({code:0,msg:"保存成功"});
	})
})

app.post("/api/comment",function(req,res){
	var c = new Comment({
		title:req.body.title,
		content:req.body.content,
		author:req.body.author,
		img:req.body.img
	});
	
	c.save(function(err,doc){
		if(err){
			res.json({msg:"保存失败"});
			return;
		};
		
		res.json({msg:"保存成功",code:0})
	})
})

app.post("/api/upload",function(req,res){
	upload.upload(req,res);
});

app.listen(8090,function(){
	console.log("连接成功");
})



















