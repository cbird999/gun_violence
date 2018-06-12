var _map,
  usData,
  groupAData,
  groupBData,
  _ctlAttribute,
  _toggle,
  _legend,
  _pewData,
  _regions = ['South', 'Northeast', 'Midwest', 'West'],
  _groups = ['Male', 'Female'],
  geoJSONFiles = [
    './data/states_pop.geojson',
    './data/female_random_points.geojson',
    './data/male_random_points.geojson'
  ],
  _pewFile = './data/gender_strictness.json',
  geojsonData = [],
  mapID1 = 'map1',
  mapID2,
  mapID3,
  mapID4,
  mapID5;

var groupAFillColors = {
  'low': '#e7e1ef',
  'neutral': '#c994c7',
  'high': '#dd1c77'
};
var groupBFillColors = {
  'low': '#fee8c8',
  'neutral': '#fdbb84',
  'high': '#e34a33'
};

var groupFillOpacity = {
  'low': 0.25,
  'neutral': 0.5,
  'high': 0.75
};

var _usData,
  _groupAData,
  _groupBData,
  _lyrUS,
  _lyrGroupA,
  _lyrGroupB,
  _groupLabels,
  _groupColors;

function GVMap() {
  var _gvmap = {};

  _gvmap.renderMap = function(mapID) {
    _map = L.map(mapID, {
      center: [39.8283, -98.5795],
      zoom: 13,
      zoomControl: true,
      maxZoom: 19,
      minZoom: 1,
      dragging: true,
      attributionControl: false});
  };

  _gvmap.renderLayers = function() {
    // load US state layer
    _lyrUS = L.geoJSON(_usData,{
      style: function(feature) {
        return {
          stroke: true,
          color: '#cccccc',
          weight: 2,
          fill: true,
          fillColor: 'white',
          fillOpacity: .9,
          className: 'state'
        }
      }
    }).addTo(_map);
    _lyrUS.bringToBack();
    // _map.fitBounds(_lyrUS.getBounds());
    _map.setZoom(5);

    // load groupA layer
    _lyrGroupA = L.geoJSON(_groupAData, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 2,
          stroke: false,
          fill: true,
          className: (feature.properties.group + ' ' + feature.properties.class)
        })
      }
    }).addTo(_map);

    // load groupB layer
    _lyrGroupB = L.geoJSON(_groupBData, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 2,
          stroke: false,
          fill: true,
          className: (feature.properties.group + ' ' + feature.properties.class)
        })
      }
    }).addTo(_map);
  };

  _gvmap.addToggle = function() {
    console.log(_groupLabels);
    _toggle = L.control({position: 'topright'});
    _toggle.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info toggle'),
        html;
      html = '<ul>' +
        '<li><input type="checkbox" class="' + _groupLabels[0] + '" checked>' + _groupLabels[0] + '</input></li>' +
        '<li><input type="checkbox" class="' + _groupLabels[1] + '" checked>' + _groupLabels[1] + '</input></li>' +
        '</ul>';

      div.innerHTML = html;
      return div;
    };
    _toggle.addTo(_map);
  };

  _gvmap.addAttribution = function() {
    _ctlAttribute = L.control.attribution({
      position: 'bottomleft'
    });
    _ctlAttribute.addAttribution('<a href="https://www.openstreetmap.org/">OSM</a>');
    _ctlAttribute.addAttribution('<a href="http://datavis.thebirdery.com">CBIRD</a>')
    _ctlAttribute.addTo(_map);
  };

  _gvmap.addLegend = function() {
    _legend = L.control({position: 'bottomright'});
    var groupAName = _groupLabels[0],
      groupBName = _groupLabels[1];

    _legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = ['low', 'neutral', 'high'],
            labels = [],
            html;
        html = '<h6 class="legend-title">' + _legendTitle + '</h6>';
        html += '<div class="label-groupA">' +
          '<span>' + groupAName + '</span>' +
          '<i class="color-bar" style="background-color: ' + _groupColors[0][0] + '; opacity: 1"></i>' +
          '<i class="color-bar" style="background-color: #aaa; opacity: 1"></i>' +
          '<i class="color-bar" style="background-color: ' + _groupColors[0][1] + '; opacity: 1"></i>' +
        '</div>' +
        '<div class="legend-labels">' +
          '<span>&nbsp</span>' +
          '<span class="color-bar">' + _legendKeyLabels[0] + '</span>' +
          '<span class="color-bar">' + _legendKeyLabels[1] + '</span>' +
          '<span class="color-bar">' + _legendKeyLabels[2] + '</span>' +
        '</div>' +
        '<div class="label-groupB">' +
          '<span>' + groupBName + '</span>' +
          '<i class="color-bar" style="background-color: ' + _groupColors[1][0] + '; opacity: 1"></i>' +
          '<i class="color-bar" style="background-color: #aaa; opacity: 1"></i>' +
          '<i class="color-bar" style="background-color: ' + _groupColors[1][1] + '; opacity: 1"></i>' +
        '</div>';

        div.innerHTML = html;
        return div;
    };

    _legend.addTo(_map);

  }

  _gvmap.groupAData = function(data) {
    if (!arguments.length) return _groupAData;
    _groupAData = data;
  };

  _gvmap.groupBData = function(data) {
    if (!arguments.length) return _groupBData;
    _groupBData = data;
  };

  _gvmap.usData = function(data) {
    if (!arguments.length) return _usData;
    _usData = data;
  }

  _gvmap.groupLabels = function(data) {
    if (!arguments.length) return _groupLabels;
    _groupLabels = data;
  }

  _gvmap.legendTitle = function(title) {
    if (!arguments.length) return _legendTitle;
    _legendTitle = title;
  }

  _gvmap.groupColors = function(colors) {
    if (!arguments.length) return _groupColors;
    _groupColors = colors;
  }

  _gvmap.legendKeyLabels = function(keys) {
    if (!arguments.length) return _legendKeyLabels;
    _legendKeyLabels = keys;
  }

  return(_gvmap);
};


