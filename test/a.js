var latStart = 40.732848;
var longStart = -74.008434;
var latEnd = 40.722753;
var longEnd = -73.996233;

var fs = require('fs');
var json = fs.readFileSync('./test/response.json');
json = JSON.parse(json);
json = json["businesses"];

for (var i = 0; i < json.length; i++) {
	var business = json[i];
	var rating = business["rating"];
	var coords = business["coordinates"];
	var lat = coords["latitude"];
	var long = coords["longitude"];
	var distance = getDistance(latStart, longStart, lat, long);
	console.log((5 - rating) * distance);
}

function toRadians(degree) {
	return degree * Math.PI / 180;
}

function getDistance(lat1, long1, lat2, long2) {
	lat1 = toRadians(lat1);
	long1 = toRadians(long1);
	lat2 = toRadians(lat2);
	long2 = toRadians(long2);

	var dlat = lat2 - lat1;
	var dlong = long2 - long1;

	var r = 6373e3;

	var a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat2) * Math.pow(Math.sin(dlong / 2), 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var dist = r * c;

	return dist;
}