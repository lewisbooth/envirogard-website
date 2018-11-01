// Parses req.body into filters for Mongo queries
exports.parseFilterParams = body => {
  // Extract query params for easy use
  const { search, subcategory } = body
  let filter = {}
  if (search)
    filter.title = { $regex: search, $options: "i" }
  if (subcategory && subcategory !== "all")
    filter.subcategory = subcategory
  return filter
}