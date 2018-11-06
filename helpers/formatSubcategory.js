// Parses req.body into the Subcategory schema
// Strips any random fields and roughly enforces types
exports.formatSubcategory = data => {
  return {
    title: String(data.title),
    category: String(data.category) || null,
    products: JSON.parse(data.products),
  }
}