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
    slug: {
      type: String,
      trim: true
    },
    images: [{
      type: String,
      trim: true
    }],
    subcategory: {
      type: ObjectId,
      ref: "Subcategory",
      // required: "Please supply a subcategory"
    },
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
  name: 1
})

productSchema
  .virtual('manualURL')
  .get(function () {
    const url = `/cms/products/${this._id}/docs/manual.pdf`
    return this.manualPDF ? url : ''
  })

// Generate slug from product name
// Runs each time the record is saved
productSchema.pre("save", async function(next) {
  if (!this.isModified("title")) {
    return next()
  }
  this.slug = slugify(`${this.title}`, { lower: true })
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, "i")
  // If slug already exists, add a unique number to the end
  const productWithSlug = await this.constructor.find({ slug: slugRegEx })
  if (productWithSlug.length) {
    this.slug = `${this.slug}-${productWithSlug.length + 1}`
  }
  next()
})

module.exports = mongoose.model("Product", productSchema)
