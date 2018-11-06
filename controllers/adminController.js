const fs = require("fs")
const write = require("write")
const sharp = require("sharp")
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const mongoose = require("mongoose")
const Product = mongoose.model("Product")
const Industry = mongoose.model("Industry")
const Category = mongoose.model("Category")
const Subcategory = mongoose.model("Subcategory")
const { calcPage } = require("../helpers/calcPage")
const { blockThread } = require("../helpers/blockThread")
const { formatProduct } = require("../helpers/formatProduct")
const { formatCategory } = require("../helpers/formatCategory")
const { formatIndustry } = require("../helpers/formatIndustry")
const { formatSubcategory } = require("../helpers/formatSubcategory")
const { parseSortParams } = require("../helpers/parseSortParams")
const { parseFilterParams } = require("../helpers/parseFilterParams")

const RESULTS_PER_PAGE = 20

exports.products = async (req, res) => {
  let filter = parseFilterParams(req)
  let sort = parseSortParams(req)  
  // Calculate pagination variables
  const numberOfResults = await Product.countDocuments(filter)
  const numberOfPages = Math.ceil(numberOfResults / RESULTS_PER_PAGE)
  const page = calcPage(req.query.page, numberOfPages)  
  // Calculate number of items to skip based on page number
  const skip = (page - 1) * RESULTS_PER_PAGE
  const products = await Product
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(RESULTS_PER_PAGE)
    .populate('subcategory')
  res.render('admin/productList', {
    title: "All Products",
    products,
    numberOfPages,
    numberOfResults,
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
      // Attach document to 'req' to be used by the file upload handlers
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
    { returnNewDocument: true },
    (err, doc) => {
      if (err || !doc)
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
  // Extract PDF buffer from uploaded files
  const newPDF = req.files.filter(file =>
    file.fieldname === "manualPDF" && 
    file.mimetype === "application/pdf"
  )[0]
  const folder = `${req.product.publicFolder}/docs`
  const filepath = `${folder}/manual.pdf`
  mkdirp.sync(folder)
  // Delete currently uploaded manual if flag or new file is present
  if (req.body.deleteManual || newPDF) {
    if (fs.existsSync(filepath))
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
      const imageId = req.body[field]
      imageList[index] = imageId
    }
  })
  // Extract new images from uploaded files
  const newImages = req.files.filter(file =>
    file.fieldname.startsWith("image")
  )
  if (!newImages) return next()
  // Initialise product image folder
  const folder = `${req.product.publicFolder}/images/`
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
    // Ensures files have different names at a tiny performance cost
    blockThread(2)
  })
  // Save image references to database
  // Looks like [ '1540285585887', '1540285585891', '1540285585893' ]
  await Product.findOneAndUpdate(
    {_id: req.product._id}, 
    { $set: { images: imageList } }
  )
  // Delete unnecessary files
  fs.readdir(folder, (err, files) => {
    if (err)  {
      return console.log(err)
    }
    files.forEach(filename => {
      // Extract timestamp from filename
      const id = filename.match(/^\d*/)[0]
      const path = folder + filename
      const fileExists = fs.existsSync(path)
      // Delete the file if it's not in the new array
      if (fileExists && imageList.indexOf(id) === -1) {
        fs.unlinkSync(folder + filename) 
      }
    })
  })
  next()
}

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndRemove(req.params.id, 
    (err, doc) => {
      if (err) {
        console.log(err)
        req.flash("error", "Error deleting product, please try again")
        res.redirect("back")
        return
      }
      // Emulates 'rm -rf'
      rimraf(doc.publicFolder, () =>
        console.log("Product deleted: " + doc.title)
      )
      req.flash("success", "Product deleted")
      res.redirect("/dashboard/products")
    }
  )
}

exports.categories = async (req, res) => {  
  let filter = parseFilterParams(req)
  let sort = parseSortParams(req)  
  // Calculate pagination variables
  const numberOfResults = await Category.countDocuments()
  const numberOfPages = Math.ceil(numberOfResults / RESULTS_PER_PAGE)
  const page = calcPage(req.query.page, numberOfPages)  
  // Calculate number of items to skip based on page number
  const skip = (page - 1) * RESULTS_PER_PAGE
  const categories = await Category
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(RESULTS_PER_PAGE)
    .populate('subcategories')
  res.render('admin/categoryList', {
    title: "All Categories",
    categories,
    numberOfPages,
    numberOfResults,
    page,
  })
}

exports.newCategory = async (req, res) => {
  res.render('admin/category', {
    title: "New Category"
  })
}

exports.newCategorySave = async (req, res, next) => {
  const category = formatCategory(req.body)
  await new Category(category).save(
    (err, data) => {
      if (err) 
        return res.status(400).send()      
      // Attach document to 'req' to be used by the file upload handlers
      req.category = data
      req.flash("success", "New category added")
      next()
    }
  )
}

exports.editCategory = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
  if (!category) {
    req.flash("error", "Category not found")
    res.redirect("/dashboard/categories")
    return
  }
  res.render('admin/category', {
    category,
    title: `Edit Category - ${category.title}`
  })
}

