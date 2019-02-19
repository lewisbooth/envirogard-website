const { generateSlug } = require('../helpers/generateSlug')
const mongoose = require("mongoose")
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
      type: ObjectId,
      ref: 'Subcategory',
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
  title: 'text',
  'description.short': 'text',
})

productSchema.index({
  title: 1,
  slug: 1
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

productSchema.pre('save', function (next) {
  generateSlug(next, this)
})

module.exports = mongoose.model("Product", productSchema)
