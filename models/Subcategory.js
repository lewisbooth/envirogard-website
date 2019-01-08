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

const subcategorySchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Please supply a subcategory title"
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
    },
    category: {
      type: ObjectId, ref: 'Category'
    },
    industries: [{
      type: ObjectId, ref: 'Industry'
    }],
  },
  options
)

subcategorySchema.index({ title: 1 })
subcategorySchema.index({ slug: 1 })

// One-to-many relationship with Products
// Products have a { subcategory: ObjectId } field
subcategorySchema
  .virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'subcategory'
  })

subcategorySchema
  .virtual('publicFolder')
  .get(function () {
    return `${process.env.PUBLIC_FOLDER}/cms/subcategories/${this._id}`
  })

subcategorySchema
  .virtual('pageURL')
  .get(function () {
    return this.category ?
      `/categories/${this.category.slug}/${this.slug}`
      : null
  })

subcategorySchema
  .virtual('editURL')
  .get(function () {
    return `/dashboard/subcategories/${this.slug}`
  })

subcategorySchema
  .virtual('mainImageURL')
  .get(function () {
    return this.hasImage ?
      `/cms/subcategories/${this._id}/images/cover.jpg` :
      '/images/default/no-image.png'
  })

subcategorySchema
  .virtual('mainImageThumbnailURL')
  .get(function () {
    return this.hasImage ?
      `/cms/subcategories/${this._id}/images/cover-thumb.jpg` :
      '/images/default/no-image.png'
  })

// Always populate the category in order to generate the full page URL
const autoPopulate = function (next) {
  this.populate('category')
  next()
}

subcategorySchema.
  pre('findOne', autoPopulate).
  pre('find', autoPopulate)

// Generate slug from product name
// Call manually with .save() when updating an existing record
// because pre "save" functions do not run on "update" methods
subcategorySchema.pre("save", async function (next) {
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

module.exports = mongoose.model("Subcategory", subcategorySchema)
