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
    hasImage: Boolean,    
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
    subcategories: [ObjectId]
  },
  options
)

categorySchema.index({ title: 1 })
categorySchema.index({ slug: 1 })

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

// Generate slug from product name
// Call manually with .save() when updating an existing record
// because pre "save" functions do not run on "update" methods
categorySchema.pre("save", async function(next) {
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

module.exports = mongoose.model("Category", categorySchema)
