const path = require("path")
const ip = require("ip")
const { connectToMongo } = require("./helpers/connectToMongo")

// Load environment variables
require("dotenv").config({ path: "variables.env" })

// Expose an absolute path to root & public directories 
// Useful for scripts that are nested in folders
process.env.ROOT = __dirname
process.env.PUBLIC_FOLDER = path.join(__dirname, "public")

// Initiate database connection
connectToMongo()

// Load MongoDB models
require("./models/User")

// Load cron jobs for sitemap, backup etc
require("./cron")

// Load server scripts
const app = require("./app")

app.set("port", process.env.PORT || 8888)

// Initiate the server
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`)
  if (process.env.NODE_ENV === "production")
    console.log("⚡  Production Mode ⚡")
  else
    console.log("🐌  Development Mode 🐌 ")
  console.log("Local address: " + ip.address())
})