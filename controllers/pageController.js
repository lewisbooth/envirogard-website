const mongoose = require("mongoose")
const Product = mongoose.model("Product")
const Industry = mongoose.model("Industry")
const Category = mongoose.model("Category")
const { contactForm } = require("../helpers/contactForm")
const { parseSortParams } = require("../helpers/parseSortParams")
const { parseFilterParams } = require("../helpers/parseFilterParams")
const validator = require('validator')

// Titles and descriptions are written in the controllers
// Titles are appended with "| Envirogard" in views/templates/head.pug

exports.homepage = async (req, res) => {
  // Categories & Subcategories are already queried on every request
  // and passed to res.locals.globalCategories
  res.render("index")
}

exports.product = async (req, res) => {
  const filter = parseFilterParams(req)
  const product = await Product
    .findOne(filter)
    .populate({
      path: 'subcategory',
      options: {
        populate: 'category products'
      }
    })

  if (!product) {
    req.flash("error", "Product not found")
    return res.redirect("/")
  }

  res.render("product", {
    title: product.title,
    description: product.meta.description,
    product
  })
}

exports.search = async (req, res) => {
  const filter = parseFilterParams(req)
  const products = await Product.find(filter)
  res.render("search", {
    title: 'Search Products',
    products
  })
}

exports.category = async (req, res) => {
  const category = await Category
    .findOne({ slug: req.params.category })
    .populate({
      path: 'subcategories',
      options: {
        filter: { slug: req.params.subcategory || null },
        sort: { title: -1 }
      }
    })

  if (!category) {
    req.flash("error", "Category not found")
    return res.redirect("/")
  }

  // Build the Product query
  const filter = parseFilterParams(req)
  const sort = parseSortParams(req, 'az')

  // If a subcategory is selected, use its title instead of the category title
  let subcategoryTitle = ''

  // Returns an array of requested subcategory IDs
  const selectedSubcategories = category.subcategories.map(doc => {
    if (req.params.subcategory) {
      if (req.params.subcategory === doc.slug) {
        subcategoryTitle = doc.title
        return doc._id
      }
    } else {
      return doc._id
    }
  })

  // Filter Products by selected subcategories
  filter.subcategory = { $in: selectedSubcategories }

  // Run separate Product query for easier filtering/sorting of results
  // Otherwise we could populate nested Products from the Category query
  const products = await Product
    .find(filter)
    .sort(sort)

  res.render("category", {
    title: subcategoryTitle || category.title,
    description: category.meta.description,
    category,
    products
  })
}

exports.industry = async (req, res) => {
  const industry = await Industry
    .findOne({ slug: req.params.industry })
    .populate({
      path: 'subcategories'
    })

  if (!industry) {
    req.flash("error", "Industry not found")
    return res.redirect("/")
  }

  res.render("industry", {
    title: industry.title,
    description: industry.meta.description,
    industry
  })
}

exports.about = (req, res) => {
  res.render("about", {
    title: "About Us",
    description:
      "Established in 1989, Envirogard hires specialist equipment to contractors across mainland U.K. Equipment is supplied from our hire depots at Manchester, Barnsley, Tamworth, Bristol and Ashford (Kent)."
  })
}

exports.tradeAccount = (req, res) => {
  res.render("tradeAccount", {
    title: "Trade Account Application",
    description: "Apply for a Trade Account to hire equipment from Envirogard."
  })
}

exports.tradeAccountTerms = (req, res) => {
  res.render("tradeAccountTerms", {
    title: "Trade Account Terms and Conditions",
    description: "Trade Account Terms and Conditions"
  })
}

exports.faq = (req, res) => {
  res.render("faq", {
    title: "Frequently Asked Questions",
    description: "Our FAQ page answers common questions about our service coverage & conditions, collection prodecures, care & use of hire goods, returns procedure and invoicing."
  })
}

exports.contact = (req, res) => {
  res.render("contact", {
    title: "Contact Us",
    description: "Find your closest branch in the UK to hire specialist protective equipment."
  })
}

exports.privacyPolicy = (req, res) => {
  res.render("privacyPolicy")
}

exports.contactForm = async (req, res) => {
  // If a bot is detected, send a fake 200 OK response
  if (!validator.isEmpty(req.body.bot))
    return res.status(200).send()
  // Validate the fields
  let errors = []
  if (!req.body.name)
    errors.push("Please supply your name")
  if (!req.body.company)
    errors.push("Please supply your company name")
  if (!req.body.email)
    errors.push("Please supply your email address")
  if (req.body.email && !validator.isEmail(req.body.email))
    errors.push("Email address is invalid")
  if (!req.body.phone)
    errors.push("Please supply your phone number")
  if (!req.body.message)
    errors.push("Please supply a message")
  // Handle validation errors
  if (errors.length) {
    console.log("Errors with contact form submission: \n" + errors)
    return res.status(400).json(errors)
  }
  // Send email if input is OK
  await contactForm({
    messageData: req.body
  }).then(() => {
    res.status(200).send()
  }).catch(err => {
    console.log(err)
    res.status(400).json(['Server error - please call or email us directly.'])
  })
}

exports.contactSuccess = (req, res) => {
  res.render("contactSuccess")
}

exports.login = (req, res) => {
  res.render("login", {
    title: "Log In",
    description:
      "Log In"
  })
}

exports.createUser = (req, res) => {
  res.render("createUser", {
    title: "Create User",
    description:
      "Create a user with no validation"
  })
}
