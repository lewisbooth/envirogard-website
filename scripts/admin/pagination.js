// Parse the query strings on page load
const urlParams = getUrlParams(window.location.search)

function changePage(e) {
  const newPage = e.target.dataset.key
  urlParams.page = newPage
  const newQuery = buildQueryString(urlParams)
  window.location = window.location.pathname + newQuery
}


// ----- Helper Functions ----- //

function buildQueryString (params) {
  return "?" + Object.keys(params)
    .map(key => key + '=' + params[key])
    .join('&')
} 

function getUrlParams(search) {
  if (search.length === 0) return {}
  let hashes = search.slice(search.indexOf('?') + 1).split('&')
  return hashes.reduce((params, hash) => {
      let [key, val] = hash.split('=')
      return Object.assign(params, {[key]: decodeURIComponent(val)})
  }, {})
}