function addEventListeners() {
  // toggle
  document.querySelectorAll('.toggle input').forEach(function(el) {
    el.addEventListener('click', function(evt) {
      console.log(evt.target, evt.target.value, evt.target.checked, evt.target.classList);
      var targetClass = evt.target.classList[0];
      if (evt.target.checked) {
        document.querySelectorAll('.' + targetClass).forEach(function(m) {m.style.fillOpacity = '1';});
      } else {
        document.querySelectorAll('.' + targetClass).forEach(function(m) {m.style.fillOpacity = '0';});
      }
    });
  });
};


Array.prototype.unique = function() {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

// we need a function to load files
// done is a "callback" function
// so you call it once you're finished and pass whatever you want
// in this case, we're passing the `responseText` of the XML request
var loadFile = function (filePath, done) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () { return done(this.responseText) }
  xhr.open("GET", filePath, true);
  xhr.send();
};

// loop through each file
var count = 0;
geoJSONFiles.forEach(function (file, i) {
  console.log(i);
  loadFile(file, function (responseText) {
    count += 1;
    console.log(count, geojsonData);
    geojsonData[i] = JSON.parse(responseText);
    // console.log(i, geojsonData[i]);
    if (count === geoJSONFiles.length) {
      getPewData(geojsonData);
    }
  });
});

function getPewData(geojsonData) {
  loadFile(_pewFile, function(responseText) {
    _pewData = JSON.parse(responseText);
    loadMaps(geojsonData, _pewData)
    console.log(geojsonData, _pewData);
  });
}

function loadMaps(geojsonData, _pewData) {
  geojsonData.forEach(function(geojson) {
    console.log(geojson.features[0].geometry.type);
    if (geojson.features[0].geometry.type === 'MultiPolygon') {
      usData = geojson;
    } else if (geojson.features[0].properties.group === 'Female') {
      groupAData = geojson;
    } else {
      groupBData = geojson;
    }
  });
  var map = GVMap();
  map.groupLabels(['Female', 'Male']);
  map.groupColors([['#fdae61', '#2b83ba'],['#c2a5cf', '#008837']]);
  map.legendKeyLabels(['Less gun control', 'Laws are about right', 'More gun control'])
  map.usData(usData);
  map.groupAData(groupAData);
  map.groupBData(groupBData)
  map.renderMap(mapID1);
  map.renderLayers();
  map.addToggle();
  map.legendTitle('Gun Control Strictness by Gender in the United States');
  map.addLegend();
  addEventListeners();

};
