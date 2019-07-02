const fs = require('fs');

const d3 = require('d3-delaunay');
const turf = require('@turf/turf');

const readJsonFile = function(fileName) {
  return JSON.parse(fs.readFileSync(__dirname + fileName));
};

const generateVoronoi = function({ outputFile, inputFile, bbox }) {
  let features = readJsonFile(inputFile);

  let points = features.features.reduce((prev, curr) => {
    prev.push(curr.geometry.coordinates);
    return prev;
  }, []);

  let delaunay = d3.Delaunay.from(points);
  let voronoi = delaunay.voronoi(bbox);

  features = [];
  for (const polygon of voronoi.cellPolygons()) {
    features.push(turf.polygon([polygon]));
  }

  fs.writeFileSync(
    __dirname + outputFile,
    JSON.stringify(turf.featureCollection(features))
  );
};

const cities = readJsonFile('/../.data/cities.geojson');
let bbox = turf.bbox(cities);

generateVoronoi({
  inputFile: '/../.data/combined_filtered_segment_midpoints.geojson',
  outputFile: '/../.data/combined_filtered_segment_voronoi.geojson',
  bbox: bbox
});

cities.features = cities.features.reduce((prev, curr) => {
  if (curr.properties.CITYNAME == 'Portland') {
    prev.push(curr);
  }
  return prev;
}, []);

bbox = turf.bbox(cities);

generateVoronoi({
  inputFile: '/../.data/mesh_centroid.geojson',
  outputFile: '/../.data/mesh_voronoi.geojson',
  bbox: bbox
});

module.exports = {
  readJsonFile,
  generateVoronoi
};
