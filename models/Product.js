const mongoose = require("mongoose")
const slugify = require("slugify")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const options = {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true 
  }
}

const productSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Please supply a product title"
    },
    subcategory: {
      type: ObjectId, ref: 'Subcategory',
      default: null
    },
    slug: {
      type: String,
      trim: true
    },
    images: [{
      type: String,
      trim: true
    }],
    description: {
      short: {
        type: String,
        trim: true,
        required: "Please supply a short description"
      },
      long: {
        type: String,
        trim: true
      },
    },
    meta: {
      title: {
        type: String,
        trim: true,
        required: "Please supply a meta title"
      },
      description: {
        type: String,
        trim: true,
        required: "Please supply a meta description"
      },
    },
    features: [{
      type: String,
      trim: true
    }],
    specifications: [[{
      type: String,
      trim: true
    }]],
    youtubeID: {
      type: String,
      trim: true
    },
    manualPDF: Boolean
  },
  options
)

productSchema.index({
  slug: 1,
  title: 1
})

productSchema
  .virtual('publicFolder')
  .get(function () {
    return `${process.env.PUBLIC_FOLDER}/cms/products/${this._id}`
  })

productSchema
  .virtual('pageURL')
  .get(function () {
    return `/products/${this.slug}`
  })

productSchema
  .virtual('editURL')
  .get(function () {
    return `/dashboard/products/${this.slug}`
  })

productSchema
  .virtual('manualURL')
  .get(function () {
    const url = `/cms/products/${this._id}/docs/manual.pdf`
    return this.manualPDF ? url : ''
  })

productSchema
  .virtual('mainImageThumbnailURL')
  .get(function () {
    if (this.images.length > 0) {
      return `/cms/products/${this._id}/images/${this.images[0]}-thumb.jpg`
    }
    else {
      return "/images/default/no-image.png"
    }
  })

productSchema
  .virtual('imageURLs')
  .get(function () {
    return this.images.map(image =>
      `/cms/products/${this._id}/images/${image}.jpg`
    )
  })

// Generate slug from product name
// Call manually with .save() when updating an existing record
// because pre "save" functions do not run on "update" methods
productSchema.pre("save", async function(next) {
  this.slug = slugify(`${this.title}`, { lower: true })
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i')
  const productWithSlug = await this.constructor.find({ slug: slugRegEx })
  // If slug already exists, add a unique number to the end
  if (productWithSlug.length) {
    if (productWithSlug[0]._id.toString() === this._id.toString()) {
      return next()
    }
    this.slug = `${this.slug}-${productWithSlug.length + 1}`
  }
  next()
})

module.exports = mongoose.model("Product", productSchema)
