const fork = require("child_process").fork;
var startTime = process.hrtime();
const mongoose = require("mongoose");
const fs = require("fs");

const Temperature = require("./models/Temperature");

mongoose.connect(
  "mongodb://weather:weather123@ds125126.mlab.com:25126/weatherdata",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }
);
let datapoints = [];
var gen = bookmarker();
let staging = [];
let stagedURLS = [];
const zipcodes = [
  // "36104" // Done
  // "85001", // Done
  // "72201", // Done
  // "95814" // Runing on AWS
  //  "80202" // Running on AWS
  // "06103" // Running on AWS
   "19901", // Running on AWS
  //"32301",
  // "30303"
  // "83702",
  // "62701",
  // "46225",
  // "50309",
  // "66603",
  // "40601",
  // "70802",
  // "04330",
  // "21401",
  // "02201",
  // "48933",
  // "55102",
  // "39205",
  // "65101",
  // "59623",
  // "68502",
  // "89701",
  // "03301",
  // "08608",
  // "87501",
  // "12207",
  // "27601",
  // "58501",
  // "43215",
  // "73102",
  // "97301",
  // "17101",
  // "02903",
  // "29217",
  // "57501",
  // "37219",
  // "78701",
  // "84111",
  // "05602",
  // "23219",
  // "98507",
  // "25301",
  // "53703",
  // "82001"
  // "20001"
];

stageRequests();

// Begin Application

fs.readFile("status.txt", function(err, data) {
  if (data) {
    for (let b = 0; b <= data; b++) {
      iPID = gen.next().value;
    }

    if (iPID == data) {
      console.log("Starting scraping at element #: " + iPID);
      for (let a = 0; a < 10; a++) {
        createChildProcess();
      }
    }
  } else {
    // No requests have been made, business as usual
    for (let a = 0; a < 10; a++) {
      createChildProcess();
    }
  }
});

function createChildProcess() {
  const ls = fork("./child.js");
  let iPID = gen.next().value;
  if (iPID % 50 == 0) {
    var checkTime = process.hrtime(startTime);
    console.log(
      "Time Remaining: " +
        time_remaining((staging.length - iPID) / (iPID / checkTime[0]))
    );
    console.info(
      "Execution Stats: %d completed, %d entries/s, %d days to go.",
      iPID,
      roundDecimal(iPID / checkTime[0]),
      staging.length - iPID
    );
  }

  if (iPID) ls.send({ info: staging[iPID], url: stagedURLS[iPID] });
  ls.on("message", msg => {
    add_to_database(
      msg.zipcode,
      msg.year,
      msg.month,
      msg.day,
      msg.avg,
      msg.high,
      msg.low
    );
  });
  ls.on("exit", code => {
    if (code == 0) {
      fs.readFile("status.txt", (err, data) => {
        if (data < iPID) {
          fs.writeFile("status.txt", Math.floor(iPID / 200) * 200, function(
            err
          ) {
            if (err) {
              return console.log(err);
            }
          });
        }
      });
    }
    if (iPID + 1 < staging.length) {
      createChildProcess();
    }
    if (iPID % 200 == 0) {
      Temperature.insertMany(datapoints)
        .then(res => {
          console.log("Successful Database Entry");
        })
        .catch(err => {
          console.log(err);
        });
      datapoints = [];
    }
  });
}

function stageRequests() {
  for (let a = 0; a < zipcodes.length; a++) {
    for (let year = 1950; year < 2019; year++) {
      for (let month = 1; month < 13; month++) {
        let daysInMonth = get_days_in_month(month);
        for (let day = 1; day < daysInMonth + 1; day++) {
          staging.push({
            url:
              "https://www.farmersalmanac.com/weather-history-results/zipcode-" +
              zipcodes[a] +
              "/" +
              year +
              "/" +
              double_digit(month) +
              "/" +
              double_digit(day),
            zipcode: zipcodes[a],
            year,
            month,
            day
          });
          stagedURLS.push(
            "https://www.farmersalmanac.com/weather-history-results/zipcode-" +
              zipcodes[a] +
              "/" +
              year +
              "/" +
              double_digit(month) +
              "/" +
              double_digit(day)
          );
        }
      }
    }
  }
}

function add_to_database(
  zipcode,
  year,
  month,
  day,
  avgTemp,
  highTemp,
  lowTemp
) {
  datapoints.push({
    zipcode: zipcode,
    high: highTemp,
    average: avgTemp,
    low: lowTemp,
    date: new Date(year + "-" + month + "-" + day)
  });
}

function time_remaining(time) {
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor((time - hours * 3600) / 60);
  let seconds = Math.floor(time - hours * 3600 - minutes * 60);
  return "" + hours + "h" + minutes + "m" + seconds + "s";
}

function roundDecimal(float) {
  return Math.round(float * 100) / 100;
}

// Oh Generators, How I Love You
function* bookmarker() {
  var index = 0;
  while (true) yield index++;
}

function get_days_in_month(month) {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
      break;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
      break;
    default:
      return 28;
      break;
  }
}

function double_digit(number) {
  if (number < 10) {
    return "0" + number;
  } else {
    return number;
  }
}
