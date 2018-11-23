const express = require('express')
const router = express.Router()
const pageController = require('../controllers/pageController')
const apiController = require('../controllers/apiController')
const authController = require('../controllers/authController')
const adminController = require('../controllers/adminController')
const { catchErrors } = require('../helpers/errorHandlers')

// Configure file upload handler
const multer = require('multer')
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: '20MB',
    files: 21
  }
})

// Standard pages
router.get('/', catchErrors(pageController.homepage))
router.get('/search', catchErrors(pageController.search))
router.get('/products/:slug', catchErrors(pageController.product))
router.get('/categories/:category/:subcategory?', catchErrors(pageController.category))
router.get('/industries/:industry', catchErrors(pageController.industry))
router.get('/about', pageController.about)
router.get('/contact', pageController.contact)
router.post('/contact', catchErrors(pageController.contactForm))
router.get('/contact/success', pageController.contactSuccess)
router.get('/trade-account', pageController.tradeAccount)
router.get('/trade-account/terms-and-conditions', pageController.tradeAccountTerms)
router.get('/frequently-asked-questions', pageController.faq)
router.get('/privacy-policy', pageController.privacyPolicy)

// API
router.get('/api/get-closest-depot', catchErrors(apiController.getClosestDepot))
router.post('/api/products/search', catchErrors(apiController.searchProducts))
router.post('/api/subcategories/search', catchErrors(apiController.searchSubcategories))

// Authentication
router.get('/login', pageController.login)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

// Admin
router.all(/dashboard/, authController.isLoggedIn)
router.get('/dashboard', (req, res) =>
  res.redirect('/dashboard/categories'))

router.get('/dashboard/categories', catchErrors(adminController.categories))
router.get('/dashboard/categories/new', adminController.newCategory)
router.post('/dashboard/categories/new',
  upload.single("coverImage"),
  catchErrors(adminController.newCategorySave),
  catchErrors(adminController.uploadCategoryImage),
  (req, res) => res.status(200).send())
router.get('/dashboard/categories/delete/:id', catchErrors(adminController.deleteCategory))
router.get('/dashboard/categories/:slug', catchErrors(adminController.editCategory))
router.post('/dashboard/categories/:slug',
  upload.single("coverImage"),
  catchErrors(adminController.editCategorySave),
  catchErrors(adminController.uploadCategoryImage),
  (req, res) => res.status(200).send())

router.get('/dashboard/subcategories', catchErrors(adminController.subcategories))
router.get('/dashboard/subcategories/new', adminController.newSubcategory)
router.post('/dashboard/subcategories/new', catchErrors(adminController.newSubcategorySave))
router.get('/dashboard/subcategories/:slug', catchErrors(adminController.editSubcategory))
router.post('/dashboard/subcategories/:slug', catchErrors(adminController.editSubcategorySave))
router.get('/dashboard/subcategories/delete/:id', catchErrors(adminController.deleteSubcategory))

router.get('/dashboard/products', catchErrors(adminController.products))
router.get('/dashboard/products/new', adminController.newProduct)
router.post('/dashboard/products/new',
  upload.any(),
  catchErrors(adminController.newProductSave),
  catchErrors(adminController.uploadProductManual),
  catchErrors(adminController.uploadProductImagery),
  (req, res) => res.status(200).send())
router.get('/dashboard/products/delete/:id', catchErrors(adminController.deleteProduct))
router.get('/dashboard/products/:slug', catchErrors(adminController.editProduct))
router.post('/dashboard/products/:slug',
  upload.any(),
  catchErrors(adminController.editProductSave),
  catchErrors(adminController.uploadProductManual),
  catchErrors(adminController.uploadProductImagery),
  (req, res) => res.status(200).send())

router.get('/dashboard/industries', catchErrors(adminController.industries))
router.get('/dashboard/industries/new', adminController.newIndustry)
router.post('/dashboard/industries/new',
  upload.single("coverImage"),
  catchErrors(adminController.newIndustrySave),
  catchErrors(adminController.uploadIndustryImage),
  (req, res) => res.status(200).send())
router.get('/dashboard/industries/delete/:id', catchErrors(adminController.deleteIndustry))
router.get('/dashboard/industries/:slug', catchErrors(adminController.editIndustry))
router.post('/dashboard/industries/:slug',
  upload.single("coverImage"),
  catchErrors(adminController.editIndustrySave),
  catchErrors(adminController.uploadIndustryImage),
  (req, res) => res.status(200).send())

// Create a user with no authentication
// Disabled in production, obviously!
if (process.env.NODE_ENV === "development") {
  router.get('/create-user', pageController.createUser)
  router.post('/create-user',
    authController.validateRegister,
    authController.createUser,
    authController.login)
}

module.exports = router