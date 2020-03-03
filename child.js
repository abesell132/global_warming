const axios = require("axios");
const cheerio = require("cheerio");

function random_string() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

process.on("message", processInfo => {
  axios
    .get(processInfo.url, {
      headers: {
        "User-Agent": random_string()
      }
    })
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
          zipcode: processInfo.info.zipcode,
          year: processInfo.info.year,
          month: processInfo.info.month,
          day: processInfo.info.day,
          high: highTemp,
          low: lowTemp,
          avg: avgTemp
        });
      }
      process.exit(0);
    })
    .catch(err => {
      console.log("Error: " + processInfo.url);
      process.exit(1);
    });
});

function removeDegree(str) {
  return str.replace("°F", "");
}

function roundDecimal(float) {
  return Math.round(float * 100) / 100;
}
