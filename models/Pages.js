const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const options = {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};

const pagesSchema = new Schema(
  {
    title: String,
    html: String,
  },
  options
);

module.exports = mongoose.model("Pages", pagesSchema);
