// This file sets up the Express middleware
// All network requests pass through middleware top-to-bottom
// Requests are then handed off to the routing file

const express = require("express")
const app = express()
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const { promisify } = require("es6-promisify")
const expressValidator = require("express-validator")
const cookieParser = require('cookie-parser')
const compression = require("compression")
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const device = require("device")

// Helper functions & other middleware
const { checkDB } = require("./helpers/checkDB")
const { logging } = require("./helpers/logging")
const { truncate } = require("./helpers/truncate")
const { cacheBuster } = require("./helpers/cacheBuster")
const { depotData } = require("./helpers/depotData")
const errorHandlers = require("./helpers/errorHandlers")
const passport = require("passport")
require("./helpers/passport")

// Routing files
const routes = require("./routes/routes")
const redirects = require("./routes/redirects")

// Enable GZIP
app.use(compression())

// Set cache headers for static content to 1 year
const maxAge = process.env.NODE_ENV === "production" ? 31536000 : 1

// Serve static files
// These should be served via Nginx/Apache reverse proxy in production
app.use(express.static(process.env.PUBLIC_FOLDER, { maxAge }))

// Load Pug templating engine 
app.set("views", "views")
app.set("view engine", "pug")

// Add MDS hashes to automatically version CSS/JS
app.use(cacheBuster)

// Parse POST data into req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Throw error safely if DB is not connected
app.use(checkDB)

// Session cookies
app.use(
  session({
    secure: true,
    resave: false,
    key: process.env.KEY,
    secret: process.env.SECRET,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
)

// Load PassportJS authentication
app.use(passport.initialize())
app.use(passport.session())

// Promisify the PassportJS login API (non-blocking)
app.use((req, res, next) => {
  req.login = promisify(req.login, req)
  next()
})

// Parse cookies into req.cookies
app.use(cookieParser())

// Log dynamic requests
app.use(logging)

// Dynamic flash messages are passed to the view templates 
// (e.g. "Successfully logged in" or "Incorrect login details")
app.use(flash())

// Data validation library
app.use(expressValidator())

// Expose variables and functions to view templates
app.use((req, res, next) => {
  // Parses the User Agent into desktop, phone, tablet, phone, bot or car
  res.locals.device = device(req.headers["user-agent"]).type
  // Pass success/error messages into the template
  res.locals.flashes = req.flash()
  // Expose the current user data if logged in
  res.locals.user = req.user || null
  // Safely format descriptions
  res.locals.truncate = truncate
  // Expose other useful information
  res.locals.currentPath = req.path
  res.locals.cookies = req.cookies
  res.locals.depotData = depotData
  res.locals.query = req.query
  // Detect production mode
  if (process.env.NODE_ENV === "production")
    res.locals.production = true
  next()
})

// Pass the request to routing middleware
app.use("/", routes)

// Check for 301 redirects from the old site
app.use("/", redirects)

// Error 404 if no routes/redirects can handle the request
app.use(errorHandlers.notFound)

// Flash Mongoose errors
app.use(errorHandlers.flashValidationErrors)

// Error page with stacktrace during development
if (app.get("env") === "development")
  app.use(errorHandlers.developmentErrors)

// Error page with no stacktrace in production
app.use(errorHandlers.productionErrors)

module.exports = app