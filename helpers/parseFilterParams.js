// Parses req.body into filters for Mongo queries
exports.parseFilterParams = req => {
  // Extract query params for easy use
  let search = req.query.search || req.query.globalSearch || req.body.search
  let subcategory = req.query.subcategory || req.body.subcategory
  let filter = {}
  if (search)
    filter.title = { $regex: search, $options: "i" }
  if (subcategory && subcategory !== "all")
    filter.subcategory = subcategory
  if (req.params.slug)
    filter.slug = req.params.slug
  return filter
}