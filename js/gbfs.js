const fs = require('fs');
const axios = require('axios');

const feeds = require('../.config/gbfs.json');

for (const key in feeds) {
  if (!fs.existsSync(__dirname + `/../.data/gbfs/${key}`)) {
    fs.mkdir(__dirname + `/../.data/gbfs/${key}`, { recursive: true }, err => {
      if (err) throw err;
    });
  }
}

setInterval(() => {
  const time = new Date();
  for (const key in feeds) {
    feed = feeds[key];
    console.log(`reading from ${feed}...`);
    axios
      .get(feed)
      .then(res => {
        fileName = `${time.getFullYear()}${time.getMonth()}${time.getDate()}${time.getHours()}${time.getMinutes()}.json`;
        console.log(`got response, writing to file...`);
        fs.writeFileSync(
          __dirname + `/../.data/gbfs/${key}/${fileName}`,
          JSON.stringify(res.data)
        );
      })
      .catch(err => {
        console.error(`Error retrieving data: ${err.toString()}`);
      });
  }
}, 60 * 1000);
