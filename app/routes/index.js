var path = require('path');

module.exports = function(app) {

    require('./upload-routes.js')(app);
    require('./gethAPI.js')(app);

    app.get('*', function(req, res) {
        res.sendFile(path.resolve('public/index.html'));
    });
};
