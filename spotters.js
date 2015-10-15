/* Define the map from mapbox */
var map = L.map('map').setView([0, -28], 3);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWxlbWVkdmUiLCJhIjoiY2llcHNoeHByMDAxbndqa21zdjdwYmJkciJ9.Ch1gM-PFeR7YhhKpqV4I7Q', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'alemedve.nlc9d0ic',
  accesToken: 'pk.eyJ1IjoiYWxlbWVkdmUiLCJhIjoiY2llcHNoeHByMDAxbndqa21zdjdwYmJkciJ9.Ch1gM-PFeR7YhhKpqV4I7Q'
}).addTo(map);
var pointIcon = L.icon({
  iconUrl: 'point.png',
  iconSize: [10, 10]
})

/* Get json from Flickr */
function get_json(url, location, callback) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var myArr = JSON.parse(xmlhttp.responseText);
      callback(myArr, location);
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

/* Define popup on icon click */
var popup = L.popup();
function onPointClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("Photos: " + this.photos.total + "<br><a href=\"#" + this.lat + ";" + this.lon + "\" id=\"viewphotos\">View photos</a>")
    .openOn(map);
  document.getElementById("viewphotos").addEventListener("click", onViewClick);
  }

/* Define viewphots action */
var photos = [];
function onViewClick(e) {
  document.getElementById("photofeed").style.display = 'block';
  var position = location.hash;
  var separator = position.indexOf(";");
  var lat = position.substring(1,separator);
  var lon = position.substring(separator+1, position.length);
  console.log(photos[1]);

}

function onXClick(e) {
  document.getElementById("photofeed").style.display = 'none';
}
document.getElementById("photofeedclose").addEventListener("click", onXClick);

/* Retrieve airport data and parse */
var results = Papa.parse("https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat", {
  download: true,
  complete: function(results) {
    console.log(results);
    // Limited to 100 results for testing purposes
    // i < results.data.length
    for (i=0; i<100; i++) {
      get_json("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=b8755d103368823ee3ca52487500e945&tags=plane&lat=" + results.data[i][6] + "&lon=" + results.data[i][7] + "&radius=5&format=json&nojsoncallback=1",
      [results.data[i][6], results.data[i][7]],
        function (resp, location) {
          if(resp.photos.total != "0"){
              resp.lat = location[0];
              resp.lon = location[1];
              L.marker([location[0], location[1]], {icon: pointIcon, title: resp.photos.total}).addTo(map).on('click', onPointClick, resp);;
          }
        });
    }
  }
});
