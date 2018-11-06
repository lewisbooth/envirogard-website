// Parses req.body into filters for Mongo queries
exports.parseFilterParams = req => {
  // Extract query params for easy use
  let search, subcategory = ''
  if (req.query)
    search = req.query.search
    subcategory = req.query.subcategory
  if (req.body)
    search = req.body.search
    subcategory = req.body.subcategory
  let filter = {}
  if (search)
    filter.title = { $regex: search, $options: "i" }
  if (subcategory && subcategory !== "all")
    filter.subcategory = subcategory
  return filter
}