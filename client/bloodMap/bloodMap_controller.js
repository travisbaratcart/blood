
app.controller('BloodMapController', ['$window','$routeParams' , '$rootScope', '$scope',  'BloodMap', function($window, $routeParams, $rootScope, $scope, BloodMap) {

  let BloodMapCtrl = this;

  let sites = [
      ['American Red Cross', 37.788513, -122.399940, 1, ],
      ['LapCorp', 37.788405, -122.409769, 2, ],
      ['SF city clinic', 37.775891, -122.407163, 3, ]
  ];

  BloodMapCtrl.hospitals=[];

  let geoobj = {
    minLat: '',
    maxLat: '',
    minLong:'',
    maxLong:''
  };

  let chart;

  nv.addGraph(function() {
    chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.label})
        .y(function(d) { return d.value})
        .height(180)
        .barColor(function(){return '#700000';})
        .margin({left: 100})
        .showValues(true)
        .showControls(false);
    chart.yAxis.tickFormat(d3.format(',.2f'));
    chart.yAxis.axisLabel('Number of Donations').axisLabelDistance(5);
    update();
    nv.utils.windowResize(chart.update);
    $scope.$emit('chartinit');
    return chart;
  });

  let update = () => {
    d3.select('#chart1 svg')
      .datum($scope.donordata)
      .call(chart);
  };

  $scope.$watch('$scope.donordata', function() {
      update();
  });

  $scope.$on('chartinit', update);


  let initializeMaps = function () {

    if(navigator.geolocation){
      // timeout at 60000 milliseconds (60 seconds)
      let options = {timeout:60000};
      navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
    }
    let mapProp = {
            // center:new google.maps.LatLng(37.783697,-122.408966),
            center: new google.maps.LatLng($rootScope.latitude,$rootScope.longitude),
            zoom:17,
            mapTypeId:google.maps.MapTypeId.ROADMAP
          };
    BloodMapCtrl.map = new google.maps.Map(document.getElementById("googleMap"),mapProp);

    let GeoMarker = new GeolocationMarker(BloodMapCtrl.map);
    GeoMarker.setCircleOptions({fillColor: '#808080'});

    google.maps.event.addDomListener(window, 'load', initializeMaps);
    google.maps.event.addListener(BloodMapCtrl.map, 'bounds_changed', _.throttle(function() { setBounds(); gethospitals($scope.bounds);getdonors($scope.bounds);}, 400));
    google.maps.event.addListenerOnce(BloodMapCtrl.map, 'tilesloaded', function(){setBounds(); gethospitals($scope.bounds);getdonors($scope.bounds);});

    ////////////////////////////////////////
    //       BEHOLD, THE FORBIDDEN ZONE.
    ////////////////////////////////////////


    $scope.options = {
      chart: {
        type: 'discreteBarChart',
        height: 200,
        x: function(d){return d.label;},
        y: function(d){return d.value;},
        showValues: true,
        color: function(){return '#700000';},
        valueFormat: function(d){ return d3.format(',f')(d); },
        dispatch: {

        },
        discretebar: {
          dispatch: {
            elementClick: function(e) {$scope.$apply();}
            }
          },
        callback: function(e){}
      }
    };

    $scope.data = [
      {
        key: "Blood Levels",
        "color": "#1f77b4",
        values: [
                {
                  "label" : "O+" ,
                  "value" : 6
                },
                {
                  "label" : "O-" ,
                  "value" : 5
                },
                {
                  "label" : "A+" ,
                  "value" : 18
                },
                {
                  "label" : "A-" ,
                  "value" : 8
                },
                {
                  "label" : "B+" ,
                  "value" : 17
                },
                {
                  "label" : "B-" ,
                  "value" : 7
                },
                {
                  "label" : "AB+" ,
                  "value" : 16
                },
                {
                  "label" : "AB-" ,
                  "value" : 6
                }
        ]
      }
    ];

    ////////////////////////////////////////
    //  FAREWELL, FROM THE FORBIDDEN ZONE.
    ////////////////////////////////////////
    ///Donor bloor rank chart
 $scope.donordata = [
           {
            key: "",
            values: [
                {
                    "label" : "Donor1" ,
                    "value" : 15
                } ,
                {
                    "label" : "Donor2" ,
                    "value" : 10
                } ,
                {
                    "label" : "Donor3" ,
                    "value" : 8
                } ,
                {
                    "label" : "Donor4" ,
                    "value" : 5
                } ,
                {
                    "label" : "Donor5" ,
                    "value" : 2
                }
            ]
          }

     ];

    ///Donor bloor rank chart
//////////

    GeoMarker.setMap(BloodMapCtrl.map);
    setZoom(BloodMapCtrl.map, sites);
    setMarkers(BloodMapCtrl.map, sites);

  };

  let setBounds = () => {
    $scope.bounds = BloodMapCtrl.map.getBounds();
  };

  let gethospitals = (bounds) => {
     geoobj.minLat = $scope.bounds.H.H;
     geoobj.maxLat = $scope.bounds.H.j;
     geoobj.minLong= $scope.bounds.j.j;
     geoobj.maxLong= $scope.bounds.j.H;
    BloodMap.getMap(geoobj)
    .then(function (list) {
      BloodMapCtrl.hospitals = [];
      BloodMapCtrl.hospitals = list;
      // setZoom(BloodMapCtrl.map, BloodMapCtrl.hospitals);

      //Each time new hospitals are loaded in, reset all blood
      //level data to 0.
      for(var j = 0; j < $scope.data[0].values.length; j++){
        $scope.data[0].values[j].value = 0;
      }

      //For each hospital, add their blood stocks to the data object
      //so we can get the total for every hospital in the area.
      for(var i = 0; i < BloodMapCtrl.hospitals.length; i++) {
        $scope.data[0].values[0].value += BloodMapCtrl.hospitals[i].opos;
        $scope.data[0].values[1].value += BloodMapCtrl.hospitals[i].oneg;
        $scope.data[0].values[2].value += BloodMapCtrl.hospitals[i].apos;
        $scope.data[0].values[3].value += BloodMapCtrl.hospitals[i].aneg;
        $scope.data[0].values[4].value += BloodMapCtrl.hospitals[i].bpos;
        $scope.data[0].values[5].value += BloodMapCtrl.hospitals[i].bneg;
        $scope.data[0].values[6].value += BloodMapCtrl.hospitals[i].abpos;
        $scope.data[0].values[7].value += BloodMapCtrl.hospitals[i].abneg;
      }
      setMarkers(BloodMapCtrl.map, BloodMapCtrl.hospitals);
    })
    .catch(function (error) {
      console.error(error);
    });


  };
   ///Donor bloor rank chart
//getdonors function to get the top 5 donors
  let getdonors = (bounds) => {
    geoobj.minLat = $scope.bounds.H.H;
    geoobj.maxLat = $scope.bounds.H.j;
    geoobj.minLong= $scope.bounds.j.j;
    geoobj.maxLong= $scope.bounds.j.H;
    BloodMap.getDonors(geoobj)
    .then(function (donors) {
      for(let i=0; i<5; i++){
          $scope.donordata[0].values[i].value = 0;
          $scope.donordata[0].values[i].label = '';
        }
      //Assign the top 5 donors name to the $scope.data[0].values[i].label
      //Assign the top 5 donors donotion count to the $scope.data[0].values[i].value
      if(donors.length > 0) {
        for(let i=0; i< donors.length; i++){
          if(donors[i].appointments.length > 0) {
            $scope.donordata[0].values[i].value = donors[i].appointments.length;
            $scope.donordata[0].values[i].label = donors[i].name;
          }
        }
        update();
      }
      update();

    });
  };
  ///Donor bloor rank chart


 let showLocation = (position) => {
    $rootScope.latitude = position.coords.latitude;
    $rootScope.longitude = position.coords.longitude;
  };

  let errorHandler = (err) => {
      if(err.code == 1) {
         alert("Error: Access is denied!");
      }
   };

  let lastOpenedInfoWindow;

  let setMarkers = (map, markers) => {

    for (let i = 0; i < markers.length; i++) {
      let site = markers[i];

      let siteLatLng = new google.maps.LatLng(site.latitude, site.longitude);

      let infowindow = new google.maps.InfoWindow({
        content: "Hospitals near you",
        maxWidth: 310
      });

      let marker = new google.maps.Marker({
        position: siteLatLng,
        map: map,
        title: site.name,
        html: site.hospitalurl

      });


      let streetimg = null;
      //Content in the infowindow
      let iwContent = '<div id="iw_container">' +
      `<div class="iw_title"> ${site.name}</div>` +
      `<div class="iwf"><div class="iw_content"> ${site.address}</div>` +
      `<div class="iw_content"> <a href="${site.hospitalurl}"> ${site.hospitalurl} </a></div>` +
      `<div class="iw_content"> Call: ${site.phonenum} </div>` +
      `<div class="iw_content"> Profile: <a href="/hospital/profile/${site.id}">Click Here</a></div>` +
      `<div class="iw_content"> <button type="button" class="btn btn-default"> <a href="/calendar/${site.id}">
      Make Appointment</a></button></div></div>` +
      `<div id="street"  style="width:120px;height:120px"></div></div>`;

      //Remove div around the InfoWindow
      google.maps.event.addListener(infowindow, 'domready', function() {
       var iwOuter = $('.gm-style-iw');
       var iwBackground = iwOuter.prev();
       iwBackground.children(':nth-child(2)').css({'display' : 'none'});
       iwBackground.children(':nth-child(4)').css({'display' : 'none'});
       iwOuter.children(':nth-child(0)').css({'display' : 'none','overflow': 'auto'});

        streetimg = new google.maps.StreetViewPanorama(document.getElementById("street"), {
          zoom:3,
          navigationControl: true,
          enableCloseButton: false,
          addressControl: false,
          linksControl: false
        });
        streetimg.bindTo("position", marker);
        streetimg.setVisible(true);
      });

      //Open the infowindow on click and close the previous one
      marker.addListener('click', function() {
        closeLastOpenedInfoWindow();
        infowindow.setContent(iwContent);
        infowindow.open(map, marker);
        lastOpenedInfoWindow = infowindow;

      });
    }
  };

let closeLastOpenedInfoWindow = () => {
  if (lastOpenedInfoWindow) {
      lastOpenedInfoWindow.close();
  }
};
/*
Set the zoom to fit comfortably all the markers in the map
*/
let setZoom = (map, markers) => {
  let boundbox = new google.maps.LatLngBounds();
  for ( let i = 0; i < markers.length; i++ )
  {
    boundbox.extend(new google.maps.LatLng(markers[i][1], markers[i][2]));
    //boundbox.extend(new google.maps.LatLng(markers[i].latitude, markers[i].longitude));
  }
  map.setCenter(boundbox.getCenter());
  map.fitBounds(boundbox);

};

  initializeMaps();
}]);





