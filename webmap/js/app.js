var mapID1 = 'map1',
  mapID2 = 'map2',
  mapID3 = 'map3'
  mapID4 = 'map4',
  mapID5 = 'map5';
// usData,
// groupAData,
// groupBData,
// geojsonData = [],



function GVMap() {
  var _gvmap = {};

  var _map,
    _usData,
    _groupAData,
    _groupBData,
    _lyrUS,
    _lyrGroupA,
    _lyrGroupB,
    _groupLabels,
    _groupColors,
    _toggle,
    _legend,
    _tooltipTitle;

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
      },
      onEachFeature: function(feature, lyr) {
        lyr.on('mouseover', function(evt) {
          this.setStyle({ weight: 4 });
        });
        lyr.on('mouseout', function(evt) {
          this.setStyle({ weight: 2 });
        });
        // lyr.on('click', function(evt) {
        //   _map.fitBounds(this.getBounds());
        // });
      }
    }).addTo(_map);
    _lyrUS.bringToBack();
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
      },
      onEachFeature: function(feature, lyr) {
        lyr.on('mouseover', function(evt) {
          this.setStyle({ stroke: true, weight: 3, color: '#888'});
        });
        lyr.on('mouseout', function(evt) {
          this.setStyle({ stroke: false });
        });
        lyr.on('click', function(evt) {
          this.bindTooltip('<h6>' + _tooltipTitle + '</h6>Group: ' + this.feature.properties.group + '<br>Answer: ' + this.feature.properties.answer, {
            permanent: false
          });
        });
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
      },
      onEachFeature: function(feature, lyr) {
        //console.log(feature);
        lyr.on('mouseover', function(evt) {
          this.setStyle({ stroke: true, weight: 3, color: '#888'});
        });
        lyr.on('mouseout', function(evt) {
          this.setStyle({ stroke: false });
        });
        lyr.on('click', function(evt) {
          this.bindTooltip('<h6>' + _tooltipTitle + '</h6>Group: ' + this.feature.properties.group + '<br>Answer: ' + this.feature.properties.answer, {
            permanent: false
          });
        });
      }
    }).addTo(_map);
  };

  _gvmap.addToggle = function() {
    // console.log(_groupLabels);
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

  _gvmap.tooltipTitle = function(title) {
    if (!arguments.length) return _ltooltipTitle;
    _tooltipTitle = title;
  }


  return(_gvmap);
};


function addEventListeners(mapID) {
  var mapID = '#' + mapID;
  // toggle
  document.querySelectorAll(mapID + ' .toggle input').forEach(function(el) {
    el.addEventListener('click', function(evt) {
      //console.log(evt.target, evt.target.value, evt.target.checked, evt.target.classList);
      var targetClass = evt.target.classList[0];
      if (evt.target.checked) {
        document.querySelectorAll(mapID + ' .' + targetClass).forEach(function(m) {m.style.fillOpacity = '1';});
      } else {
        document.querySelectorAll(mapID + ' .' + targetClass).forEach(function(m) {m.style.fillOpacity = '0';});
      }
    });
  });
};


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

function loadData(geoJSONFiles, mapObj) {
  var geojsonData = [];
  // loop through each file
  var count = 0;
  geoJSONFiles.forEach(function (file, i) {
    loadFile(file, function (responseText) {
      count += 1;
      // console.log(count, geojsonData);
      geojsonData[i] = JSON.parse(responseText);
      if (count === geoJSONFiles.length) {
        loadMaps(geojsonData, mapObj);
      }
    });
  });
};

