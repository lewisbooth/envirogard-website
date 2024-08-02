// Load environment variables
require("dotenv").config({ path: "variables.env" })

const path = require("path")
const colors = require("colors")
const ip = require("ip")

// Expose an absolute path to root & public directories
// Useful for scripts that are nested in folders
process.env.ROOT = __dirname
process.env.PUBLIC_FOLDER = path.join(__dirname, "public")
require("./helpers/checkConfig")

// Check that environment variables exist
// Set up URLs for linking to the site
const port = process.env.PORT || 8888
process.env.LOCAL_URL = `http://${ip.address()}:${port}`
process.env.LOCAL_URL_PROXY = `http://${ip.address()}:3000`

// Load MongoDB models
require("./helpers/connectToMongo")
require("./models/User")
require("./models/Product")
require("./models/Category")
require("./models/Subcategory")
require("./models/Industry")
require("./models/Settings")
require("./models/Pages")

// Create default Settings database entry if required
require("./helpers/checkSettings")

// Load routes & middleware
const app = require("./app")


// Initiate the server and log useful data
const server = app.listen(port, () => {
  console.log(`✔ Express running → PORT ${server.address().port}`.green)
  console.log(
    `✔ Local address: `.green + `${process.env.LOCAL_URL}\n`.underline +
    `✔ Public address: `.green + process.env.PUBLIC_URL.underline)
  console.log(
    process.env.NODE_ENV === "production"
    ? '✔ Production mode'.green
    : '⚠️  Development mode'.yellow
  )
})

// Load cron jobs for sitemap, backup etc
if (process.env.NODE_ENV === "production") require("./cron")
