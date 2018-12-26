var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var expressSession = require('express-session');
var mkdir = require('mkdirp');
var fs = require('fs');
var board_free = require('./board_free');
var board_noti = require('./board_noti');
var board_photo = require('./board_photo');
var board_armi = require('./board_armi');
var board_gaein_project = require('./board_gaein_project');
var board_lecture = require('./board_lecture');



var pool = mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
 database:'open_server_database',
        password:'sorkchlrh1!Q'

});

var multer = require('multer');
var upload = multer({
    dest: 'uploads'
});

var storage = multer.diskStorage({
    date: function (req, file, callback) {
        callback(null, Date.now());
    },
    destination: function (req, file, callback) {
        callback(null, 'uploads/')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    },
    originalname: function (req, file, callback) {
        callback(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
});

var get_upload_file_search = function (paths, err) {
    var files = fs.readdirSync(paths);
    console.dir(files[0]);
    return files;
};
router.get('/', function (req, res) {
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    } else if (req.session.user) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT no,name,title,text,hit,filename FROM board_photo;";
            connection.query(query, function (err, rows) {
                if (err) console.error(err);
                connection.release();
                if (rows.length > 0) {
                    for (var i = 0; i < rows.length; i++) {
                        rows[i].text = rows[i].text.replace(/(?:\r\n|\r|\n)/g, "<br>");
                        rows[i].text = rows[i].text.replace(/&lt;/g, "<");
                        rows[i].text = rows[i].text.replace(/&gt;/g, ">");
                        if (rows[i].filename != null && rows[i].filename != '')
                            rows[i].filename = get_upload_file_search(rows[i].filename);
                    }
                }
                console.dir(rows[1]);
                res.render('./open_home/home', {
                    user_name: req.session.user.name,
                    rows: rows
                });
                res.end();
            });
        });
    }
});


var upload_file_search = function (paths, err) {
    var files = fs.readdirSync(paths); // 하위 폴더 내 파일 검색
    console.dir(files)
    return files;
};

router.get('/img/:idx/:path', function (req, res, next) {
    console.dir(req.params);
    var idx = req.params.idx;
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    pool.getConnection(function (err, connection) {
        var query = "SELECT filename FROM board_photo where no=" + idx;
        connection.query(query, function (err, rows) {
            if (err) console.error(err);
            connection.release();
            var file_name = rows[0].filename + req.params.path;
            fs.readFile(file_name, function (err, data) {
                res.writeHead(200, {
                    "Content-Type": 'image/jpeg'
                })
                res.write(data);
                res.end();
            });
        });
    });
});

router.get('/download/:idx/:path', function (req, res) {

    var idx = req.params.idx;
    console.dir(req.params.idx);
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    pool.getConnection(function (err, connection) {
        var query = "SELECT filename FROM free where no=" + idx;
        connection.query(query, function (err, rows) {
            if (err) console.error(err);
            connection.release();
            var paths = rows[0].filename + req.params.path;
            console.dir(paths);
            res.download(paths);
        });
    });
});



router.use('/free', board_free);
router.use('/noti', board_noti);
router.use('/photo', board_photo);
router.use('/armi', board_armi);
router.use('/gaein_project', board_gaein_project);
router.use('/lecture', board_lecture);



module.exports = router;
