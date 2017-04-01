var kdTree = require('./kdTree').kdTree;
var photos = require('./data.json');
var jsonfile = require('jsonfile');
var path = require('path');

function distance(a, b) {
    var lat1 = a.latitude,
        lon1 = a.longitude,
        lat2 = b.latitude,
        lon2 = b.longitude;
    var rad = Math.PI / 180;

    var dLat = (lat2 - lat1) * rad;
    var dLon = (lon2 - lon1) * rad;
    var lat1 = lat1 * rad;
    var lat2 = lat2 * rad;

    var x = Math.sin(dLat / 2);
    var y = Math.sin(dLon / 2);

    var a = x * x + y * y * Math.cos(lat1) * Math.cos(lat2);
    return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


exports.byId = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving markers: ' + id);
    var marker;
    for (var i = photos.length - 1; i >= 0; i--) {
        if (photos[i]['photoHash'] == id) {
            marker = photos[i];
        }
    }
    res.send(marker);
};

exports.all = function(req, res) {
    console.log('Retrieving markers:  All');
    res.send(photos);
};

exports.topN = function(req, res) {
    var numMarkers = req.params.num;
    var lat = req.params.lat;
    var lng = req.params.lng;
    console.log(numMarkers, photos.length);
    if (numMarkers > photos.length) {
        numMarkers = photos.length;
    }
    var currentPosition = { latitude: lat, longitude: lng };
    console.log('Retrieving markers closest ' + numMarkers + 'at lat: ' + lat + ', lng: ' + lng);
    var tree = new kdTree(photos, distance, ["latitude", "longitude"]);
    var nearest = tree.nearest(currentPosition, numMarkers);
    var markers = [];
    for (var i = 0; i < numMarkers; i++) {
        markers.push(nearest[i]);
    }
    // console.log(markers);
    res.send(markers);
}

exports.byTag = function(req, res) {
    var tag = req.params.tag;
    console.log('Retrieving markers: ' + id);
    var markers = [];
    for (var i = photos.length - 1; i >= 0; i--) {
        if (photos[i]['tag'] == tag) {
            markers.push(photos[i]);
        }
    }
    res.send(markers);
}

exports.add = function(req, res) {
    var photoHash = req.params.photoHash;
    var thumbnailHash = req.params.thumbnailHash;
    var lat = req.params.lat;
    var lng = req.params.lng;
    var tag = req.params.tag;
    var newPhoto = { "photoHash": photoHash, "thumbnailHash": thumbnailHash, "latitude": lat, "longitude": lng, "tag": tag };
    photos.push(newPhoto);
    console.log('Adding marker: ');
    console.log(photos);
    var file = path.resolve('app/routes/utilities/data.json');
    jsonfile.writeFile(file, photos, function(err) {
        if (err) {
            console.log('Error adding marker: ' + err);
            res.send({ 'error': 'An error has occurred' });
        } else {
            console.log('' + photoHash + ' document(s) added');
            // photos = require('./data.json');
            res.send(photoHash);
        }
    });
}

// exports.update = function(req, res) {
//     var photoHash = req.params.photoHash;
// 	var thumbnailHash = req.params.thumbnailHash;
// 	var lat = req.params.lat;
// 	var lng = req.params.lng;
//     console.log('Updating marker: ' + id);
//     console.log(JSON.stringify(marker));
//     db.collection('markers', function(err, collection) {
//         collection.update({'_id':new BSON.ObjectID(id)}, marker, {safe:true}, function(err, result) {
//             if (err) {
//                 console.log('Error updating marker: ' + err);
//                 res.send({'error':'An error has occurred'});
//             } else {
//                 console.log('' + result + ' document(s) updated');
//                 res.send(marker);
//             }
//         });
//     });
// }

exports.delete = function(req, res) {
    var photoHash = req.params.photoHash;
    var index = -1;
    for (var i = photos.length - 1; i >= 0; i--) {
        if (photos[i]['photoHash'] == photoHash) {
            index = i;
        }
    }
    if (index === -1) {
        console.log('Error deleting marker: ' + photoHash);
        // res.send({'no such photohash'});
        res.send({ 'error': 'An error has occurred' });
    }
    photos.splice(index, 1);
    console.log('Deleting marker: ');
    console.log(photos);
    var file = path.resolve('app/routes/utilities/data.json');
    jsonfile.writeFile(file, photos, function(err) {
        if (err) {
            console.log('Error adding marker: ' + err);
            res.send({ 'error': 'An error has occurred' });
        } else {
            console.log('' + photoHash + ' document(s) delete');
            // photos = require('./data.json');
            res.send(photoHash);
        }
    });
}

// /*--------------------------------------------------------------------------------------------------------------------*/
// // Populate database with sample data -- Only used once: the first time the application is started.
// // You'd typically not find this code in a real-life app, since the database would already exist.
// var populateDB = function() {

//     //ToDo : use some file like data.json to do this

//     var markers = [
//     {
//         name: "rand1",
//         lat: "2009",
//         lng: "Grenache / Syrah",
//         thumb: "saint_cosme.jpg"
//     },
//     {
//         name: "rand2",
//         lat: "2009",
//         lng: "Grenache / Syrah",
//         thumb: "saint_cosme.jpg"
//     }];

//     db.collection('markers', function(err, collection) {
//         collection.insert(markers, {safe:true}, function(err, result) {});
//     });

// };
