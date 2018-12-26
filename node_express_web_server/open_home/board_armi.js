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

router.get('/', function (req, res) {
    res.redirect('/open_home/armi/list/1');
});
router.get('/write', function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    console.dir(req.session.user);
    res.render('./open_home/board_write', {
        title: "군인 게시판",
        position: "armi",
        user_name: req.session.user.name
    });
});
var upload_file_search = function (paths, err) {
    var files = fs.readdirSync(paths); // 하위 폴더 내 파일 검색
    console.dir(files)
    return files;
};
router.post('/write', upload.array('file'), function (req, res) {
    var name = req.session.user.name;
    var title = req.body.title;
    var content = req.body.contents;
    var passwd = req.body.passwd;

    var files = req.files;
    var upload_file_path = '';
    var orginal_file_name = '';
    var date = new Date();
    var cur_date = date.getTime().toString().substring(0, 10);
        var directory = './uploads/open_home/board/armi/' + cur_date + "_" + req.session.user.name + "/";
        mkdir(directory);

    if (files.length > 0) {
    upload.single(files);
        var rows = files.length;
        for (var i = 0; i < rows; i++) {
            fs.rename('./uploads/' + files[i].filename, directory + files[i].filename, function (err) {
                if (err) throw err;
            });
        }
    }
    var datas = [name, passwd, title, content, directory, cur_date];
    pool.getConnection(function (err, connection) {
        // Use the connection
        var sqlForInsertBoard = "insert into armi(name,password,title,text,filename ,date ) values(?,?,?,?,?,?);";

        connection.query(sqlForInsertBoard, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            res.redirect('/open_home/armi');
            connection.release();
            // Don't use the connection here, it has been returned to the pool.
        });
    });
});

router.get('/list/:page', function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    var page = parseInt(req.params.page);
    var TABLE_ROWS;

    pool.getConnection(function (err, connection) {
        var query = "SELECT max(no) as max_id FROM armi;"
        connection.query(query, function (err, count) {
            if (err) console.error(err);
            TABLE_ROWS = parseInt(count[0].max_id);



            var start_no = TABLE_ROWS - page * 10;
            var end_no = TABLE_ROWS - (page - 1) * 10;
            query = "SELECT no,title, name ,replys,date,hit FROM armi where no >" + start_no + " AND  no<=" + end_no + ";";

            connection.query(query, function (err, rows) {
                if (err) console.error(err);

                res.render('open_home/board_list', {
                    title: '군인게시판',
                    rows: rows,
                    parent: 'armi',
                    page: page,
                    start_no: start_no,
                    user_name: req.session.user.name,
                    end_no: end_no,
                    position: "armi",
                    total_page: Math.ceil(TABLE_ROWS / 10)
                });
                connection.release();
            });
        });
    });
});

var update_hit = function (no, hit) {
    pool.getConnection(function (err, connection) {
        hit = hit + 1;
        var query = "update armi " + "set hit=" + hit + " where no=" + no;
        connection.query(query, function (err, rows) {
            if (err) console.error(err);
            connection.release();
        });
    });
}

var update_comment = function (no, replys) {
    pool.getConnection(function (err, connection) {
        var query = "update armi " + "set replys=" + replys + " where no=" + no;
        connection.query(query, function (err, rows) {
            if (err) console.error(err);
            connection.release();
        });
    });
}
var get_upload_file_search = function (paths, err) {

    var files = fs.readdirSync(paths);
    return files;
};
router.post('/comment/insert', function (req, res) {
    var no = req.body.idx;
    var name = req.body.user_name;
    var text = req.body.comment_data;
    var category = "armi";
    var date = new Date().getTime();
    var data = [no, name, text, category, date];
    pool.getConnection(function (err, connection) {
        // Use the connection
        var sqlForInsertComment = "insert into board_comment(no,name,text,category,date) values(?,?,?,?,?);";
        connection.query(sqlForInsertComment, data, function (err, rows) {
            if (err) console.error("err : " + err);
            connection.release();
            // Don't use the connection here, it has been returned to the pool.
        });
    });
    res.json({
        success: "Updated Successfully",
        status: 200
    });
});


router.post('/comment/list', function (req, res) {
    var no = req.body.idx;
    var category = "armi";
    var data = [no, category];
    pool.getConnection(function (err, connection) {
        var sqlForlistComment = "select name,text from board_comment where no= ?  and category =?;";
        connection.query(sqlForlistComment, data, function (err, rows) {
            if (err) console.error("err : " + err);
            connection.release();
            update_comment(no, rows.length);
            res.json(
                rows
            );
        });
    });
});

router.get('/read/:idx', function (req, res) {
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    pool.getConnection(function (err, connection) {
        var query = "SELECT no,name,title,text,hit,filename FROM armi where no=" + req.params.idx;
        connection.query(query, function (err, rows) {
            var files = "";

            if (err) console.error(err);
            connection.release();
            rows[0].text = rows[0].text.replace(/(?:\r\n|\r|\n)/g, "<br>");
            rows[0].text = rows[0].text.replace(/&lt;/g, "<");
            rows[0].text = rows[0].text.replace(/&gt;/g, ">");
            update_hit(req.params.idx, rows[0].hit);
            if (rows[0].filename != null && rows[0].filename != '') {

                if (fs.existsSync(rows[0].filename)) {
                    files = get_upload_file_search(rows[0].filename);
                }
            }
            res.render('./open_home/board_read', {
                row: rows,
                parent: "armi",
                position: "군인게시판",
                idx: req.params.idx,
                user_name: req.session.user.name,
                file_url: "/open_home/armi/download",
                files: files
            });
        });
    });
});
router.get('/download/:idx/:path', function (req, res) {
    var idx = req.params.idx;
    if (!req.session.user) {
        res.redirect('/index');
        res.end();
        return;
    }
    pool.getConnection(function (err, connection) {
        var query = "SELECT filename FROM armi where no=" + idx;
        connection.query(query, function (err, rows) {
            if (err) console.error(err);
            connection.release();
            var paths = rows[0].filename + req.params.path;
            res.download(paths);
        });
    });
});


module.exports = router;
