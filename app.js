var express=  require('express'),
    http = require('http'),
    path = require('path');

var bodyParser=require('body-parser'),
    cookieParser= require('cookie-parser'),
    static =  require('serve-static'),
    errorHandler =require('errorhandler');

var expressSession = require('express-session');

var app =express();

var authUser =function(id,pwd,callback){
//	console.log(‘auth USER’);
}

app.set('port',process.env.PORT||9000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

var router = express.Router();
router.route('/process/login').post(function(req,res){
    console.log('/process/login called');
});

app.use('/',router);
app.all('/',function(req,res){
   res.redirect('/index'); 
});

http.createServer(app).listen(app.get('port'),function(){
   console.log('server started on '+app.get('port'));
});
