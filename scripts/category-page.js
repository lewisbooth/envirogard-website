const readMoreButton = document.querySelector('.category__description--read-more')
const categoryDescription = document.querySelector('.category__description')
const sortByInput = document.querySelector('select[name="sortBy"]')
const searchForm = document.querySelector('form[name="search"]')
const searchInput = document.querySelector('input[name="search"]')

// Parse the query strings on page load
const urlParams = getUrlParams(window.location.search)

// Building query strings manually prevents forms clearing each other
sortByInput.addEventListener('change', () => {
  urlParams.sortBy = sortByInput.value
  submitInput()
})

searchForm.addEventListener('submit', e => {
  e.preventDefault()
  urlParams.search = searchInput.value
  submitInput()
})

readMoreButton.addEventListener('click', () => 
  categoryDescription.classList.toggle('expanded')
)


// ----- Helper Functions ----- //

function submitInput() {  
  const newQuery = buildQueryString(urlParams)
  window.location = window.location.pathname + newQuery
}

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