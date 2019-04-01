const fs = require("fs");

const turf = require("@turf/turf");

let bikeNetwork = JSON.parse(
  fs.readFileSync(__dirname + "/../.data/bike_network.geojson")
);
let cities = JSON.parse(
  fs.readFileSync(__dirname + "/../.data/cities.geojson")
);
let segments = JSON.parse(
  fs.readFileSync(__dirname + "/../.data/street_segments.geojson")
);

const bbox = turf.bbox(cities);

const streetSegmentTypeMap = {
  "1110": "Freeway",
  "1120": "Ramps, Interchanges(one Freeway to another)",
  "1121":
    "On - Ramp or Slip Road Linkage(used to enter a Freeway or lower class road)",
  "1122":
    "Off - Ramp or Slip Road Linkage(used to exit a Freeway or lower class road)",
  "1123":
    "On / Off - Ramp or Slip Road Linkage(used to enter or exit a Freeway or lower class road)",
  "1200": "Highway",
  "1221":
    "On - Ramp or Slip Road Linkage(used to enter a Highway or lower class road)",
  "1222":
    "Off - Ramp or Slip Road Linkage(used to exit a Highway or lower class road)",
  "1223":
    "On / Off - Ramp or Slip Road Linkage(used to enter or exit a Highway or lower class road)",
  "1300": "Primary Arterial",
  "1321":
    "Primary Arterial Linkage(ramp/ slip road used to enter or exit a Primary Arterial or loser class road)",
  "1400": "Arterial",
  "1421":
    "Arterial Linkage(ramp / slip road used to enter or exit an Arterial or lower class road)",
  "1450": "Tertiary Street - Neighborhood Collector",
  "1471":
    "Tertiary Street Linkage(ramp / slip road used to enter a Tertiary Street or lower class road)",
  "1500": "Minor Residential",
  "1521": "Ramp / Slip Road used to enter or exit a Residential Street",
  "1550":
    "Minor Residential Street(Unclassified), named but without addresses(Clackamas Co.only, SUBAREA = 'C')",
  "1560":
    "Minor Residential Street(Unclassified), unnamed and without addresses(Clackamas Co.only, SUBAREA = 'C')",
  "1600": "Alley",
  "1700": "Private Named Road",
  "1780": "Private Street, (planned)",
  "1800": "Unnamed Private Road / Driveway",
  "1900": "Pulic ROW EXISTS but no built roadway exists",
  "1950": "Public planned street with addresses(will be active soon)",
  "1970": "Virtual Segment; not a real roadway(accommodates address anomalies)",
  "1980":
    "Paper Street with addresses(accommodates address anomalies - in ROW unlike 1970)",
  "1990": "Vacated Street",
  "2100": "Railroad",
  "2200": "Rapid Transit(MAX)",
  "3100": "Non - Specific or Shared - Use Path",
  "3230": "Steps(most have addresses)",
  "5101":
    "Freeway with Rapid Transit(MAX or streetcar).Auto traffic and rail trackage in shared ROW.",
  "5201":
    "Highway with Rapid Transit(MAX or streetcar).Auto traffic and rail trackage in shared ROW.",
  "5301":
    "Primary Arterial with Rapid Transit(MAX or streetcar).Auto traffic and rail trackage in shared ROW.",
  "5401":
    "Arterial with Rapid Transit(MAX or streetcar).Auto traffic and rail trackage in shared ROW.",
  "5402":
    "Secondary arterial with rapid transit, but no regular vehicle traffic.",
  "5450":
    "Tertiary Street with Railroad.Auto traffic and rail trackage in shared ROW.",
  "5451":
    "Tertiary Street with Rapid Transit(MAX or streetcar).Auto traffic and rail trackage in shared ROW.",
  "5500":
    "Minor Residential with Railroad.Auto traffic and rail trackage in shared ROW.",
  "5501":
    "Minor Residential with Rapid Transit(MAX or streetcar).Auto traffic and rail trackage in shared ROW.",
  "7700":
    "Short segments indicating mile post locations along certain highways to assist emergency dispatch in Clackamas and Washington Counties.These are short pseudo - segments that do not exist(Clackamas and Washington Counties only).",
  "8224": "Unknown Type(only in Yamhill County, SUBAREA = 'Y')",
  "9000": "Forest Service Road"
};

segments.features = segments.features.map((curr, idx, arr) => {
  const length = turf.length(curr, { units: "meters" });
  const m = turf.along(curr, length / 2, { units: "meters" });
  curr.geometry = m.geometry;
  return curr;
});

// There is at least one bike feature that doesn't have coordinates
bikeNetwork.features = bikeNetwork.features.reduce((prev, curr, idx, arr) => {
  if (curr.geometry.coordinates && curr.geometry.coordinates.length > 0) {
    prev.push(curr);
  }
  return prev;
}, []);

bikeNetwork.features = bikeNetwork.features.map(curr => {
  const length = turf.length(curr, { units: "meters" });
  const m = turf.along(curr, length / 2, { units: "meters" });
  curr.geometry = m.geometry;
  return curr;
});

let points = segments.features.reduce((prev, curr, idx, arr) => {
  prev.push(curr.geometry.coordinates);
  return prev;
}, []);

const d3 = require("d3-delaunay");

let delaunay = d3.Delaunay.from(points);
let voronoi = delaunay.voronoi(bbox);

let features = [];
for (const polygon of voronoi.cellPolygons()) {
  features.push(turf.polygon([polygon]));
}

fs.writeFileSync(
  __dirname + "/../.data/street_segment_voronoi.geojson",
  JSON.stringify(turf.featureCollection(features))
);

points = segments.features.reduce((prev, curr, idx, arr) => {
  const typeWhitelist = [1300, 1321, 1400, 1421, 1450, 1471];
  if (typeWhitelist.includes(curr.properties.TYPE)) {
    prev.push(curr.geometry.coordinates);
  }
  return prev;
}, []);

delaunay = d3.Delaunay.from(points);
voronoi = delaunay.voronoi(bbox);

features = [];
for (const polygon of voronoi.cellPolygons()) {
  features.push(turf.polygon([polygon]));
}

fs.writeFileSync(
  __dirname + "/../.data/street_segment_filtered_voronoi.geojson",
  JSON.stringify(turf.featureCollection(features))
);

points = points.concat(
  bikeNetwork.features.reduce((prev, curr, idx, arr) => {
    const statusWhitelist = ["ACTIVE"];
    const typeWhitelist = ["TRL"];
    if (
      statusWhitelist.includes(curr.properties.Status) &&
      typeWhitelist.includes(curr.properties.Facility)
    ) {
      prev.push(curr.geometry.coordinates);
    }
    return prev;
  }, [])
);

delaunay = d3.Delaunay.from(points);
voronoi = delaunay.voronoi(bbox);

features = [];
for (const polygon of voronoi.cellPolygons()) {
  features.push(turf.polygon([polygon]));
}

fs.writeFileSync(
  __dirname + "/../.data/combined_segments_filtered_voronoi.geojson",
  JSON.stringify(turf.featureCollection(features))
);
