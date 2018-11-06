// Parses req.body into sorting rules for Mongo queries
exports.parseSortParams = (req, defaultSort = 'newest') => {
  // Extract query params for easy use
  let sortBy = req.query.sortBy || req.body.sortBy || defaultSort
  if (sortBy === 'newest')
    sort = { updatedAt: -1 }
  if (sortBy === 'oldest')
    sort = { updatedAt: 1 }
  if (sortBy === 'az')
    sort = { title: 1 }
  if (sortBy === 'za')
    sort = { title: -1 }
  return sort
}