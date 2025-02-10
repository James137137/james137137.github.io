/* js/common.js */

// Key for courses in localStorage
const COURSES_KEY = "courses";

// Sample courses data
const sampleCourses = {
  "JamesTest": {
    "name": "JamesTest",
    "waypoints": [
      {"lat": -36.971097339475314, "lng": 174.8817873001099, "name": "Start"},
      {"lat": -36.97003444305618, "lng": 174.8822271823883, "name": "2"},
      {"lat": -36.97119162795703, "lng": 174.88481283187866, "name": "3"},
      {"lat": -36.97465397011197, "lng": 174.882345199585, "name": "4"},
      {"lat": -36.96220744683523, "lng": 174.85208988189697, "name": "5"},
      {"lat": -36.964196284129635, "lng": 174.92165565490723, "name": "6"}
    ]
  },
  "JamesTest2": {
    "name": "JamesTest2",
    "waypoints": [
      {"lat": -36.97092349478092, "lng": 174.88171219825745, "name": "Start"},
      {"lat": -36.97003203223594, "lng": 174.88199919462204, "name": "2"},
      {"lat": -36.97118493133576, "lng": 174.88121867179873, "name": "3"},
      {"lat": -36.9718042323785, "lng": 174.88199114799502, "name": "4"},
      {"lat": -36.97125993346033, "lng": 174.88132864236835, "name": "5"},
      {"lat": -36.97093635233739, "lng": 174.88170683383944, "name": "6"}
    ]
  },
  "Jack Test": {
    "name": "Jack Test",
    "waypoints": [
      {"lat": -36.930336639968445, "lng": 174.92064714431766, "name": "Start"},
      {"lat": -36.92995070667834, "lng": 174.92098510265353, "name": "End"},
      {"lat": -36.93040525012657, "lng": 174.9207812547684, "name": "End 2"}
    ]
  }
};

// Initialize courses in localStorage if not present
function initializeCourses() {
  if (!localStorage.getItem(COURSES_KEY)) {
    localStorage.setItem(COURSES_KEY, JSON.stringify(sampleCourses));
  }
}

// Save a course to localStorage
function saveCourse(course) {
  initializeCourses();
  let courses = JSON.parse(localStorage.getItem(COURSES_KEY));
  courses[course.name] = course;
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

// Load courses from localStorage
function loadCourses() {
  initializeCourses();
  return JSON.parse(localStorage.getItem(COURSES_KEY));
}

// Utility function to calculate bearing between two lat/lng pairs in degrees
function calculateBearing(lat1, lng1, lat2, lng2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  let phi1 = lat1 * toRad;
  let phi2 = lat2 * toRad;
  let deltaLng = (lng2 - lng1) * toRad;
  let y = Math.sin(deltaLng) * Math.cos(phi2);
  let x = Math.cos(phi1) * Math.sin(phi2) -
          Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng);
  let brng = Math.atan2(y, x) * toDeg;
  return (brng + 360) % 360; // Normalize to 0-360
}
