const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const options = {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
}

const settingsSchema = new Schema(
  {
    popularProducts: [{
      type: ObjectId,
      ref: 'Subcategory'
    }],
  },
  options
)

settingsSchema.statics.getSettings = async function () {
  return this
    .findOne({})
    .populate('popularProducts')
}

module.exports = mongoose.model("Settings", settingsSchema)
