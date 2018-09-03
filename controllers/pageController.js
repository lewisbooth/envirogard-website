const mongoose = require("mongoose")
const User = mongoose.model("User")
const validator = require('validator')
const { contactForm } = require("../helpers/contactForm")

// Titles and descriptions are written in the controllers
// Titles are appended with "| AMP" in views/templates/head.pug

exports.homepage = async (req, res) => {
  res.render("index")
}

exports.about = (req, res) => {
  res.render("about")
}

exports.contact = (req, res) => {
  res.render("contact")
}

exports.contactForm = async (req, res) => {
  let errors = []
  // If a bot is detected, send a fake 200 OK response
  if (!validator.isEmpty(req.body.bot))
    return res.status(200).send()
  // Validate the fields
  if (validator.isEmpty(req.body.name))
    errors.push("Please supply your name")
  if (validator.isEmpty(req.body.company))
    errors.push("Please supply your company name")
  if (!validator.isEmail(req.body.email))
    errors.push("Email address is invalid")
  if (validator.isEmpty(req.body.phone))
    errors.push("Please supply your phone number")
  if (validator.isEmpty(req.body.message))
    errors.push("Please supply a message")
  // Handle errors
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

// Reference controller for creating queries
exports.sampleQuery = async (req, res) => {
  const users = await User
    .find({})
    .limit(3)
    .sort({ updatedAt: -1 })
  res.render("queryResults", {
    users,
    title: "Last 3 users",
    description:
      "A list of the 3 most recently updated users"
  })
}
