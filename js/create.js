/* js/create.js */

document.addEventListener("DOMContentLoaded", function() {
  // Initialize map
  var map = L.map('map').setView([0, 0], 15);

  // Add OSM tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      map.setView([lat, lng], 15);
    }, function(error) {
      console.error("Error getting location: ", error);
    });
  } else {
    console.error("Geolocation not supported.");
  }

  // Arrays to store waypoints and marker objects
  var waypoints = [];
  var markers = [];
  // Polyline to connect waypoints
  var polyline = L.polyline([], { color: 'blue' }).addTo(map);

  // Handle map clicks to add waypoints
  map.on('click', function(e) {
    var waypointName = prompt("Enter waypoint name:");
    if (waypointName !== null && waypointName.trim() !== "") {
      var latlng = e.latlng;
      // Create marker with draggable enabled
      var marker = L.marker(latlng, { draggable: true }).addTo(map);
      marker.bindPopup(waypointName);
      // Save waypoint data
      var waypoint = {
        name: waypointName,
        lat: latlng.lat,
        lng: latlng.lng,
        marker: marker
      };
      waypoints.push(waypoint);
      markers.push(marker);
      updatePolyline();

      // Update waypoint position on drag
      marker.on('dragend', function(event) {
        var newLatLng = event.target.getLatLng();
        waypoint.lat = newLatLng.lat;
        waypoint.lng = newLatLng.lng;
        updatePolyline();
      });

      // Remove waypoint on right-click
      marker.on('contextmenu', function(e) {
        map.removeLayer(marker);
        waypoints = waypoints.filter(function(wp) {
          return wp.marker !== marker;
        });
        markers = markers.filter(function(m) {
          return m !== marker;
        });
        updatePolyline();
      });
    }
  });

  function updatePolyline() {
    var latlngs = waypoints.map(function(wp) {
      return [wp.lat, wp.lng];
    });
    polyline.setLatLngs(latlngs);
  }

  // Save Course button event
  document.getElementById("saveCourse").addEventListener("click", function() {
    var courseName = document.getElementById("courseName").value.trim();
    if (courseName === "") {
      alert("Please enter a course name.");
      return;
    }
    if (waypoints.length === 0) {
      alert("Please add at least one waypoint.");
      return;
    }
    // Create course object with waypoints
    var course = {
      name: courseName,
      waypoints: waypoints.map(function(wp) {
        return { lat: wp.lat, lng: wp.lng, name: wp.name };
      })
    };

    // Save the course using the common.js helper
    saveCourse(course);
    alert("Course saved successfully!");
    // Optionally, clear the map for a new course
    markers.forEach(function(marker) {
      map.removeLayer(marker);
    });
    markers = [];
    waypoints = [];
    updatePolyline();
    document.getElementById("courseName").value = "";
  });
});