function loadMaps(geojsonData, mapObj) {
  var usData, groupAData, groupBData;
  geojsonData.forEach(function(geojson) {
    console.log(geojson);//, geojson.features[0].geometry.type);
    if (geojson.features[0].geometry.type === 'MultiPolygon') {
      usData = geojson;
    } else if (geojson.features[0].properties.group === mapObj.groupKey) {
      groupAData = geojson;
    } else {
      groupBData = geojson;
    }
  });
  var map = GVMap();
  map.groupLabels(mapObj.gl);
  map.groupColors(mapObj.gc);
  map.legendKeyLabels(mapObj.lkl)
  map.usData(usData);
  map.groupAData(groupAData);
  map.groupBData(groupBData)
  map.renderMap(mapObj.mapID);
  map.renderLayers();
  map.addToggle();
  map.legendTitle(mapObj.lt);
  map.addLegend();
  map.tooltipTitle(mapObj.tt);
  addEventListeners(mapObj.mapID);
};

var geoJSONFiles = [
  './data/states_pop.geojson',
  './data/female_random_points.geojson',
  './data/male_random_points.geojson'
  ],
  mapObj = {
    mapID: 'map1',
    gl: ['Female', 'Male'],
    gc: [['#fdae61', '#2b83ba'],['#c2a5cf', '#008837']],
    lkl: ['Less gun control', 'Laws are about right', 'More gun control'],
    lt: 'Gun Control Strictness by Gender in the United States',
    tt: 'Do you want more or less strict gun laws?',
    groupKey: 'Female'
}
loadData(geoJSONFiles, mapObj);

var geoJSONFiles = [
  './data/states_pop.geojson',
  './data/college_random_points.geojson',
  './data/belowcollege_random_points.geojson'
  ],
  mapObj = {
    mapID: 'map2',
    gl: ['BelowCollege', 'College'],
    gc: [['#a6611a', '#018571'],['#d01c8b', '#4dac26']],
    lkl: ['Almost no one', 'In the middle', 'Almost everyone'],
    lt: 'Who Should Own Guns in the US by Education',
    tt: 'Who should be legally allowed to own guns in the US?',
    groupKey: 'BelowCollege'
}
loadData(geoJSONFiles, mapObj);

var geoJSONFiles = [
  './data/states_pop.geojson',
  './data/democrat_random_points.geojson',
  './data/republican_random_points.geojson'
  ],
  mapObj = {
    mapID: 'map3',
    gl: ['Democrat', 'Republican'],
    gc: [['#e66101', '#5e3c99'],['#ca0020', '#0571b0']],
    lkl: ['Almost all types', 'In the middle', 'Almost no types'],
    lt: 'What Kinds of Guns Should be Legal in the US by Political Party',
    tt: 'What types of guns should be legally available to buy in the US?',
    groupKey: 'Democrat'
}
loadData(geoJSONFiles, mapObj);

var geoJSONFiles = [
  './data/states_pop.geojson',
  './data/lowincome_random_points.geojson',
  './data/highincome_random_points.geojson'
  ],
  mapObj = {
    mapID: 'map4',
    gl: ['LowMediumIncome', 'HighIncome'],
    gc: [['#d7191c', '#2b83ba'],['#e66101', '#5e3c99']],
    lkl: ['Strongly oppose', 'In the middle', 'Strongly in favor'],
    lt: 'Should People with Mental Illness be Allowed to Buy Guns in the US by Income',
    tt: 'Should a person with a mental illness be allowed to buy a gun in the US?',
    groupKey: 'LowMediumIncome'
}
loadData(geoJSONFiles, mapObj);

var geoJSONFiles = [
  './data/states_pop.geojson',
  './data/white_random_points.geojson',
  './data/nonwhite_random_points.geojson'
  ],
  mapObj = {
    mapID: 'map5',
    gl: ['NonWhite', 'White'],
    gc: [['#e66101', '#5e3c99'],['#ca0020', '#008837']],
    lkl: ['Not a problem', 'In the middle', 'Is a big problem'],
    lt: 'How Much of a Problem is Gun Violence in the US by Race',
    tt: 'How much of a problem is gun violence in the US?',
    groupKey: 'NonWhite'
}
loadData(geoJSONFiles, mapObj);
