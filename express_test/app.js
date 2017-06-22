var express = require("express");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var session = require("express-session");
var mongoose = require("mongoose");

var app = express();

var User = require("./model/user");

mongoose.connect("mongodb://127.0.0.1:27017/1702demo");

var db = mongoose.connection;

db.on("open",function(){
	console.log("数据库连接成功");
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true;
}))

app.use(session({
	secret :"1702demo",
	maxAge : 60000
}))

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
	res.render("register");
})

app.get("/comment",function(req,res){
	var username = req.session.username;
	res.render("comment",{username:username});
})

app.post("/login",function(req,res){
	User.find({"username":req.body.username},function(err,doc){
		if(err){
			res.json({code:1,msg:"登录失败"});
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
		pwd:user.pwd
	});
	
	u.save(function(err,doc){
		if(err){
			res.json({code:1,msg:"保存失败"});
			return;
		}
		
		res.json({code:0,msg:"保存成功"});
	})
})

app.listen(8090,function(){
	console.log("连接成功");
})




