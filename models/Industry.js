const { generateSlug } = require('../helpers/generateSlug')
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const options = {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
}

const industrySchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Please supply an industry title"
    },
    slug: {
      type: String,
      trim: true
    },
    hasImage: Boolean,
    description: {
      type: String,
      trim: true,
      required: "Please supply a description"
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
    }
  },
  options
)

industrySchema.index({
  title: 'text',
  description: 'text',
  slug: 'text'
})

industrySchema.index({
  title: 1,
  slug: 1
})

// One-to-many relationship with Subcategory & Cateory
// Subcategories/Categories have a { industry: [ObjectId] } field

industrySchema
  .virtual('subcategories', {
    ref: 'Subcategory',
    localField: '_id',
    foreignField: 'industries'
  })

industrySchema
  .virtual('categories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'industries'
  })

industrySchema
  .virtual('pageURL')
  .get(function () {
    return `/industries/${this.slug}`
  })

industrySchema
  .virtual('editURL')
  .get(function () {
    return `/dashboard/industries/${this.slug}`
  })

industrySchema
  .virtual('publicFolder')
  .get(function () {
    return `${process.env.PUBLIC_FOLDER}/cms/industries/${this._id}`
  })

industrySchema
  .virtual('mainImageURL')
  .get(function () {
    return this.hasImage ?
      `/cms/industries/${this._id}/images/cover.jpg` :
      '/images/default/no-image.png'
  })

industrySchema
  .virtual('mainImageThumbnailURL')
  .get(function () {
    return this.hasImage ?
      `/cms/industries/${this._id}/images/cover-thumb.jpg` :
      '/images/default/no-image.png'
  })

// Generate slug from document name
industrySchema.pre('save', function (next) {
  generateSlug(next, this)
})

module.exports = mongoose.model("Industry", industrySchema)
