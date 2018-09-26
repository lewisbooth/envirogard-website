const express = require("express")
const router = express.Router()

// Redirect old URLs to new pages
router.get("/test", (req, res) =>
  res.redirect("/")
)

module.exports = router