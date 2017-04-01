var express = require('express'),
    markers = require('./utilities/markers');

var app = express();


app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});

// app.configure(function () {
// 	app.use(express.logger('dev'));      'default', 'short', 'tiny', 'dev' 
// 	app.use(express.bodyParser());
// });

app.get('/getAllMarker', markers.all);
app.get('/getMarkerById/:id', markers.byId);
app.get('/getMarkerByTag/:tag', markers.byTag);
app.get('/getTopNMarker/:num/:lat/:lng', markers.topN);
app.post('/addMarker/:photoHash/:thumbnailHash/:lat/:lng/:tag', markers.add);
app.delete('/deleteMarker/:photoHash', markers.delete);

app.listen(7070);
console.log('Listening on port 7070...');
