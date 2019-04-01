const axios = require('axios');
const fs = require('fs');

const getOpenData = async function(url, fileName) {
  await axios
    .get(url)
    .then(res => {
      fs.writeFileSync(__dirname + fileName, JSON.stringify(res.data));
    })
    .catch(err => {
      console.error(`Error retrieving data: ${err.toString()}`);
    });
};

getOpenData(
  'https://opendata.arcgis.com/datasets/1559e31273654eb9858397861f1fdefa_10.geojson',
  '/../.data/cities.geojson'
);

getOpenData(
  'https://opendata.arcgis.com/datasets/9eef54196eaa4d12b54e9bc40e70ff09_35.geojson',
  '/../.data/parks.geojson'
);

getOpenData(
  'https://opendata.arcgis.com/datasets/ad5ed4193110452aac2d9485df3298e2_68.geojson',
  '/../.data/streets.geojson'
);
