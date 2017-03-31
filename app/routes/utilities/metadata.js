var mongo = require('mongodb'),
	var kdTree = require('./kdTree');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('markerdb', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'markerdb' database");
        db.collection('markers', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'markers' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

function distance(a, b) {
	var lat1 = a.latitude,
	lon1 = a.longitude,
	lat2 = b.latitude,
	lon2 = b.longitude;
	var rad = Math.PI/180;

	var dLat = (lat2-lat1)*rad;
	var dLon = (lon2-lon1)*rad;
	var lat1 = lat1*rad;
	var lat2 = lat2*rad;

	var x = Math.sin(dLat/2);
	var y = Math.sin(dLon/2);

	var a = x*x + y*y * Math.cos(lat1) * Math.cos(lat2); 
	return Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving markers: ' + id);
    db.collection('markers', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('markers', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findN = function(req, res){
	var num = req.params.num;
	var lat = req.params.latLng.lat;
	var lng = req.params.latLng.lng;
	console.log('Retrieving markers closest ' + num);
	tree = new kdTree();
	db.collection('markers', function(err, collection) {
		collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
			for (var i = item.length - 1; i >= 0; i--) {
				item[i]
			}
			res.send(item);
		});
	});
}

exports.addMarker = function(req, res) {
    var marker = req.body;
    console.log('Adding marker: ' + JSON.stringify(marker));
    db.collection('markers', function(err, collection) {
        collection.insert(marker, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateMarker = function(req, res) {
    var id = req.params.id;
    var marker = req.body;
    console.log('Updating marker: ' + id);
    console.log(JSON.stringify(marker));
    db.collection('markers', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, marker, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating marker: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(marker);
            }
        });
    });
}

exports.deleteMarker = function(req, res) {
    var id = req.params.id;
    console.log('Deleting marker: ' + id);
    db.collection('markers', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

	//ToDo : use some file like data.json to do this

	var markers = [
	{
		name: "rand1",
		lat: "2009",
		lng: "Grenache / Syrah",
		thumb: "saint_cosme.jpg"
	},
	{
		name: "rand2",
		lat: "2009",
		lng: "Grenache / Syrah",
		thumb: "saint_cosme.jpg"
	}];

	db.collection('markers', function(err, collection) {
		collection.insert(markers, {safe:true}, function(err, result) {});
	});

};