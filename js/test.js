/* js/test.js */

document.addEventListener("DOMContentLoaded", function() {
  var latitudeSpan = document.getElementById("latitude");
  var longitudeSpan = document.getElementById("longitude");
  var compassHeadingSpan = document.getElementById("compassHeading");
  var permissionStatus = document.getElementById("permissionStatus");
  var permissionGranted = false;

  // Request device orientation permission if necessary
  document.getElementById("requestPermission").addEventListener("click", function() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(function(permissionState) {
          if (permissionState === 'granted') {
            permissionStatus.textContent = "Device orientation permission granted.";
            permissionGranted = true;
          } else {
            permissionStatus.textContent = "Device orientation permission denied.";
          }
        })
        .catch(function(error) {
          console.error("DeviceOrientationEvent.requestPermission error: ", error);
          permissionStatus.textContent = "Error requesting permission.";
        });
    } else {
      permissionStatus.textContent = "Device orientation permission not required.";
      permissionGranted = true;
    }
  });

  // Watch GPS position and update display
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function(position) {
      latitudeSpan.textContent = position.coords.latitude.toFixed(6);
      longitudeSpan.textContent = position.coords.longitude.toFixed(6);
    }, function(error) {
      console.error("Error watching position: ", error);
    }, { enableHighAccuracy: true });
  } else {
    latitudeSpan.textContent = "Geolocation not supported";
    longitudeSpan.textContent = "Geolocation not supported";
  }

  // Listen for device orientation events and update compass heading
  window.addEventListener("deviceorientation", function(event) {
    var heading = event.webkitCompassHeading || event.alpha;
    if (heading !== null) {
      compassHeadingSpan.textContent = Math.round(heading) + "°";
    } else {
      compassHeadingSpan.textContent = "N/A";
    }
  });
});
