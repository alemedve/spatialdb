/* Define the map from mapbox */
var map = L.map('map').setView([0, -28], 3);
var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWxlbWVkdmUiLCJhIjoiY2llcHNoeHByMDAxbndqa21zdjdwYmJkciJ9.Ch1gM-PFeR7YhhKpqV4I7Q', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.satellite',
  accesToken: 'pk.eyJ1IjoiYWxlbWVkdmUiLCJhIjoiY2llcHNoeHByMDAxbndqa21zdjdwYmJkciJ9.Ch1gM-PFeR7YhhKpqV4I7Q'
}).addTo(map);

var streets   = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWxlbWVkdmUiLCJhIjoiY2llcHNoeHByMDAxbndqa21zdjdwYmJkciJ9.Ch1gM-PFeR7YhhKpqV4I7Q', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.streets',
  accesToken: 'pk.eyJ1IjoiYWxlbWVkdmUiLCJhIjoiY2llcHNoeHByMDAxbndqa21zdjdwYmJkciJ9.Ch1gM-PFeR7YhhKpqV4I7Q'
}).addTo(map);

var baseMaps = {
    "Satellite": satellite,
    "Streets": streets
};

//L.control.layers(baseMaps).addTo(map);
var pointIcon = L.icon({
  iconUrl: 'redpoint.png',
  iconSize: [10, 10]
});

var bluemarker = L.icon({
  iconUrl: 'bluemarker.png',
  iconSize: [12, 20]
});

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
  document.getElementById("photos").innerHTML = '';
  var position = location.hash;
  var separator = position.indexOf(";");
  var lat = position.substring(1,separator);
  var lon = position.substring(separator+1, position.length);
  console.log(photos[1]);

  /* Not very efficent... Should find the way to avoid this call, using the previous answer */
  get_json("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=b8755d103368823ee3ca52487500e945&tags=plane&lat=" + lat + "&lon=" + lon + "&radius=5&format=json&nojsoncallback=1",
  [lat, lon],
    function (resp, location) {
      if(resp.photos.photo.length != "0"){
          for(i = 0; i < resp.photos.photo.length; i++) {
            var im = document.createElement("img");
            var photo = resp.photos.photo[i];
            im.src = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg";
            document.getElementById("photos").appendChild(im);
          }

      }
    });
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
    var emptyAirports = L.markerClusterGroup();
    var photoAirports = L.markerClusterGroup();
    var overlayMaps = {
      "Empty": emptyAirports,
      "With photos": photoAirports
    };
    L.control.layers(baseMaps, overlayMaps).addTo(map);
    // Limited to 100 results for testing purposes
    // i < results.data.length
    for (i=0; i<results.data.length; i++) {
      get_json("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=b8755d103368823ee3ca52487500e945&tags=plane&lat=" + results.data[i][6] + "&lon=" + results.data[i][7] + "&radius=5&format=json&nojsoncallback=1",
      [results.data[i][6], results.data[i][7]],
        function (resp, location) {
          resp.lat = location[0];
          resp.lon = location[1];
          var icon = pointIcon;
          var airports = emptyAirports;
          if(resp.photos.total != "0"){
              icon = bluemarker;
              airports = photoAirports;
          }
          airports.addLayer(L.marker([location[0], location[1]], {icon: icon, title: resp.photos.total}).on('click', onPointClick, resp));
        });
    }
  }
});
