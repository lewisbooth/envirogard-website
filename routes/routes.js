const express = require("express")
const router = express.Router()
const pageController = require("../controllers/pageController")
const apiController = require("../controllers/apiController")
const authController = require("../controllers/authController")
const adminController = require("../controllers/adminController")
const { catchErrors } = require("../helpers/errorHandlers")

// Configure file upload handler
// const multer = require("multer")
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: "20MB",
//     files: 1
//   }
// })

// Standard pages
router.get("/", catchErrors(pageController.homepage))
router.get("/product/:product", catchErrors(pageController.product))
router.get("/category/:category/:subcategory?", catchErrors(pageController.category))
router.get("/industry/:industry", catchErrors(pageController.industry))
router.get("/about", pageController.about)
router.get("/contact", pageController.contact)
router.post("/contact", catchErrors(pageController.contactForm))
router.get("/contact/success", pageController.contactSuccess)
router.get("/trade-account", pageController.tradeAccount)
router.get("/trade-account/terms-and-conditions", pageController.tradeAccountTerms)
router.get("/frequently-asked-questions", pageController.faq)
router.get("/privacy-policy", pageController.privacyPolicy)
router.get("/privacy-policy", pageController.privacyPolicy)

// API
router.get("/api/get-closest-depot", apiController.getClosestDepot)

// Authentication
router.get("/login", pageController.login)
router.post("/login", authController.login)
router.get("/logout", authController.logout)

// Admin
router.all(/dashboard/, authController.isLoggedIn)
router.get("/dashboard", (req, res) => 
  res.redirect("/dashboard/products"))
router.get("/dashboard/products", adminController.products)
router.get("/dashboard/products/new", adminController.newProduct)

// Create user (disabled)
router.get("/create-user", pageController.createUser)
router.post("/create-user",
  authController.validateRegister,
  authController.createUser,
  authController.login)

module.exports = router