const readMoreButton = document.querySelector('.category__description--read-more')
const categoryDescription = document.querySelector('.category__description')
const sortByInput = document.querySelector('select[name="sortBy"]')
const searchForm = document.querySelector('form[name="search"]')
const searchInput = document.querySelector('input[name="search"]')

// Parse the query strings on page load
const urlParams = getUrlParams(window.location.search)

// Building query strings manually prevents forms clearing each other
sortByInput.addEventListener('change', () => {
  if (sortByInput.value)
    urlParams.sortBy = sortByInput.value
  else
    delete urlParams.sortBy
  submitInput()
})

// Handle search input
if (searchForm) {
  searchForm.addEventListener('submit', e => {
    e.preventDefault()
    if (searchInput.value)
      urlParams.search = searchInput.value
    else
      delete urlParams.search
    submitInput()
  })
}

// Toggle extended description
if (readMoreButton) {
  readMoreButton.addEventListener('click', () =>
    categoryDescription.classList.toggle('expanded')
  )
}


// ----- Helper Functions ----- //

function submitInput() {
  const newQuery = buildQueryString(urlParams)
  window.location = window.location.pathname + newQuery
}

function buildQueryString(params) {
  if (Object.keys(params).length > 0)
    return "?" + Object.keys(params)
      .map(key => key + '=' + params[key])
      .join('&')
  else
    return ''
}

function getUrlParams(search) {
  if (search.length === 0) return {}
  let hashes = search.slice(search.indexOf('?') + 1).split('&')
  return hashes.reduce((params, hash) => {
    let [key, val] = hash.split('=')
    return Object.assign(params, { [key]: decodeURIComponent(val) })
  }, {})
}