// Parses req.body into the Product schema 
exports.formatProduct = data => {
  const product = {
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
    features: JSON.parse(data.features),
    specifications: JSON.parse(data.specifications),
    youtubeID: String(data.youtubeID),
  }
  return product
}