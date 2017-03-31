var express = require('express'),
	markers = require('./utilities/markers');

var app = express();

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