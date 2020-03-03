const mongoose = require("mongoose");

const Temperature = require("./models/Temperature");
mongoose.connect(
  "mongodb://weather:weather123@ds125126.mlab.com:25126/weatherdata",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }
);

Temperature.deleteMany({ zipcode: "32301" })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
