var fs = require('fs');
var path = require('path');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.resolve('my_images/'))
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
}).single('file');

module.exports = function(app) {

    app.post('/api/upload', function(req, res) {
        console.log("Begin upload");
        upload(req, res, function(err) {
            if (err) {
                res.json({ error_code: 1, err_desc: err });
                return;
            }
            console.log("Upload Success");
            res.json({ error_code: 0, err_desc: null, filePath: path.resolve('my_images/') });
        })
    });

    app.get('/api/fetchAll', function(req, res) {
        console.log("Begin fetch");
        fs.readdir(path.resolve('my_images/'), function(err, files) {
            res.json({ files: files, filePath: path.resolve('my_images/') })
                // res.send(files);
        });
    });

    app.get('/api/renderImage', function(req, res) {
        console.log(req.query);
        var img = path.resolve('my_images/' + req.query.name);
        fs.readFile(img, function(err, data) {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(new Buffer(data).toString('base64'));
        });
    })
};
