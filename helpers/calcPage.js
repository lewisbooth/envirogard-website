// Server-side validation for the requested page number
exports.calcPage = (requestedPage, numberOfPages) => {
  let page = Math.max(1, parseInt(requestedPage))
  // Validate page number against max page value
  if (page > numberOfPages)
    page = numberOfPages
  return page
}