function side_open() {
	document.getElementById("center").style.marginRight = "25%";
	document.getElementById("mySidebar").style.width = "25%";
	document.getElementById("mySidebar").style.display = "block";
}
function side_close() {
	document.getElementById("center").style.marginRight = "0%";
	document.getElementById("mySidebar").style.display = "none";
}
function resizeSideBars() {
	$(".col-md-2, .sidenav").height($(window).height());
	$("#main").height($(window).height());
}


$(document).ready(() => {
    $("#fudier").click(processData);

    numRangeInput("#rating");
    numRangeInput("#numStops");
});

function numRangeInput(selector) {
    $(selector).keypress(e => {
        var num = parseInt(e.originalEvent.key);
        if (isNaN(num)) {
            e.preventDefault();
        }
    });
}

function processData() {
    const MIN_RATING = 1;
    const MAX_RATING = 5;
    const MIN_STOPS = 2;
    const MAX_STOPS = 10;

    // retrieve info from start, end, price, rating, and stops
    var start = $("#sl").val();
    var end = $("#el").val();
    var priceLevel = $(".priceCheckbox");
    var priceLevels = "";
    for (var i = 0; i < priceLevel.length; i++) {
        if (priceLevel[i].checked) {
            if (priceLevels.length != 0) {
                priceLevels += ", " + (i + 1);
            } else {
                priceLevels += (i + 1);
            }
        }
    }
    var rating = parseInt($("#rating").val());
    var numStops = parseInt($("#numStops").val());

    if (start == null || start.length == 0) {
        alert("Please provide a starting location");
    } else if (end == null || end.length == 0) {
        alert("Please provide an ending location");
    } else if (priceLevels.length == 0) {
        alert("A price level must be selected first");
    } else if (isNaN(rating) || rating < MIN_RATING || rating > MAX_RATING) {
        alert("Rating must be between " + MIN_RATING + " and " + MAX_RATING);
    } else if (isNaN(numStops) || numStops < MIN_STOPS || numStops > MAX_STOPS) {
        alert("Number of Fudi stops must be between " + MIN_STOPS + " and " + MAX_STOPS);
    }

    // assume locations have been converted to latitude and longitude coordinates
    // and we've received the JSON response from the python server
    
	// call python server method
	
	var geocoder = new google.maps.Geocoder();

	geocoder.geocode({"address": start}, (results, status) => {
		if (status === 'OK') {
			var latlngObj = results[0].geometry.location;
			var latitude = latlngObj.lat();
			var longitude = latlngObj.lng();
	
			var startLocs = [latitude, longitude];
	
			geocoder.geocode({"address": end}, (results2, status2) => {
				if (status2 === 'OK') {
					latlngObj = results2[0].geometry.location;
					var latitude = latlngObj.lat();
					var longitude = latlngObj.lng();
			
					var endLocs = [latitude, longitude];

					produceList(startLocs, endLocs, priceLevels, rating, numStops);
				} else {
					alert("Couldn't geocode `" + end + "`");
					console.log(status2);
				}
			});
		} else {
			alert("Couldn't geocode `" + start + "`");
			console.log(status);
		}
	});
}

function produceList(start, end, priceLevels, rating, numStops) {
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

	var params = {
		"lat_start": start[0],
		"long_start": start[1],
		"lat_end": end[0],
		"long_end": end[1],
		"price_levels": priceLevels
	}

	var baseurl ="http://localhost:8000/api?"
	var query =baseurl+$.param(params);
	var token ="O68RjH5EXT7RnWLL1DbfliT4wgFh6ZrsWDNAWk9N7OVEoJHtAPYDmh5klTL5TVhi4N09YQP3DgoOvArWs_Po2p3E5SSMnRG1uiGOAbatqRAk7Lmebmrg5Ieb8WO9WXYx";	

	$.ajax({
		url : query,
		dataType : "json",
		headers: {
			"Content-Type":"application/json",
			"Accept": "application/json"},
		type : 'GET',
		contentType: "application/json",
		success: function(data) {
			// renderData(data);
			processJSON(data);
		},
		error: function(request, status, error) {
			alert(request.responseText);
		}
	  });
}

function processJSON(json, start, end, rating) {
	var latStart = start[0];
	var longStart = start[1];
	var latEnd = end[0];
	var longEnd = end[1];
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
		// remove low ratings
		// sort by rating and review count
		
		for (var i = 0; i< rr.length; i++) {
			if (rr[i]["rating"] < rating) {
				rr.splice(i, 1);
				i--;
			}
		}

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
		var name = res["name"];
		var address = res["location"]["display_address"].join(", ");
		var string = name + " at " + address;
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

		var mapsLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURI(name + " " + address);
		res["project_fudi_maps_link"] = mapsLink;
	});

	return list;
}