// Parses req.body into the Category schema
// Strips any random fields and roughly enforces types
exports.formatIndustry = data => {
  return {
    title: String(data.title),
    // subcategory: String(data.subcategory),
    description: String(data.description),
    meta: {
      title: String(data.metaTitle) || String(data.title),
      description: String(data.metaDescription) || String(data.description),
    },
    subcategories: JSON.parse(data.subcategories),
  }
}