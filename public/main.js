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
                priceLevels += (i + 1)
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

    var response = 'JSON_DATA_HERE';
    response = JSON.parse(response);
    
}
