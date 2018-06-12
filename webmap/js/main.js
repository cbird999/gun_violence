var mymap,
  lyrOSM,
  lyrUS,
  lyrPoints,
  regions = ['South', 'Northeast', 'Midwest', 'West'],
  ctlAttribute,
  ctlEasy,
  ctlSidebar,
  pewData;

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

document.addEventListener('DOMContentLoaded', function(){
  mymap = L.map('mapdiv', {
    center: [19.4, -99.2],
    zoom: 13,
    zoomControl: true,
    maxZoom: 19,
    minZoom: 1,
    dragging: true,
    attributionControl: false});

  // lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
  // mymap.addLayer(lyrOSM);


  ctlAttribute = L.control.attribution({
    position: 'bottomleft'
  });
  ctlAttribute.addAttribution('<a href="https://www.openstreetmap.org/">OSM</a>');
  ctlAttribute.addAttribution('<a href="http://datavis.thebirdery.com">CBIRD</a>')
  ctlAttribute.addTo(mymap);

  // ctlEasy = L.easyButton('fab fa-affiliatetheme', function() {
  //   ctlSidebar.toggle()
  // }).addTo(mymap);
  //
  // ctlSidebar = L.control.sidebar('sidebar', {
  //   position: 'left',
  //   autoPan: true,
  // }).addTo(mymap);
  var toggle = L.control({position: 'topright'});
  toggle.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info toggle'),
      html;
    html = '<ul>' +
      '<li><input type="checkbox" class="Male" checked>Male</input></li>' +
      '<li><input type="checkbox" class="Female" checked>Female</input></li>' +
      '</ul>';

    div.innerHTML = html;
    return div;
  };
  toggle.addTo(mymap);

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

  var legend = L.control({position: 'bottomright'});
  var legendTitle = 'Gun Control Strictness by Gender in the United States',
    groupAName = 'Male',
    groupBName = 'Female';

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = ['low', 'neutral', 'high'],
          labels = [],
          html;
      html = '<h6 class="legend-title">' + legendTitle + '</h6>';
      html += '<div class="label-groupA">' +
        '<span>' + groupAName + '</span>' +
        '<i style="background-color: #fdae61; opacity: 1"></i>' +
        '<i style="background-color: #aaa; opacity: 1"></i>' +
        '<i style="background-color: #2b83ba; opacity: 1"></i>' +
      '</div>' +
      '<div class="legend-labels">' +
        '<span>&nbsp</span>' +
        '<span>Low</span>' +
        '<span>Neutral</span>' +
        '<span>High</span>' +
      '</div>' +
      '<div class="label-groupB">' +
        '<span>Female</span>' +
        '<i style="background-color: #c2a5cf; opacity: 1"></i>' +
        '<i style="background-color: #aaa; opacity: 1"></i>' +
        '<i style="background-color: #008837; opacity: 1"></i>' +
      '</div>';
      // html += '<span class="groupA">' + groupAName + '</span><span class="groupB">' + groupBName + '</span>';
      // ['low', 'neutral', 'high'].forEach(function(level) {
      //   html += '<i style="background:' + groupAFillColors[level] + '"></i><span>' + level + '</span><i style="background:' + groupBFillColors[level] + '"></i>'
      // });
      div.innerHTML = html;
      // loop through our density intervals and generate a label with a colored square for each interval
      // for (var i = 0; i < grades.length; i++) {
      //     div.innerHTML +=
      //         '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      //         grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      // }

      return div;
  };

  legend.addTo(mymap);

});



function latLngToArrayString(ll) {
  return '<br>Lat: ' + ll.lat.toFixed(5) + ', ' + 'Lng: ' + ll.lng.toFixed(5);
}

// define function to generate random points in polygon
// ak = lyrUS.getLayers()[1]
// var pt = randomPointInPoly(ak)
// L.geoJSON(pt).addTo(mymap);
randomPointInPoly = function(state, classArray) {
  var bounds = state.getBounds();
  var x_min  = bounds.getEast();
  var x_max  = bounds.getWest();
  var y_min  = bounds.getSouth();
  var y_max  = bounds.getNorth();

  var lat = y_min + (Math.random() * (y_max - y_min));
  var lng = x_min + (Math.random() * (x_max - x_min));

  var point  = turf.point([lng, lat]);
  var st   = state.toGeoJSON();
  var inside = turf.inside(point, st);

  if (inside) {
    var lat = point.geometry.coordinates[1],
      lng = point.geometry.coordinates[0];
    var cm = L.circle([lat, lng], {
      radius: 2,
      className: (classArray[0] + ' ' + classArray[1])
    });
    cm.addTo(mymap);
    //return cm;
      // L.geoJSON(point).addTo(mymap);
  } else {
      return randomPointInPoly(state, classArray);
  }
}

var traits = ['Male', 'Female']
// we need a function to load files
// done is a "callback" function
// so you call it once you're finished and pass whatever you want
// in this case, we're passing the `responseText` of the XML request
var loadFile = function (filePath, done) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () { return done(this.responseText) }
    xhr.open("GET", filePath, true);
    xhr.send();
}
// paths to all of your files
var myFiles = [
  './data/states_pop.geojson',
  './data/gender_strictness.json',
  './data/random_points.geojson'
];
// where you want to store the data
var jsonData = [];

