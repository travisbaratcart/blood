app.controller('ProfileController', ['$routeParams' , 'Profile', '$rootScope', 'donor', function($routeParams, Profile, $rootScope, donor) {
  let ProfileCtrl = this;

  ProfileCtrl.user = donor;

  ProfileCtrl.bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  ProfileCtrl.hospitals = [];

  ProfileCtrl.edit = false;

  ProfileCtrl.Edit = function() {
    ProfileCtrl.edit = !ProfileCtrl.edit;
  };

  ProfileCtrl.getlatlong = () => {
    let address = document.getElementById('address').value;
    // address = address || 'Ferrol, Galicia, Spain';
    // Initialize the Geocoder
    let geocoder = new google.maps.Geocoder();
    if (geocoder) {
      geocoder.geocode({
        'address': address
      }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          ProfileCtrl.user.latitude = results[0].geometry.location.lat();
          ProfileCtrl.user.longitude = results[0].geometry.location.lng();
        }
      });
    }
  };


  ProfileCtrl.updateUser = () => {
    Profile.update(ProfileCtrl.user)
    .then((profile) => {
      ProfileCtrl.user = profile;
      ProfileCtrl.Edit();
    })
    .catch((error) => {
      console.error(error);
    });
  };


  let displayUser = function () {
    Profile.get(ProfileCtrl.id)
    .then((user) => {
      ProfileCtrl.user = user;
      findFavoriteHospitals(user);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  let findFavoriteHospitals = (user) => {
    user.appointments.forEach(appointment => {
      let hospitalIndex = ProfileCtrl.hospitals.findIndex(hospital => hospital.model.name === appointment.hospital.name);
      if (hospitalIndex > -1) {
        ProfileCtrl.hospitals[hospitalIndex].numVisits++;
      } else {
        ProfileCtrl.hospitals.push({model: appointment.hospital, numVisits: 1});
      }
    });


    if (ProfileCtrl.hospitals.length) {
      ProfileCtrl.hospitals.sort((a, b) => a.numVisits - b.numVisits);
    }
  };

  findFavoriteHospitals(ProfileCtrl.user);

  ProfileCtrl.upcoming = event => {
    let offset = new Date(event.time) - new Date();
    return offset > 0;
  };

  ProfileCtrl.past = event => {
    let offset = new Date(event.time) - new Date();
    return offset < 0;
  };

}]);
