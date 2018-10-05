const express = require("express")
const router = express.Router()

// 301 Redirect old URLs from previous website

router.get("/old-url", (req, res) =>
  res.redirect("/")
)

module.exports = router