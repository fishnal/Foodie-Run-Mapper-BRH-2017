
var params = {
    "lat_start":40.732848,
    "long_start":-74.008434,
    "lat_end":40.722753,
    "long_end":-73.996233,
    "price_levels":[1,2,3,4]
};
//var baseurl = "https://api.yelp.com/v3/businesses/search?";
var baseurl ="http://localhost:8000/api?"
var query =baseurl+$.param(params);
var token ="O68RjH5EXT7RnWLL1DbfliT4wgFh6ZrsWDNAWk9N7OVEoJHtAPYDmh5klTL5TVhi4N09YQP3DgoOvArWs_Po2p3E5SSMnRG1uiGOAbatqRAk7Lmebmrg5Ieb8WO9WXYx";

var template = "Restaurant: <ul>{{#businesses}}<li>Name:{{name}};</li>{{/businesses}}</ul>";

function renderData(data){
    var html = Mustache.to_html(template, data);
    $('#output').html(html);
}

$(document).ready(() => {
   $.ajax({
      url : query,
        dataType : "json",
        headers: {
            "Content-Type":"application/json",
            "Accept": "application/json"},
        type : 'GET',
        contentType: "application/json",
        success:function(data) {
              renderData(data);
            },
        error: function (request, status, error) {
            alert(request.responseText);
    }
    });


});
