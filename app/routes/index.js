var path = require('path');

module.exports = function(app) {

    require('./upload-routes.js')(app);
    require('./clarifai-routes.js')(app);
    require('./gethAPI.js');
    require('./kdTree.js');

    app.get('*', function(req, res) {
        res.sendFile(path.resolve('public/index.html'));
    });
};
