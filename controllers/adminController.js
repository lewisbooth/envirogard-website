const fs = require("fs")
const write = require("write")
const mongoose = require("mongoose")
const Product = mongoose.model("Product")
const { formatProduct } = require("../helpers/formatProduct")

exports.products = async (req, res) => {
  res.render('admin/productList', {
    title: "All Products"
  })
}

exports.newProduct = async (req, res) => {
  res.render('admin/product', {
    title: "New Product"
  })
}

exports.newProductSave = async (req, res, next) => {
  const product = formatProduct(req.body)
  await new Product(product).save(
    (err, data) => {
      if (err) {
        return res.status(400).send()
      }
      // Pass the saved document to `req` for the file upload handlers
      req.product = data
      next()
    }
  )
}

exports.uploadProductManual = (req, res, next) => {
  const PDF = req.files.filter(file =>
    file.fieldname === "manualPDF" && 
    file.mimetype === "application/pdf"
  )[0]
  if (!PDF) {
    return next()
  }  
  const filepath = `${process.env.PUBLIC_FOLDER}/cms/products/${req.product._id}/docs/manual.pdf`
  write(filepath, PDF.buffer, {encoding: 'ascii'}, async err => {
    if (err) { 
      console.log(err) 
    } else {
      await Product.findOneAndUpdate(
        {_id: req.product._id}, 
        { $set: { manualPDF: true } }
      )
    }
    next()
  })
}

exports.uploadProductImagery = (req, res, next) => {
  // Check the files exist
  if (!req.files) return next()
  const images = req.files.filter(file =>
    file.fieldname.startsWith("image"))
  if (!images) return next()
  next()
}