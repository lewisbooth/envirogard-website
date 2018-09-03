const express = require("express")
const router = express.Router()
const pageController = require("../controllers/pageController")
const apiController = require("../controllers/apiController")
const authController = require("../controllers/authController")
const { catchErrors } = require("../helpers/errorHandlers")

// Configure user upload handler
const multer = require("multer")
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: "20MB",
    files: 1
  }
})

// Public pages
router.get("/", catchErrors(pageController.homepage))
router.get("/about", pageController.about)
router.get("/contact", pageController.contact)
router.post("/contact", catchErrors(pageController.contactForm))
router.get("/contact/success", pageController.contactSuccess)

// API
router.get("/api/get-closest-depot", apiController.getClosestDepot)

// Authentication
router.get("/login", pageController.login)
router.post("/login", authController.login)
router.get("/logout", authController.logout)

// Admin
router.all(/admin/, authController.isLoggedIn)
router.get("/admin", pageController.login)

// Create user (disabled)
// router.get("/create-user", pageController.createUser)
// router.post("/create-user",
//   authController.validateRegister,
//   authController.createUser,
//   authController.login)

module.exports = router