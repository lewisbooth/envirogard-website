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

const pageSchema = new Schema(
  {
    title: String,
    pageContent: {
      type: String,
      required: "Please supply some page content"
    },
    customContent: [String]
  },
  options
);

module.exports = mongoose.model("Pages", pageSchema);
