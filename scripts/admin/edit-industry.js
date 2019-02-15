const form = document.forms['industry']
const imageInput = form.querySelector('[name="coverImage"]')
const imagePreviewContainer = form.querySelector('.image-preview')
const imagePreview = imagePreviewContainer.querySelector('.image-preview img')
const copyFromTitleLink = form.querySelector('#copy-from-title')
const copyFromDescriptionLink = form.querySelector('#copy-from-description')
const uploadProgress = document.querySelector('.admin__upload-progress')
const uploadProgressBar = uploadProgress.querySelector('progress')
const deleteConfirmation = document.querySelector('#delete-item__lightbox')
const editorElement = document.getElementById('pell')
const descriptionContent = document.getElementById('pell-data').value
const subcategoryContainer = document.querySelector('.edit-linked__listings--container')
const addSubcategoryInput = form.querySelector('[name="subcategoryDropdown"]')
const autocompleteContainer = form.querySelector('.edit-linked__listings--autocomplete')
const autocompleteResults = form.querySelector('.edit-linked__listings--autocomplete ul')

const inputs = {
  title: form.querySelector('input[name="title"]'),
  metaTitle: form.querySelector('input[name="metaTitle"]'),
  metaDescription: form.querySelector('textarea[name="metaDescription"]')
}

const deleteImage = form.querySelector('input[name="deleteImage"]')

// -------- Triggers --------- //

addSubcategoryInput.addEventListener('keyup', openDropdown)
addSubcategoryInput.addEventListener('focusin', openDropdown)
copyFromTitleLink.addEventListener('click', copyFromTitle)
imageInput.addEventListener('change', previewImage)


// ------- Text Editor -------- //

const editor = pell.init({
  element: editorElement,
  actions: ['bold', 'italic', 'heading2', 'paragraph', 'link', 'olist', 'ulist'],
  onChange: html => { }
})

// Copy the decoded HTML from hidden textarea to Pell editor
editor.content.innerHTML = descriptionContent

editor.addEventListener("paste", function (event) {
  // cancel paste
  event.preventDefault()

  // get text representation of clipboard
  var text = (event.originalEvent || event).clipboardData.getData('text/plain')

  // insert text manually
  document.execCommand("insertHTML", false, text)
})


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


// ------ Meta Shortcuts ----- //

function copyFromTitle() {
  if (inputs.title.value)
    inputs.metaTitle.value = inputs.title.value + ' for Hire'
}

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
  const data = new FormData()
  // Append all basic text inputs
  for (let input in inputs)
    if (inputs[input])
      data.append(input, inputs[input].value)
  if (deleteImage)
    data.append('deleteImage', deleteImage.checked)
  // Append Pell editor
  data.append("description", editor.content.innerHTML)
  data.append("subcategories", JSON.stringify(subcategories.map(subcategory => subcategory.id)))
  // Append image
  if (imageInput.files && imageInput.files[0]) {
    data.append("coverImage", imageInput.files[0])
    uploadProgress.classList.add('active')
  }
  // Increment upload progress bar
  const onUploadProgress = p =>
    uploadProgressBar.value = p.loaded / p.total
  // Send form data
  axios.post(
    window.location.pathname,
    data,
    { onUploadProgress }
  ).then(() =>
    window.location = "/dashboard/industries"
  ).catch(err => {
    const message = err.response.data || {
      title: "Error uploading industry",
      text: "Please try again. If the problem persists, please contact AMP."
    }
    errors.flash(message.title, message.text)
  })
}


// -----  Delete Category ----- //

function toggleDeleteConfirmation() {
  deleteConfirmation.classList.toggle("active")
}