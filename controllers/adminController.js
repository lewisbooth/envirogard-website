const fs = require("fs")
const write = require("write")
const sharp = require("sharp")
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const mongoose = require("mongoose")
const Product = mongoose.model("Product")
const { wait } = require("../helpers/wait")
const { formatProduct } = require("../helpers/formatProduct")

const RESULTS_PER_PAGE = 20

exports.products = async (req, res) => {
  const {  search, subcategory, sortBy } = req.query
  let page = Math.max(1, parseInt(req.query.page))
  // Build filter params
  let filter = {}
  if (search)
    filter.title = { $regex: search, $options: "i" }
  if (subcategory && subcategory !== "all")
    filter.subcategory = subcategory
  let sort = { updatedAt: -1 }
  if (sortBy === "oldest")
    sort = { updatedAt: 1 }
  if (sortBy === "az")
    sort = { title: 1 }
  if (sortBy === "za")
    sort = { title: -1 }
  const allProducts = await Product.find(filter)
  const productCount = allProducts.length
  const pageCount = Math.floor(productCount / RESULTS_PER_PAGE) + 1
  if (page > pageCount)
    page = pageCount
  const skip = (page - 1) * RESULTS_PER_PAGE
  const products = await Product
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(RESULTS_PER_PAGE)
  res.render('admin/productList', {
    title: "All Products",
    products,
    pageCount,
    productCount,
    page,
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
      if (err) 
        return res.status(400).send()      
      // Attach the saved document to 'req', used by the file upload handlers
      req.product = data
      req.flash("success", "New product added")
      next()
    }
  )
}

exports.editProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
  if (!product) {
    req.flash("error", "Product not found")
    res.redirect("/dashboard/products")
    return
  }
  res.render('admin/product', {
    product,
    title: `Edit Product - ${product.title}`
  })
}

exports.editProductSave = async (req, res, next) => {  
  const product = formatProduct(req.body)
  await Product.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: product },
    { new: true },
    (err, doc) => {
      if (err)
        return res.status(400).send()
      // Manually call save() to trigger slug update
      doc.save()
      // Attach the saved document to 'req', used by the file upload handlers
      req.product = doc
      req.flash("success", "Product has been updated")
      next()
    }
  )  
}

// Handles uploading and deleting manual PDF
exports.uploadProductManual = async (req, res, next) => {
  // Extract PDF buffer from uploaded files and check MIME type
  const newPDF = req.files.filter(file =>
    file.fieldname === "manualPDF" && 
    file.mimetype === "application/pdf"
  )[0]
  const filepath = `${process.env.PUBLIC_FOLDER}/cms/products/${req.product._id}/docs/manual.pdf`
  // Delete currently uploaded manual if flag or new file is present
  if (req.body.deleteManual || newPDF) {
    fs.unlinkSync(filepath)
    await Product.findOneAndUpdate(
      {_id: req.product._id}, 
      { $set: { manualPDF: false } }
    )
  }
  if (!newPDF) return next()
  // Save buffer to file
  write(filepath, newPDF.buffer, { encoding: 'ascii' }, async err => {
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

// Handles uploading new images and rearranging/deleting existing images.
// Images are named using timestamps, which are referenced in an array that 
// is stored in the database. This setup allows for easy re-ordering. 
exports.uploadProductImagery = async (req, res, next) => {
  // Build array of image IDs from any existing imagery
  let imageList = []
  Object.keys(req.body).forEach(field => {
    if (field.startsWith('image')){
      const index = field.split('-')[1]
      const id = req.body[field]
      imageList[index] = id
    }
  })
  // Extract new images from uploaded files
  const newImages = req.files.filter(file =>
    file.fieldname.startsWith("image"))
  if (!newImages) return next()
  // Initialise product image folder
  const folder = `${process.env.PUBLIC_FOLDER}/cms/products/${req.product._id}/images/`
  mkdirp.sync(folder)
  // Save new images
  newImages.forEach(image => {
    // Generate timestamp for the filename
    const timestamp = new Date().getTime().toString()
    // Add image reference to ordered array
    const index = image.fieldname.split('-')[1]
    imageList[index] = timestamp
    // Generate optimised image (1000px on longest side)
    sharp(image.buffer)
      .rotate()
      .resize(1000, 1000)
      .max()
      .toFormat('jpg')
      .toFile(`${folder}/${timestamp}.jpg`)
      .then(() => console.log('New image uploaded'))
      .catch(err => console.error)
    // Generate thumbnail image (400px on longest side)
    sharp(image.buffer)
      .rotate()
      .resize(400, 400)
      .max()
      .toFormat('jpg')
      .toFile(`${folder}/${timestamp}-thumb.jpg`)
    // Force a synchronous 2ms wait to spread out the timestamps
    // Ensures files have different names at little performance cost
    wait(2)
  })
  // Save image references to database
  // Looks like [ '1540285585887', '1540285585891', '1540285585893' ]
  await Product.findOneAndUpdate(
    {_id: req.product._id}, 
    { $set: { images: imageList } }
  )
  // Delete unnecessary files
  fs.readdir(folder, (err, files) => {
    if (err) return console.log(err)
    files.forEach(filename => {
      // Extract timestamp from filename
      const id = filename.match(/^\d*/)[0]
      // Delete the file if it's not in the new array
      if (imageList.indexOf(id) === -1) {
        fs.unlinkSync(folder + filename) 
      }      
    })
  })
  next()
}

exports.deleteProduct = async (req, res) => {
  const folder = `${process.env.PUBLIC_FOLDER}/cms/products/${req.params.id}`
  await Product.findByIdAndRemove(req.params.id, 
    (err, doc) => {
      if (err) {
        console.log(err)
        req.flash("error", "Error deleting product, please try again")
        res.redirect("back")
        return
      }
      // Emulates 'rm -rf'
      rimraf(folder, () => console.log("Product deleted: " + doc.title))
      req.flash("success", "Product deleted")
      res.redirect("/dashboard/products")
    }
  )
}