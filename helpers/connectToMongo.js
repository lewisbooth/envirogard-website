const mongoose = require("mongoose")

exports.connectToMongo = (retry = false) => {
  mongoose.connect(process.env.DATABASE, {
    autoReconnect: true,
    reconnectTries: 100,
    reconnectInterval: 500,
    useNewUrlParser: true
  }).then(() => {
    process.env.CONNECTED = "true"
    console.log("Connected to MongoDB")
  }, err => {
    process.env.CONNECTED = "false"
    if (!retry)
      console.error("🚫  Error connecting to MongoDB \n" + err.message)
    setTimeout(() => connectToMongo(true), 5000)
  })
}