const form = document.forms['subcategory']
const addSubcategoryInput = form.querySelector('[name="subcategoryDropdown"]')
const autocompleteContainer = form.querySelector('.edit-linked__listings--autocomplete')
const autocompleteResults = form.querySelector('.edit-linked__listings--autocomplete ul')
const subcategoryContainer = form.querySelector('.edit-linked__listings--container')

const MAX_SUBCATEGORIES = 5

// -------- Triggers --------- //

addSubcategoryInput.addEventListener('keyup', openDropdown)
addSubcategoryInput.addEventListener('focusin', openDropdown)


// ---- Auto-complete menu ---- //

let subcategories = []
const SEARCH_API = '/api/subcategories/search'

function openDropdown() {
  renderDropdown([], "Searching for subcategories...")
  axios
    .post(SEARCH_API, { search: addSubcategoryInput.value })
    .then(res => {
      renderDropdown(res.data)
    })
}

function renderDropdown(subcategoryData, placeholder) {
  // Remove subcategories that have already been added to the list
  const filteredSubcategories = subcategoryData.filter(entry => {
    let alreadyAddedToList = false
    subcategories.forEach(subcategory => {
      if (subcategory.id === entry.id)
        alreadyAddedToList = true
    })
    return !alreadyAddedToList
  })
  // Generate list HTML
  if (filteredSubcategories.length > 0) {
    autocompleteResults.innerHTML = filteredSubcategories.map(subcategory =>
      `<li data-id="${subcategory.id}" 
        data-edit="${subcategory.editURL}" 
        onmousedown="addSubcategory(event)">
          ${subcategory.title}
      </li>`
    ).join('')
  } else if (placeholder) {
    autocompleteResults.innerHTML = `<li>${placeholder}</li>`
  } else {
    autocompleteResults.innerHTML = `<li>No subcategories found</li>`
  }
  // Show the menu
  autocompleteContainer.removeAttribute('hidden')
}


// ------- Subcategory List ------ //

updateSubcategoriesFromDOM()

function updateSubcategoriesFromDOM() {
  const subcategoryElements = subcategoryContainer.querySelectorAll('div[data-id]') || []
  subcategories = []
  subcategoryElements.forEach(e => {
    const { id } = e.dataset
    const editURL = e.querySelector('.button').getAttribute('href')
    const title = e.querySelector('span').innerText
    subcategories.push({ id, editURL, title })
  })
}

function addSubcategory(e) {
  if (subcategories.length >= MAX_SUBCATEGORIES)
    return
  subcategories.push({
    id: e.target.dataset.id,
    title: e.target.innerText,
    editURL: e.target.dataset.edit
  })
  sortSubcategoryList()
  renderSubcategoryList()
  addSubcategoryInput.value = ''
}

function removeSubcategory(e) {
  const id = e.target.parentElement.parentElement.dataset.id
  let index = 0
  subcategories.forEach((subcategory, i) => {
    if (subcategory.id === id)
      index = i
  })
  subcategories.splice(index, 1)
  renderSubcategoryList()
}

function sortSubcategoryList() {
  subcategories = subcategories.sort((a, b) =>
    a.title > b.title
  )
}

function renderSubcategoryList() {
  subcategoryContainer.innerHTML = subcategories.map(subcategory => `
    <div data-id="${subcategory.id}">
      <span>${subcategory.title}</span>
      <div>
        <a href=${subcategory.editURL} class="button" target="_blank">Edit Subcategory</a>
        <span onclick="removeSubcategory(event)">Remove</span>
      </div>
    </div>
  `).join('')
}


// ----- Form Submission ----- //

function submitForm(e) {
  e.preventDefault()
  errors.clear()
  // Send form data
  axios.post(
    window.location.pathname,
    {
      popularProducts: JSON.stringify(subcategories.map(subcategory => subcategory.id))
    }
  ).then(() =>
    window.location = "/dashboard/settings"
  ).catch(err => {
    const message = err.response.data || {
      title: "Error uploading subcategory",
      text: "Please try again. If the problem persists, please contact AMP."
    }
    errors.flash(message.title, message.text)
  })
}