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

const categorySchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Please supply a category title"
    },
    slug: {
      type: String,
      trim: true
    },
    hasImage: {
      type: Boolean,
      default: false
    },
    description: {
      short: {
        type: String,
        required: "Please supply a short description",
        trim: true
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
    }
  },
  options
)

categorySchema.index({
  title: 'text',
  'description.short': 'text',
})

categorySchema.index({
  title: 1,
  slug: 1
})

// One-to-many relationship with Subcategory
// Subcategories have a { category: ObjectId } field
categorySchema
  .virtual('subcategories', {
    ref: 'Subcategory',
    localField: '_id',
    foreignField: 'category'
  })

categorySchema
  .virtual('publicFolder')
  .get(function () {
    return `${process.env.PUBLIC_FOLDER}/cms/categories/${this._id}`
  })

categorySchema
  .virtual('pageURL')
  .get(function () {
    return `/categories/${this.slug}`
  })

categorySchema
  .virtual('editURL')
  .get(function () {
    return `/dashboard/categories/${this.slug}`
  })

categorySchema
  .virtual('mainImageURL')
  .get(function () {
    return this.hasImage ?
      `/cms/categories/${this._id}/images/cover.jpg` :
      '/images/default/no-image.png'
  })

categorySchema
  .virtual('mainImageThumbnailURL')
  .get(function () {
    return this.hasImage ?
      `/cms/categories/${this._id}/images/cover-thumb.jpg` :
      '/images/default/no-image.png'
  })

// Generate slug from document title
categorySchema.pre('save', function (next) {
  generateSlug(next, this)
})

module.exports = mongoose.model("Category", categorySchema)
