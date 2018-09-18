const express = require("express")
const router = express.Router()
const pageController = require("../controllers/pageController")
const { catchErrors } = require("../helpers/errorHandlers")

// Redirect old URLs to new pages
router.get("/", catchErrors(pageController.homepage))

module.exports = router