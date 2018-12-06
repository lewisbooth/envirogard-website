// Logs dynamic access requests in the format
// Wed Jul 04 2018 14:23:45 GMT+0100 (BST) GET /path ::ffff:127.0.0.1 username
exports.logging = (req, res, next) => {
  // Ignore sitemap generator
  if (req.headers['user-agent'].includes('Node/SitemapGenerator'))
    return next()
  const timestamp = new Date().toString()
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress
  // Log the formatted request data
  console.log(`${timestamp} ${req.method} ${req.path} ${ip} ${req.user ? req.user.email : ""}`)
  // Don't leak login attempts to the server log!
  if (req.method === "POST" && req.body && req.path !== '/login')
    console.log(req.body)
  next()
}