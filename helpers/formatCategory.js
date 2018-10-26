// Parses req.body into the Category schema
// Strips any random fields and roughly enforces types
exports.formatCategory = data => {
  return {
    title: String(data.title),
    // subcategory: String(data.subcategory),
    description: {
      short: String(data.shortDescription),
      long: String(data.longDescription),
    },
    meta: {
      title: String(data.metaTitle) || String(data.title),
      description: String(data.metaDescription) || String(data.description),
    },
  }
}