exports.editCategorySave = async (req, res, next) => {  
  const category = formatCategory(req.body)
  await Category.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: category },
    { returnNewDocument: true },
    (err, doc) => {
      if (err)
        return res.status(400).send()
      // Manually call save() to trigger slug update
      doc.save()      
      // Attach document to 'req' to be used by the file upload handlers
      req.category = doc
      req.flash("success", "Category has been updated")
      next()
    }
  )  
}

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndRemove(req.params.id, 
    (err, doc) => {
      if (err) {
        console.log(err)
        req.flash("error", "Error deleting category, please try again")
        res.redirect("back")
        return
      }
      // Emulates 'rm -rf'
      rimraf(doc.publicFolder, () =>
        console.log("Category deleted: " + doc.title)
      )
      req.flash("success", "Category deleted")
      res.redirect("/dashboard/categories")
    }
  )
}

// Handles uploading new images and rearranging/deleting existing images.
// Categories only have one image, which is saved as 'cover.jpg'
exports.uploadCategoryImage = async (req, res, next) => {
  const newImage = req.file
  const folder = `${req.category.publicFolder}/images`
  // Initialise category image folder
  mkdirp.sync(folder)
  // Delete existing image if required
  if ((newImage || req.body.deleteImage) && fs.existsSync(`${folder}/cover.jpg`)) {
    fs.unlinkSync(`${folder}/cover.jpg`) 
    fs.unlinkSync(`${folder}/cover-thumb.jpg`) 
    await Category.findOneAndUpdate(
      {_id: req.category._id}, 
      { $set: { hasImage: false } }
    )
  }
  if (!newImage) return next()
  // Generate optimised image (1000px on longest side)
  sharp(newImage.buffer)
    .rotate()
    .resize(1000, 1000)
    .max()
    .toFormat('jpg')
    .toFile(`${folder}/cover.jpg`)
    .then(() => console.log('New category image uploaded'))
    .catch(err => console.error)
  // Generate thumbnail image (400px on longest side)
  sharp(newImage.buffer)
    .rotate()
    .resize(400, 400)
    .max()
    .toFormat('jpg')
    .toFile(`${folder}/cover-thumb.jpg`)
  // Set flag in database
  await Category.findOneAndUpdate(
    {_id: req.category._id}, 
    { $set: { hasImage: true } }
  )
  next()
}

exports.subcategories = async (req, res) => {  
  let filter = parseFilterParams(req)
  let sort = parseSortParams(req)  
  // Calculate total number of items and pages
  const numberOfResults = await Subcategory.countDocuments()
  const numberOfPages = Math.ceil(numberOfResults / RESULTS_PER_PAGE)
  const page = calcPage(req.query.page, numberOfPages)  
  // Calculate number of items to skip based on page number
  const skip = (page - 1) * RESULTS_PER_PAGE
  const subcategories = await Subcategory
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(RESULTS_PER_PAGE)
    .populate('products')
  res.render('admin/subcategoryList', {
    title: "All Subcategories",
    subcategories,
    numberOfPages,
    numberOfResults,
    page,
  })
}

exports.newSubcategory = async (req, res) => {
  res.render('admin/subcategory', {
    title: "New Subcategory"
  })
}

exports.newSubcategorySave = async (req, res, next) => {
  const subcategory = formatSubcategory(req.body)
  await new Subcategory(subcategory).save(
    async (err, data) => {
      if (err) {
        console.log(err)
        return res.status(400).send()
      }
      for (let product in subcategory.products) {
        await Product.updateOne(
          { _id: product },        
          { $set: { subcategory: doc._id } }
        )
      }
      req.flash("success", "New subcategory added")
      res.status(200).send()
    }
  )
}

exports.editSubcategory = async (req, res) => {
  const subcategory = await Subcategory
    .findOne({ slug: req.params.slug })
    .populate('products')
    .populate('category')
  if (!subcategory) {
    req.flash("error", "Subcategory not found")
    res.redirect("/dashboard/subcategories")
    return
  }
  res.render('admin/subcategory', {
    subcategory,
    title: `Edit Subcategory - ${subcategory.title}`
  })
}

exports.editSubcategorySave = async (req, res, next) => {
  const subcategory = formatSubcategory(req.body)
  await Subcategory.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: subcategory },
    { returnNewDocument: true },
    async (err, doc) => {
      if (err)
        return res.status(400).send()
      // Remove all Product references to this Subcategory
      await Product.updateMany(
        { subcategory: doc._id },        
        { $set: { subcategory: null } }
      )
      // Rebuild Product references
      if (subcategory.products) {
        subcategory.products.forEach(async _id => {
          await Product.updateMany(
            { _id },        
            { $set: { subcategory: doc._id } }
          )
        })
      }
      // Manually call save() to trigger slug update
      doc.save()
      req.flash("success", "Subcategory has been updated")
      res.redirect("/dashboard/subcategories")
    }
  )
}

