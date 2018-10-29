const mongoose = require("mongoose")
const slugify = require("slugify")
const Category = mongoose.model("Category")
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
    products: [ObjectId]
  },
  options
)

subcategorySchema.index({ title: 1 })
subcategorySchema.index({ slug: 1 })

subcategorySchema
  .virtual('pageURL')
  .get(function () {
    return `/categories/${this.slug}`
  })

// Generate slug from product name
// Call manually with .save() when updating an existing record
// because pre "save" functions do not run on "update" methods
subcategorySchema.pre("save", async function(next) {
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
