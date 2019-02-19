const slugify = require("slugify")

exports.generateSlug = async function (next, doc) {
  doc.slug = slugify(doc.title, { lower: true })
  if (!doc.isModified('slug')) {
    return next()
  }
  const slugRegEx = new RegExp(`^(${doc.slug})((-[0-9]*$)?)`, 'i')
  const docsWithSlug = await doc.constructor.find({ slug: slugRegEx })
  if (docsWithSlug.length && docsWithSlug[0]._id.toString() !== doc._id.toString()) {
    doc.slug = `${doc.slug}-${docsWithSlug.length + 1}`
  }
  next()
}