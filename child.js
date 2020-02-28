const axios = require("axios");
const cheerio = require("cheerio");

process.on("message", processInfo => {
  axios
    .get(processInfo.url)
    .then(res => {
      const $ = cheerio.load(res.data);
      let highTemp = parseFloat(
        removeDegree($(".wx-results-table tbody tr:first-of-type td").text())
      );
      let lowTemp = parseFloat(
        removeDegree($(".wx-results-table tbody tr:nth-of-type(3) td").text())
      );
      let avgTemp = roundDecimal(parseFloat((highTemp + lowTemp) / 2));

      if (highTemp && lowTemp && avgTemp) {
        process.send({
          zipcode: processInfo.zipcode,
          year: processInfo.year,
          month: processInfo.month,
          day: processInfo.day,
          high: highTemp,
          low: lowTemp,
          avg: avgTemp
        });
      }
      process.exit(0);
    })
    .catch(err => {
      console.log(err);
    });
});

function removeDegree(str) {
  return str.replace("°F", "");
}

function roundDecimal(float) {
  return Math.round(float * 100) / 100;
}
