// Parses results page forms into sorting rules for Mongo queries
exports.parseSortParams = body => {
  // Extract query params for easy use
  const { sortBy } = body
  let sort = { updatedAt: -1 }
  if (sortBy === "oldest")
    sort = { updatedAt: 1 }
  if (sortBy === "az")
    sort = { title: 1 }
  if (sortBy === "za")
    sort = { title: -1 }
  return sort
}