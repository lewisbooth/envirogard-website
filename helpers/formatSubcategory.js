// Parses req.body into the Subcategory schema
// Strips any random fields and roughly enforces types
exports.formatSubcategory = data => {
  return {
    title: String(data.title),
    description: {
      short: String(data.shortDescription),
      long: String(data.longDescription),
    },
    meta: {
      title: String(data.metaTitle) || String(data.title),
      description: String(data.metaDescription) || String(data.description),
    },
    category: String(data.category) || null,
    products: JSON.parse(data.products),
  }
}