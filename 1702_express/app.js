var express  = require("express"); //导入express库
var bodyParser = require("body-parser"); //导入处理post请求的中间件
var ejs = require('ejs');
var session = require("express-session"); //导入session中间件，利用前端的cookie技术，保存数据在后台
var mongoose = require("mongoose"); //导入联系mongodb的第三方库

var app = express(); //创建exress的实例

//User

var User = require('./model/user');
var Comment = require('./model/comment');

var upload = require("./util/upload");

mongoose.connect('mongodb://127.0.0.1:27017/1702mongo'); //mongodb:// 表示链接mongodb的协议
//j紧跟着是链接的域名加端口，再接着就是 数据库的名称

//使用这个中间件 放置到 自定义处理函数的前面
var db = mongoose.connection; //返回当前的链接数据对象


db.on('open', function() {
   console.log("数据库链接成功！")
});

app.use(bodyParser.json()) //use专门使用中间件的方法
app.use(bodyParser.urlencoded({ //使用url编码来处理form表单提交的post请求
   extended: true
}))

app.use(session({ 
	cookie: { maxAge: 6000 },
    secret:"1702demo" ,//用来生成session 表示的 字符串
    maxAge:60000 //如果当中这个登陆用户 在60000以内不发任何请求 这个session就失效
}))

// 指定静态资源的目录

app.use(express.static('uploadcache'));

app.use(express.static('static'));

//设置后台的模板目录
app.set("views",'./views') //views的意思设置模板位置,第二个参数的模板的文件夹
app.engine('.html',ejs.__express); //让ejs来解析.html后缀的文件
app.set("view engine","html") //设置模板的后缀为html

app.get('/',function(req,res){ //创建一个路由，处理 "/" 路径的前端请求 
    res.send("最好不要迟到！"); //发送一段字符到前端
})

//返回login页面

app.get('/login',function(req,res){
	if (req.session.username) { // 保存登陆态！
		res.redirect('/comment');
		return
	};
    res.render('login') //渲染并发送给前端
})

app.get('/register',function(req,res){
    res.render('register') //渲染并发送给前端
})

app.get('/comment',function(req,res){

    //只有登陆过后才能进入

    if (!req.session.username) {
        res.redirect('/login');
        return
    };
    //首次加载的评论列表

    Comment.find({},function(err,doc){
        if (err) {
        	return 
        };
	   var username = req.session.username
       res.render('comment',{username:username,list:doc}) //渲染并发送给前端

    })


})

app.post('/login',function(req,res){ //处理登陆的post请求
   // console.log(req.body); 拿到数据后，做自己的操作了 
    //查询是否存在这个人

    User.find({"username":req.body.username},function(err,doc){
        if (err) {
        	res.json({code:1,msg:"登陆失败"});
        };
        //console.log(doc)
        if (doc.length == 1) {  
            req.session.username = doc[0].username; //把username存储到session里面
            //res.json({code:0,msg:"登陆成功"});
            //使用session 
            res.redirect('/comment');
        }else{
        	res.json({code:1,msg:"用户不存在"}); 
        };

    })

  //给前端相应一个json对象回去
})


app.post('/register',function(req,res){ //处理登陆的post请求
  
   // 做数据库的操作了
    var user = req.body;
    
    //数据的存储
   
    var u = new User({ //new 一个 user的实例出来
    	username:user.username,
    	pwd:user.pwd
    });
    //防止重复 ，保存之前要查询一次

    u.save(function(err,doc){ //使用实例 u 的save方法 来执行数据的保存	
    	if (err) {
    		res.json({code:1,msg:"保存失败！"});
    		return
    	};
        //res.redirect("/login"); //重定向
        res.json({code:0,msg:"保存成功"}); //给前端相应一个json对象回去
    })
   
})

//处理保存评论

app.post("/api/comment",function(req,res){
    //var {title,content} = req.body ; //结构

    var c = new Comment({
        title:req.body.title,
        content:req.body.content,
        author:req.body.author,
        img:req.body.img
    });

    c.save(function(err,doc){
        if (err) {
        	res.json({msg:"保存失败！"});
        	return
        };

        res.json({msg:"保存成功！",code:0})
    })
})

//处理图片上传

app.post('/api/upload',function(req,res) {
	upload.upload(req,res);
});

app.listen(8090,function(){
	console.log("连接成功！")
}); //设置监听的端口