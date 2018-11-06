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

industrySchema.index({ title: 1 })
industrySchema.index({ slug: 1 })

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

// Generate slug from product name
// Call manually with .save() when updating an existing record
// because pre "save" functions do not run on "update" methods
industrySchema.pre("save", async function(next) {
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

module.exports = mongoose.model("Industry", industrySchema)
