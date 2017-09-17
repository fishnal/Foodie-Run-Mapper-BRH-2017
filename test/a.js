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

var latStart = 40.732848;
var longStart = -74.008434;
var latEnd = 40.722753;
var longEnd = -73.996233;
var numStops = 5;
var radiusIncrement = getDistance(latStart, longStart, latEnd, longEnd) / numStops;

var fs = require('fs');
var json = fs.readFileSync('./test/response.json');
json = JSON.parse(json);
json = json["businesses"];
var radialRanges = [];

for (var i = 0; i < numStops; i++) {
	radialRanges.push([]);
}

for (var i = 0; i < json.length; i++) {
	var business = json[i];
	var coords = business["coordinates"];
	var lat = coords["latitude"];
	var long = coords["longitude"];
	var distance = getDistance(latStart, longStart, lat, long);

	// distance from start to business will always fall in some radial
	// category/range
	for (var j = 0; j < numStops; j++) {
		// range from current to next
		var r1 = radiusIncrement * (j);
		var r2 = radiusIncrement * (j + 1);

		if (distance >= r1 && distance < r2) {
			// place this in r1 category
			radialRanges[j].push(business);
			break;
		}
	}
}

var list = [];
radialRanges.forEach(rr => {
	// sort by rating and review count
	rr.sort((a, b) => a["rating"] - b["rating"]);
	for (var i = 0; i < rr.length - 1; i++) {
		var rating = rr[i]["rating"];
		var smallest = rr[i];
		var index = i;

		for (var j = i + 1; j < rr.length && rating == rr[j]["rating"]; j++) {
			if (rr[j]["review_count"] < smallest["review_count"]) {
				smallest = rr[index = j];
			}
		}

		if (index != i) {
			var temp = rr[i];
			rr[i] = smallest;
			rr[index] = temp;
		}
	}

	list.push(rr[rr.length - 1]);
});

list.forEach((res, i) => {
	var string = res["name"] + " at " + res["location"]["display_address"].join(", ");
	var lat1 = res["coordinates"]["latitude"];
	var long1 = res["coordinates"]["longitude"];
	var distance;

	if (i != 0) {
		// log distance to next location
		var lat2 = list[i]["coordinates"]["latitude"];
		var long2 = list[i-1]["coordinates"]["longitude"];
	} else {
		var lat2 = latStart;
		var long2 = longStart;
	}
	
	distance = getDistance(lat1, long1, lat2, long2);
	string += " (" + distance.toFixed(0) + " meters)";

	console.log(string);
});