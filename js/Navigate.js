/* js/navigate.js */

document.addEventListener("DOMContentLoaded", function() {
  // Global variables
  var map;
  var course = null;
  var currentWaypointIndex = 0;
  var userMarker = null;
  var coursePolyline = null;
  var watchId = null;
  var currentHeading = 0;
  var windAdjustment = 0;
  var trueNorthAdjustment = 0;
  var compassView = false;

  // Initialize the map
  map = L.map('map').setView([0, 0], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Populate the course dropdown
  var courseSelect = document.getElementById("courseSelect");
  var courses = loadCourses();
  for (var key in courses) {
    var option = document.createElement("option");
    option.value = key;
    option.textContent = courses[key].name;
    courseSelect.appendChild(option);
  }

  // Load Course button event
  document.getElementById("loadCourse").addEventListener("click", function() {
    var selectedCourseKey = courseSelect.value;
    if (!selectedCourseKey) {
      alert("Please select a course.");
      return;
    }
    course = courses[selectedCourseKey];
    currentWaypointIndex = 0;
    loadCourseOnMap(course);
  });

  function loadCourseOnMap(course) {
    // Remove existing polyline if present
    if (coursePolyline) {
      map.removeLayer(coursePolyline);
    }
    var latlngs = course.waypoints.map(function(wp) {
      return [wp.lat, wp.lng];
    });
    coursePolyline = L.polyline(latlngs, { color: 'red' }).addTo(map);
    // Adjust map view to fit the course
    map.fitBounds(coursePolyline.getBounds());
  }

  // Start Race button event
  document.getElementById("startRace").addEventListener("click", function() {
    if (!course) {
      alert("Please load a course first.");
      return;
    }
    // Get wind and true north adjustments
    windAdjustment = parseFloat(document.getElementById("windAdjustment").value) || 0;
    trueNorthAdjustment = parseFloat(document.getElementById("trueNorthAdjustment").value) || 0;
    // Start tracking user position
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, { enableHighAccuracy: true });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
    // Listen for device orientation events
    window.addEventListener("deviceorientation", onDeviceOrientation);
  });

  function onPositionUpdate(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var userLatLng = L.latLng(lat, lng);
    // Create or update user marker
    if (!userMarker) {
      userMarker = L.marker(userLatLng, { icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })}).addTo(map);
    } else {
      userMarker.setLatLng(userLatLng);
    }
    // Update navigation instructions
    updateNavigation(userLatLng);
  }

  function onPositionError(error) {
    console.error("Error obtaining position: ", error);
  }

  function onDeviceOrientation(event) {
    // Use webkitCompassHeading if available (iOS)
    if (event.absolute === true || event.webkitCompassHeading) {
      currentHeading = event.webkitCompassHeading || event.alpha;
      if (userMarker && course) {
        updateNavigation(userMarker.getLatLng());
      }
    }
  }

  function updateNavigation(userLatLng) {
    if (!course || currentWaypointIndex >= course.waypoints.length) return;
    var nextWaypoint = course.waypoints[currentWaypointIndex];
    var waypointLatLng = L.latLng(nextWaypoint.lat, nextWaypoint.lng);
    // Calculate bearing from the user to the next waypoint
    var bearing = calculateBearing(userLatLng.lat, userLatLng.lng, waypointLatLng.lat, waypointLatLng.lng);
    // Apply wind and true north adjustments
    var adjustedBearing = bearing + windAdjustment + trueNorthAdjustment;
    adjustedBearing = (adjustedBearing + 360) % 360;
    // Compute the difference between adjusted bearing and current heading
    var headingDiff = adjustedBearing - currentHeading;
    headingDiff = ((headingDiff + 540) % 360) - 180; // Normalize to -180 to 180
    var directionInstruction = "";
    if (headingDiff > 0) {
      directionInstruction = "Turn Right " + Math.round(headingDiff) + "°";
    } else if (headingDiff < 0) {
      directionInstruction = "Turn Left " + Math.abs(Math.round(headingDiff)) + "°";
    } else {
      directionInstruction = "On course";
    }
    document.getElementById("directionInstruction").textContent = directionInstruction;

    // Calculate distance to the waypoint using Leaflet's distance function
    var distance = userLatLng.distanceTo(waypointLatLng);
    var distanceInfo = "";
    if (distance < 1852) {
      distanceInfo = Math.round(distance) + " meters";
    } else {
      distanceInfo = (distance / 1852).toFixed(1) + " nautical miles";
    }
    document.getElementById("distanceInfo").textContent = "Distance to waypoint: " + distanceInfo;

    // Update compass needle rotation in compass view
    if (compassView) {
      var needle = document.getElementById("compassNeedle");
      needle.style.transform = "rotate(" + (-headingDiff) + "deg)";
    }
  }

  // Next and Previous waypoint controls
  document.getElementById("nextWaypoint").addEventListener("click", function() {
    if (!course) return;
    if (currentWaypointIndex < course.waypoints.length - 1) {
      currentWaypointIndex++;
      alert("Advanced to waypoint: " + course.waypoints[currentWaypointIndex].name);
    } else {
      alert("This is the final waypoint.");
    }
  });

  document.getElementById("prevWaypoint").addEventListener("click", function() {
    if (!course) return;
    if (currentWaypointIndex > 0) {
      currentWaypointIndex--;
      alert("Moved back to waypoint: " + course.waypoints[currentWaypointIndex].name);
    } else {
      alert("This is the starting waypoint.");
    }
  });

  // Toggle between Map and Compass view
  document.getElementById("toggleView").addEventListener("click", function() {
    var mapDiv = document.getElementById("map");
    var compassDiv = document.getElementById("compass");
    if (compassView) {
      compassDiv.style.display = "none";
      mapDiv.style.display = "block";
      compassView = false;
    } else {
      mapDiv.style.display = "none";
      compassDiv.style.display = "flex";
      compassView = true;
    }
  });
});
