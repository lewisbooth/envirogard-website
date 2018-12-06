const express = require("express")
const router = express.Router()

// 301 Redirect old URLs from previous website
// Old URLs have query strings which are not matched by Express' router.get(path)
// so we serve all requests with one function and match req.url manually

// List of redirect paths [[oldURL, newURL]]
const { redirects } = require('./redirect-urls')

router.get('*', (req, res, next) => {
  // Search redirects array for a match
  redirects.forEach(entry => {
    const [oldURL, newURL] = entry
    if (req.url === oldURL && !res.headersSent)
      res.status(301).redirect(newURL)
  })
  // Pass to 404 handler if a match is not found
  if (!res.headersSent)
    next()
})

module.exports = router