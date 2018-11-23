// Redirect global search requests to /search
exports.globalSearch = (req, res, next) => {
  if (req.query.globalSearch && req.path !== '/search')
    return res.redirect(`/search?globalSearch=${req.query.globalSearch}`)
  next()
}