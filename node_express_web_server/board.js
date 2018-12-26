var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var expressSession = require('express-session');
var mkdir = require('mkdirp');
var fs = require('fs');

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

var rename_upload_file = function () {

};
router.get('/', function (req, res) {
    res.redirect('/board/list/1');
})
router.get('/write', function (req, res, next) {
    console.dir(req.session.user);
    res.render('write', {
        title: "게시판 글 쓰기",
        id: req.session.user.id
    });
});
var upload_file_search = function (paths, err) {
    var files = fs.readdirSync(paths); // 하위 폴더 내 파일 검색
    console.dir(files)
    return files;
};
router.post('/write', upload.array('file'), function (req, res) {
    var creator_id = req.session.user.id;
    var title = req.body.title;
    var content = req.body.contents;
    var passwd = req.body.passwd;

    var files = req.files;
    var upload_file_path = '';
    var orginal_file_name = '';
    var date = Date.now();

    if (files.length > 0) {
        var directory = './uploads/board/' + date + "_" + req.session.user.id + "/";
        mkdir(directory);
        var rows = files.length;
        for (var i = 0; i < rows; i++) {
            fs.rename('./uploads/' + files[i].filename, directory + files[i].filename, function (err) {
                if (err) throw err;
                console.log('renamed complete');
            });
        }
    }
    var datas = [creator_id, passwd, title, content, directory, rows];
    pool.getConnection(function (err, connection) {
        // Use the connection
        var sqlForInsertBoard = "insert into basic_board(creator_id,creator_pwd, title, contents,upload_file_path,upload_file_count) values(?,?,?,?,?,?);";

        connection.query(sqlForInsertBoard, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            res.redirect('/board');
            connection.release();
            // Don't use the connection here, it has been returned to the pool.
        });
    });
    upload.single(files);
});

router.get('/list/:page', function (req, res, next) {

    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    pool.getConnection(function (err, connection) {
        var query = "SELECT idx, creator_id ,upload_file_count, title FROM basic_board"
        connection.query(query, function (err, rows) {
            if (err) console.error(err);
            console.dir(rows);
            res.render('list', {
                title: '게시판 전체 글 조회',
                rows: rows
            });
            connection.release();
        });
    });
});

router.get('/download/:idx/:path', function (req, res, next) {
    var idx = req.params.idx;

    console.dir(req.params.idx);
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    pool.getConnection(function (err, connection) {
        var query = "SELECT upload_file_path FROM basic_board where idx=" + idx;
        connection.query(query, function (err, rows) {
            if (err) console.error(err);
            connection.release();
            var paths = __dirname + "/" + rows[0].upload_file_path + req.params.path;
            console.dir(paths);
            res.download(paths);
        });
    });
});

router.get('/read/:idx', function (req, res) {
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    console.log(req.params.idx);

    pool.getConnection(function (err, connection) {
        var query = "SELECT idx,creator_id,title,contents,upload_file_path FROM basic_board where idx=" + req.params.idx;
        connection.query(query, function (err, rows) {

            if (err) console.error(err);
            connection.release();
            console.dir(rows);
            rows[0].contents = rows[0].contents.replace(/(?:\r\n|\r|\n)/g, "<br>");
            rows[0].contents = rows[0].contents.replace(/&lt;/g, "<");
            rows[0].contents = rows[0].contents.replace(/&gt;/g, ">");

            if (rows[0].upload_file_path != null)
                var files = upload_file_search(rows[0].upload_file_path);
            res.render('read', {
                row: rows,
                files: files
            });

        });
    });
});




module.exports = router;
