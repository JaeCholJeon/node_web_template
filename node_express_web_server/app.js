var express = require('express'),
    http = require('http'),
    path = require('path');
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler'),
    fs = require('fs');

var board = require('./board');
var open_home = require('./open_home/open_home');
var mysql = require('mysql');
var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');
var app = express();

var pool = mysql.createPool({
    coonectionLimit: 10,
    host: 'localhost',
    user: 'root',
    database: 'open_server_database',
    password: 'sorkchlrh1!Q',
    debug: false
});

var webpush = require('web-push');

// VAPID keys should only be generated only once.


webpush.setGCMAPIKey('AIzaSyAaFpzkYM9tO-vxg-1AKEOyQN24a_ZaTQk');
var vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
    'mailto:localhost:80',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

var pushSubscription = {
    endpoint: 'http://localhost:9000/index',
    keys: {
        auth: '.....',
        p256dh: '.....'
    }
};
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/open_home_resource', express.static(__dirname + '/public/open_home'));
app.use('/css', express.static(__dirname + '/public/css'));

app.use('/js', express.static(__dirname + '/public/js'));
app.use('/vendor', express.static(__dirname + '/public/vendor'));
app.use('/scss', express.static(__dirname + '/public/scss'));
app.use('/img', express.static(__dirname + '/public/img'));

app.set('port', process.env.PORT || 80);
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use('/public', static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(expressSession({
    key: 'jeon_id',
    secret: 'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave: false,
    saveUninitialized: true
}));

var authUser = function (id, password, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }
        var columns = ['member_id', 'member_name', 'auth'];
        var tablename = 'member';
        var exec = conn.query("select ?? from member where member_id = ? and member_pwd =?", [columns, id, password], function (err, rows) {
            conn.release();

            if (rows.length > 0) {
                callback(null, rows);
            } else {
                callback(null, null);
            }
        });
    });
}

var adduser = function (id, password, real_name, user_name, student_id, phone, blog, email, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }

        var data = {
            member_id: id,
            member_name: real_name,
            member_user_name: user_name,
            member_pwd: password,
            student_id: student_id,
            phone: phone,
            blog: blog,
            email: email,
            auth: 3
        };
        var exec = conn.query('insert into member set ?; ', data, function (err, result) {
            conn.release();

            if (err) {
                callback(err, all);
            }
            callback(null, result);
        });
    });
}

app.post('/process/login', function (req, res) {
    var paramId = req.param('id');
    var password = req.param('password');
    if (pool) {
        authUser(paramId, password, function (err, rows) {
            if (err) {
                res.writeHead('200', {
                    'content-type': 'text/html;charset = utf-8'
                });
                res.write("<h1>error</h1>");
                res.end();
                return;
            }

            if (rows) {
                if (rows[0].auth == 3) {
                    res.send('<script type="text/javascript">alert("가입 완료 관리자 승인 후 사용 가능합니다~!");</script><script type="text/javascript"> location.href="/process/login_page"; </script>');
                    return;
                } else {
                    req.session.user = {
                        id: paramId,
                        password: password,
                        name: rows[0].member_name,
                     //   auth = rows[0].auth,
                        authorized: true
                    };
                    res.redirect('/open_home');
                }
            } else {
                res.send('<script type="text/javascript">alert("Please Check Username or Password");</script><script type="text/javascript"> location.href="/process/login_page"; </script>');
            }
        })
    }
});

app.get('/process/logout', function (req, res) {
    req.session.destroy();
    res.clearCookie('jeon_id');
    res.redirect('/index');
});
var router = express.Router();

router.route('/index').all(function (req, res) {
    res.render('cover', {});
});
var get_static_map = function (pathname) {
    var extension = path.extname(pathname); // 확장자를 구하는 메서드
    var staticMap = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.mp3': 'audio/mpeg',
    }
    return staticMap[extension];

}
router.route('/notice').all(function (req, res) {

    var pathname = '/notice.html';
    var type = get_static_map(pathname);
    res.end();

});

router.route('/process/login_page').all(function (req, res) {
    if (req.session.user) {
        res.redirect('/open_home');
    } else
        res.render('log_in');
});
var check_dup = function (id, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }

        var data = {
            member_id: id
        };
        var exec = conn.query('select member_id from member where member_id =?; ', id, function (err, result) {
            conn.release();
            if (err) {
                callback(err, all);
            }
            callback(null, result);
        });
    });
}

var check_username_dup = function (username, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }
        var data = {
            member_user_name: username
        };
        var exec = conn.query('select member_user_name from member where member_user_name  =?; ', username, function (err, result) {
            conn.release();
            if (err) {
                callback(err, null);
            }

            callback(null, result);
        });
    });
}
router.route('/process/checkId').get(function (req, res) {
    var check_id = req.param('id');
    check_dup(check_id, function (err, rows) {
        if (err) throw err;
        else {
            if (rows.length > 0)
                res.send({
                    rows: rows
                });
            else
                res.send();
        }
        return;
    });
});
router.route('/process/check_user_name').get(function (req, res) {
    var check_user_name = req.param('user_name');
    check_username_dup(check_user_name, function (err, rows) {
        if (err) throw err;
        else {
            if (rows.length > 0)
                res.send({
                    rows: rows
                });
            else
                res.send();
        }
        return;
    });
});

router.route('/process/adduser').post(function (req, res) {

    var param_Id = req.body.user_id || req.query.user_id;
    var param_password = req.body.password || req.query.password;
    var param_real_name = req.body.real_name || req.query.real_name;
    var param_user_name = req.body.user_name || req.query.user_name;
    var param_student_id = req.body.student_id || req.query.student_id;
    var param_phone = req.body.phone || req.query.phone;
    var blog = req.body.blog || req.query.blog;
    var email = req.body.email || req.query.email;
    if (pool) {
        adduser(param_Id, param_password, param_real_name, param_user_name, param_student_id, param_phone, blog, email, function (err, adduser) {
            if (err) {
                res.writeHead('200', {
                    'content-type': 'text/html;charset = utf-8'
                });
                res.write("<h1>오류발생</h1>");
                res.end();
                return;
            }
            if (adduser) {
                res.send('<script type="text/javascript">alert("관리자 승인 후 사용 가능합니다");</script><script type="text/javascript"> location.href="/process/login_page"; </script>');
            } else {
                res.writeHead('200', {
                    'content-type': 'text/html;charset = utf-8'
                });
                res.write("<h1>사용자 추가실패</h1>");
                res.end();
            }
        });
    } else {
        res.writeHead('200', {
            'content-type': 'text/html;charset = utf-8'
        });

        res.end();

    }
});
router.route('/process/adduserpage').get(function (req, res) {
    console.log('adduserpage');
    res.render('sign_up', {});
});


app.all('/', function (req, res) {

    res.redirect('/index');
});

app.use('/open_home', open_home);
app.use('/', router);
app.use('/board', board);
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);
http.createServer(app).listen(app.get('port'), function () {

});
