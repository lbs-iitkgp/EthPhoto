var map;
var request = require('request');
// const { dialog } = require('electron').remote;
// console.log(dialog.showOpenDialog({ properties: ['openFile', 'openDirectory', 'multiSelections'] }))

function initMap() {
    var centerPos = { lat: 22.3333, lng: 87.3333 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: centerPos,
        zoom: 8
    });
    request.get('http://freegeoip.net/json/', function(err, res, body) {
        if (err) {
            console.log("BOOO");
        } else {
            jsonBody = JSON.parse(body);
            centerPos = {
                lat: jsonBody.latitude,
                lng: jsonBody.longitude
            };
            map.setCenter(centerPos);
        }
    });
}
