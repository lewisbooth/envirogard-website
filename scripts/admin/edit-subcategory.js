const form = document.forms['subcategory']
const titleInput = form.querySelector('input[name="title"]')
const categoryInput = form.querySelector('select[name="category"]')
const addProductInput = form.querySelector('[name="productDropdown"]')
const autocompleteContainer = form.querySelector('.edit-linked__listings--autocomplete')
const autocompleteResults = form.querySelector('.edit-linked__listings--autocomplete ul')
const productContainer = form.querySelector('.edit-linked__listings--container')
const deleteConfirmation = document.querySelector('#delete-item__lightbox')


// -------- Triggers --------- //

addProductInput.addEventListener('keyup', openDropdown)
addProductInput.addEventListener('focusin', openDropdown)


// ---- Auto-complete menu ---- //

let products = []
const SEARCH_API = '/api/products/search'

function openDropdown() {
  renderDropdown([], "Searching for products...")
  axios
    .post(SEARCH_API, { search: addProductInput.value })
    .then(res => {
      renderDropdown(res.data)
    })
}

function renderDropdown(productData, placeholder) {
  // Remove products that have already been added to the list
  const filteredProducts = productData.filter(entry => {
    let alreadyAddedToList = false
    products.forEach(product => {
      if (product.id === entry.id)
        alreadyAddedToList = true      
    })
    return !alreadyAddedToList
  })
  // Generate list HTML
  if (filteredProducts.length > 0) {
    autocompleteResults.innerHTML = filteredProducts.map(product => 
      `<li data-id="${product.id}" 
        data-edit="${product.editURL}" 
        onmousedown="addProduct(event)">
          ${product.title}
      </li>`
    ).join('')
  } else if (placeholder) {
    autocompleteResults.innerHTML = `<li>${placeholder}</li>`
  } else {
    autocompleteResults.innerHTML = `<li>No products found</li>`
  }
  // Show the menu
  autocompleteContainer.removeAttribute('hidden')
}


// ------- Product List ------ //

updateProductsFromDOM()

function updateProductsFromDOM() {
  const productElements = productContainer.querySelectorAll('div[data-id]') || []
  products = []
  productElements.forEach(e => {
      const { id } = e.dataset
      const editURL = e.querySelector('.button').getAttribute('href')
      const title = e.querySelector('span').innerText    
      products.push({ id, editURL, title })
    })
}

function addProduct(e) {
  products.push({
    id: e.target.dataset.id, 
    title: e.target.innerText, 
    editURL: e.target.dataset.edit
  })
  sortProductList()
  renderProductList()
  addProductInput.value = ''
}

function removeProduct(e) {
  const id = e.target.parentElement.parentElement.dataset.id
  let index = 0
  products.forEach((product, i) => {
    if (product.id === id)
      index = i
  })
  products.splice(index,1)
  renderProductList()
}

function sortProductList() {
  products = products.sort((a, b) => 
    a.title > b.title
  )
}

function renderProductList() {
  productContainer.innerHTML = products.map(product => `
    <div data-id="${product.id}">
      <span>${product.title}</span>
      <div>
        <a href=${product.editURL} class="button" target="_blank">Edit Product</a>
        <span onclick="removeProduct(event)">Remove</span>
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
      title: titleInput.value,
      category: categoryInput.value,
      products: JSON.stringify(products.map(product => product.id))
    }
  ).then(() =>
    window.location = "/dashboard/subcategories"
  ).catch(err => {
    const message = err.response.data || {
      title: "Error uploading subcategory",
      text: "Please try again. If the problem persists, please contact AMP."
    }
    errors.flash(message.title, message.text)
  })
}


// ---  Delete Subcategory --- //

function toggleDeleteConfirmation() {
  deleteConfirmation.classList.toggle("active")
}