exports.deleteSubcategory = async (req, res) => {
  await Subcategory.findByIdAndRemove(req.params.id, 
    async (err, doc) => {
      if (err) {
        console.log(err)
        req.flash("error", "Error deleting subcategory, please try again")
        res.redirect("back")
        return
      }
      // Remove all Product references to this Subcategory
      await Product.updateMany(
        { subcategory: doc._id },        
        { $set: { subcategory: null } }
      )
      req.flash("success", "Subcategory deleted")
      res.redirect("/dashboard/subcategories")
    }
  )
}

exports.industries = async (req, res) => {
  let filter = parseFilterParams(req)
  let sort = parseSortParams(req)  
  // Calculate pagination variables
  const numberOfResults = await Industry.countDocuments(filter)
  const numberOfPages = Math.ceil(numberOfResults / RESULTS_PER_PAGE)
  const page = calcPage(req.query.page, numberOfPages)  
  // Calculate number of items to skip based on page number
  const skip = (page - 1) * RESULTS_PER_PAGE
  const industries = await Industry
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(RESULTS_PER_PAGE)
    .populate('subcategories')
  res.render('admin/industryList', {
    title: "All Industries",
    industries,
    numberOfPages,
    numberOfResults,
    page,
  })
}

exports.newIndustry = async (req, res) => {
  res.render('admin/industry', {
    title: "New Industry"
  })
}

exports.newIndustrySave = async (req, res, next) => {
  const industry = formatIndustry(req.body)
  await new Industry(industry).save(
    (err, data) => {
      if (err) 
        return res.status(400).send()             
      if (industry.subcategories) {
        industry.subcategories.forEach(async _id => {
          await Subcategory.updateMany(
            { _id },        
            { $push: { industries: doc._id } }
          )
        })
      } 
      // Attach document to 'req' to be used by the file upload handlers
      req.industry = data
      req.flash("success", "New industry added")
      next()
    }
  )
}

exports.deleteIndustry = async (req, res) => {
  await Industry.findByIdAndRemove(req.params.id, 
    (err, doc) => {
      if (err) {
        console.log(err)
        req.flash("error", "Error deleting industries, please try again")
        res.redirect("back")
        return
      }
      // Emulates 'rm -rf'
      rimraf(doc.publicFolder, () =>
        console.log("Industry deleted: " + doc.title)
      )
      req.flash("success", "Industry deleted")
      res.redirect("/dashboard/industries")
    }
  )
}

exports.editIndustry = async (req, res) => {
  const industry = await Industry
    .findOne({ slug: req.params.slug })
    .populate('subcategories')
  if (!industry) {
    req.flash("error", "Industry not found")
    res.redirect("/dashboard/industries")
    return
  }
  res.render('admin/industry', {
    industry,
    title: `Edit Industry - ${industry.title}`
  })
}

exports.editIndustrySave = async (req, res, next) => {  
  const industry = formatIndustry(req.body)
  await Industry.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: industry },
    { returnNewDocument: true },
    async (err, doc) => {
      if (err)
        return res.status(400).send()
      // Remove all Subcategory references to this Industry
      await Subcategory.updateMany(
        { industries: doc._id },        
        { $pull: { industries: doc._id } }
      )
      // Rebuild Subcategory references
      if (industry.subcategories) {
        industry.subcategories.forEach(async _id => {
          await Subcategory.updateMany(
            { _id },        
            { $push: { industries: doc._id } }
          )
        })
      }
      // Manually call save() to trigger slug update
      doc.save()
      // Attach document to 'req' to be used by the file upload handlers
      req.industry = doc
      req.flash("success", "Industry has been updated")
      next()
    }
  )  
}

// Handles uploading new images and rearranging/deleting existing images.
// Categories only have one image, which is saved as 'cover.jpg'
exports.uploadIndustryImage = async (req, res, next) => {
  const newImage = req.file
  const folder = `${req.industry.publicFolder}/images`
  // Initialise industry image folder
  mkdirp.sync(folder)
  // Delete existing image if required
  if ((newImage || req.body.deleteImage) && fs.existsSync(`${folder}/cover.jpg`)) {
    fs.unlinkSync(`${folder}/cover.jpg`) 
    fs.unlinkSync(`${folder}/cover-thumb.jpg`) 
    await Industry.findOneAndUpdate(
      {_id: req.industry._id}, 
      { $set: { hasImage: false } }
    )
  }
  if (!newImage) return next()
  // Generate optimised image (1000px on longest side)
  sharp(newImage.buffer)
    .rotate()
    .resize(1000, 1000)
    .max()
    .toFormat('jpg')
    .toFile(`${folder}/cover.jpg`)
    .then(() => console.log('New industry image uploaded'))
    .catch(err => console.error)
  // Generate thumbnail image (400px on longest side)
  sharp(newImage.buffer)
    .rotate()
    .resize(400, 400)
    .max()
    .toFormat('jpg')
    .toFile(`${folder}/cover-thumb.jpg`)
  // Set flag in database
  await Industry.findOneAndUpdate(
    {_id: req.industry._id}, 
    { $set: { hasImage: true } }
  )
  next()
}