function getFillColor(group, level) {
  if (group == 'Male') {
    return '#9e9ac8';
    if (groupAFillColors.hasOwnProperty(level)) {
      return groupAFillColors[level];
    } else {
      return '#eeeeee';
    }
  } else {
    return '#fd8d3c';
    if (groupBFillColors.hasOwnProperty(level)) {
      return groupBFillColors[level];
    } else {
      return '#eeeeee';
    }
  }
};

function getFillOpactity(group, level) {
  if (group == 'Male') {
    if (groupFillOpacity.hasOwnProperty(level)) {
      return groupFillOpacity[level];
    } else {
      return 1;
    }
  } else {
    if (groupFillOpacity.hasOwnProperty(level)) {
      return groupFillOpacity[level];
    } else {
      return 1;
    }
  }
};
// function getFillColor(group, level) {
//   if (group == 'Male') {
//     switch(level) {
//       case 'low':
//         return '#e7e1ef';
//       case 'neutral':
//         return '#c994c7';
//       case 'high':
//         return '#dd1c77';
//       default:
//         return '#dddddd';
//     }
//   } else {
//     switch(level) {
//       case 'low':
//         return '#fee8c8';
//       case 'neutral':
//         return '#fdbb84';
//       case 'high':
//         return '#e34a33';
//       default:
//         return '#dddddd';
//     }
//   }
// };

Array.prototype.unique = function() {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

// loop through each file
myFiles.forEach(function (file, i) {
    // and call loadFile
    // note how a function is passed as the second parameter
    // that's the callback function
    loadFile(file, function (responseText) {
        // we set jsonData[i] to the parse data since the requests
        // will not necessarily come in order
        // so we can't use JSONdata.push(JSON.parse(responseText));
        // if the order doesn't matter, you can use push
        jsonData[i] = JSON.parse(responseText);
        console.log(i, jsonData[i]);
        if (jsonData[i].hasOwnProperty('type')){
          if (jsonData[i].features.length < 51) {
            lyrUS = L.geoJSON(jsonData[i],{
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
            }).addTo(mymap);
            lyrUS.bringToBack();
            mymap.fitBounds(lyrUS.getBounds());
            mymap.setZoom(5);
            lyrUS.eachLayer(function(l) {
              var props = l.feature.properties;
              var currentState = props.STUSPS,
                currentRegion = props.region,
                totalPoints = props.ptsPerState;
              var currentPew = pewData.filter(function(d) {
                return d.F_CREGION_FINAL === currentRegion;
              });
              //console.log(currentState, currentRegion, currentPew);
              traits.forEach(function(trait) {
                var traitSet = currentPew.filter(function(d) {
                  return d.F_SEX_FINAL === trait
                });
                // console.log(traitSet);
                traitSet.forEach(function(t) {
                  var traitPoints = Math.floor(totalPoints * t.per) / 4;
                  var traitClasses = [t.F_SEX_FINAL, t.class];
                  // console.log(traitPoints, traitClasses);
                  if (true) { //(currentState === 'AZ') {
                    for (var i = 0; i < traitPoints; i++) {
                      // randomPointInPoly(l, traitClasses)
                    }
                  }
                })
              })
            })
          } else {
            lyrPoints = jsonData[i];
            regions.forEach(function(region) {
              var pewRegion = pewData.filter(function(d) {
                return d.F_CREGION_FINAL === region
              });
              var currRegionPoints = lyrPoints.features.filter(function(d) {
                return d.properties.region === region;
              });
              var currStates = currRegionPoints.map(function(d) {
                return d.properties.STUSPS
              });
              currStates = currStates.unique();
              // console.log(pewRegion, currRegionPoints, currStates);
              currStates.forEach(function(state) {
                statePoints = currRegionPoints.filter(function(d) {
                  return d.properties.STUSPS == state;
                });
                numPoints = statePoints.length;
                currIndex = 0;
                pewRegion.forEach(function(d) {
                  pewPoints = Math.floor(numPoints * d.per),
                    pewClass = d.class,
                    pewGroup = d.F_SEX_FINAL;
                  // console.log(pewPoints, pewClass, pewGroup);

                  endIndex = (currIndex + pewPoints) >= (numPoints - 1) ? (numPoints - 1) : (currIndex + pewPoints);
                  for (var i = currIndex; i < endIndex; i++) {
                    var lat = statePoints[i].geometry.coordinates[1],
                      lng = statePoints[i].geometry.coordinates[0];
                    var cm = L.circleMarker([lat, lng], {
                      radius: 2,
                      stroke: false,
                      fill: true,
                      // fillOpacity: getFillOpactity(pewGroup, pewClass),
                      // fillColor: getFillColor(pewGroup, pewClass),
                      className: (d.F_SEX_FINAL + ' ' + d.class)
                    });
                    cm.addTo(mymap);
                    cm.bringToFront();
                  }
                  currIndex = endIndex;
                })
              });

            });
            // jsonData[i].features.forEach((function(pt) {
            //   var lat = pt.geometry.coordinates[1],
            //     lng = pt.geometry.coordinates[0];
            //   var cm = L.circleMarker([lat, lng], {
            //     radius: 1
            //     // className: (classArray[0] + ' ' + classArray[1])
            //   });
            //   cm.addTo(mymap);
            // }));
          }
        } else {
          pewData = jsonData[i];
        }
        // or you could choose not to store it in an array.
        // whatever you decide to do with it, it is available as
        // responseText within this scope (unparsed!)
    })
});
