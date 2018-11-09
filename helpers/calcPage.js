// Server-side validation for the requested page number
exports.calcPage = (requestedPage, numberOfPages) => {
  if (!parseInt(requestedPage) || requestedPage < 1)
    requestedPage = 1
  let page = Math.max(1, parseInt(requestedPage))
  // Validate page number against max page value
  if (page > numberOfPages)
    page = numberOfPages
  return page
}