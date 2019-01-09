const form = document.forms['subcategory']
const imageInput = form.querySelector('[name="coverImage"]')
const imagePreviewContainer = form.querySelector('.image-preview')
const imagePreview = imagePreviewContainer.querySelector('.image-preview img')
const copyFromTitleLink = form.querySelector('#copy-from-title')
const copyFromDescriptionLink = form.querySelector('#copy-from-description')
const addProductInput = form.querySelector('[name="productDropdown"]')
const autocompleteContainer = form.querySelector('.edit-linked__listings--autocomplete')
const autocompleteResults = form.querySelector('.edit-linked__listings--autocomplete ul')
const productContainer = form.querySelector('.edit-linked__listings--container')
const deleteConfirmation = document.querySelector('#delete-item__lightbox')
const uploadProgress = document.querySelector('.admin__upload-progress')
const uploadProgressBar = uploadProgress.querySelector('progress')

const inputs = {
  title: form.querySelector('input[name="title"]'),
  category: form.querySelector('select[name="category"]'),
  shortDescription: form.querySelector('textarea[name="shortDescription"]'),
  longDescription: form.querySelector('textarea[name="longDescription"]'),
  metaTitle: form.querySelector('input[name="metaTitle"]'),
  metaDescription: form.querySelector('textarea[name="metaDescription"]'),
  deleteImage: form.querySelector('input[name="deleteImage"]')
}


// -------- Triggers --------- // 

imageInput.addEventListener('change', previewImage)
addProductInput.addEventListener('keyup', openDropdown)
addProductInput.addEventListener('focusin', openDropdown)
copyFromTitleLink.addEventListener('click', copyFromTitle)
copyFromDescriptionLink.addEventListener('click', copyFromDescription)


// ------ Meta Shortcuts ----- //

function copyFromTitle() {
  if (inputs.title.value)
    inputs.metaTitle.value = inputs.title.value + ' for Hire'
}

function copyFromDescription() {
  if (inputs.shortDescription.value)
    inputs.metaDescription.value = inputs.shortDescription.value
}


// ------ Image Preview ------ //

function previewImage(e) {
  const input = e.target
  if (input.files && input.files[0]) {
    var reader = new FileReader()
    reader.onload = e => {
      imagePreview.setAttribute('src', e.target.result)
      imagePreviewContainer.removeAttribute('hidden')
    }
    reader.readAsDataURL(input.files[0])
  } else {
    imagePreview.setAttribute('src', '')
    imagePreviewContainer.setAttribute('hidden', true)
  }
}

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
  products.splice(index, 1)
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
  const data = new FormData()
  // Append all basic text inputs
  for (let input in inputs)
    if (inputs[input])
      data.append(input, inputs[input].value)
  // Append image
  if (imageInput.files && imageInput.files[0]) {
    data.append("coverImage", imageInput.files[0])
    uploadProgress.classList.add('active')
  }
  // Append product list
  data.append("products", JSON.stringify(products.map(product => product.id)))
  // Increment upload progress bar
  const onUploadProgress = p =>
    uploadProgressBar.value = p.loaded / p.total
  // Send form data
  axios.post(
    window.location.pathname,
    data,
    { onUploadProgress }
  ).then(() =>
    window.location = "/dashboard/subcategories"
  ).catch(err => {
    const message = err.response.data || {
      title: "Error uploading category",
      text: "Please try again. If the problem persists, please contact AMP."
    }
    errors.flash(message.title, message.text)
  })
}


// ---  Delete Subcategory --- //

function toggleDeleteConfirmation() {
  deleteConfirmation.classList.toggle("active")
}