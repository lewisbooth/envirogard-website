// -------- Selectors --------- //

const form = document.forms['product']
const inputs = {
  title: form.querySelector('input[name="title"]'),
  subcategory: form.querySelector('select[name="subcategory"]'),
  shortDescription: form.querySelector('textarea[name="shortDescription"]'),
  longDescription: form.querySelector('textarea[name="longDescription"]'),
  metaTitle: form.querySelector('input[name="metaTitle"]'),
  metaDescription: form.querySelector('textarea[name="metaDescription"]'),
  youtubeID: form.querySelector('input[name="youtubeID"]'),
  deleteManual: form.querySelector('input[name="deleteManual"]'),
}
let newImageInput = form.querySelector('input[name="newImage"]')
const newImageText = form.querySelector('.edit-product__images--new--text')
const imagesContainer = form.querySelector('.edit-product__images')
const newImageBlock = imagesContainer.querySelector('.edit-product__images--new')
const copyFromTitleLink = form.querySelector('#copy-from-title')
const copyFromDescriptionLink = form.querySelector('#copy-from-description')
const featuresContainer = form.querySelector('div[data-multi="features"]')
const featureInputs = featuresContainer.querySelectorAll('input')
const specsContainer = form.querySelector('div[data-multi="specifications"]')
const specInputs = specsContainer.querySelectorAll('div[data-key]')
const addSpec = specsContainer.querySelector('.multiple-input__add')
const manualPDF = form.querySelector('input[name="manualPDF"]')
const uploadProgress = document.querySelector('.admin__upload-progress')
const uploadProgressBar = uploadProgress.querySelector('progress')
const deleteConfirmation = document.querySelector('#delete-item__lightbox')


// -------- Triggers --------- //

newImageInput.addEventListener('change', addNewImage)
copyFromTitleLink.addEventListener('click', copyFromTitle)
copyFromDescriptionLink.addEventListener('click', copyFromDescription)


// --------- Images ---------- //

const newImageBlockTemplate = newImageBlock.innerHTML

// When a new image file is selected, create a client-side preview block
// File input containing image data is moved inside the preview block
function addNewImage(e) {
  const input = e.target
  if (input.files && input.files[0]) {    
    var reader = new FileReader()    
    reader.onload = e => {     
      // Calculate index (key) to uniquely identify the file 
      const key = imagesContainer.querySelectorAll('.edit-product__images--entry').length
      // Max 20 images
      if (key > 20) 
        return
      // Create new preview block from template
      const imagePreview = renderTemplate(`
        <div 
          class="edit-product__images--entry" 
          data-key=${key}
          draggable="true" 
          ondragstart="imageDragStart(event)" 
          ondragenter="dragEnter(event)" 
          ondragleave="dragLeave(event)" 
          ondragover="dragOver(event)" 
          ondrop="imageDrop(event)" >
          <img src="#"/>
          <div class="edit-product__images--entry--delete" onclick="deleteImage(event)">×</div> 
        </div>
      `)
      // Attach file input data to preview image src
      imagePreview.querySelector('img').setAttribute('src', e.target.result)
      // Set unique field name on file input
      newImageInput.setAttribute('name', `image-${key}`)
      // Move file input into preview block
      imagePreview.appendChild(newImageInput)
      // Append preview block to container <div>
      imagesContainer.insertBefore(imagePreview, newImageBlock)
      // Reset the New Image block to default and reattach upload handler
      newImageBlock.innerHTML = newImageBlockTemplate
      newImageInput = newImageBlock.querySelector('input[name="newImage"]')
      newImageInput.addEventListener('change', addNewImage)
    }
    reader.readAsDataURL(input.files[0])
  }
}

function deleteImage(e) {
  const key = e.target.parentElement.dataset.key
  const imageBlock = imagesContainer.querySelector(`[data-key="${key}"]`)
  if (imageBlock) 
    imagesContainer.removeChild(imageBlock)
}

// Store the starting index of the dragged image
function imageDragStart(e) {
  // If a child element (e.g. <img>) is dragged, check the parent div for key
  const startIndex = 
    e.target.dataset.key ? 
      e.target.dataset.key : 
      e.target.parentNode.dataset.key
  e.dataTransfer.setData("startIndex", startIndex)
}

// Moves the dragged <div> to the left of the one it's dropped on
function imageDrop(e) {
  e.preventDefault()
  e.target.classList.remove('dragover')
  const startIndex = e.dataTransfer.getData("startIndex")  
  // If dropped onto a child element, check the parent div for key
  const endIndex = 
    e.target.dataset.key ? 
      e.target.dataset.key : 
      e.target.parentNode.dataset.key
  // Abandon ship if there's an error getting the indexes
  if (!startIndex || !endIndex) return
  // Move the element
  const startBlock = imagesContainer.querySelector(`[data-key="${startIndex}"]`)
  const endBlock = imagesContainer.querySelector(`[data-key="${endIndex}"]`)
  imagesContainer.insertBefore(startBlock, endBlock)
  updateImageKeys()
}

// Loop through image previews and assign a key based on position
function updateImageKeys() {
  const previews = imagesContainer.querySelectorAll('.edit-product__images--entry')
  previews.forEach((image, i) => 
    image.dataset.key = i
  )
}


// ------ Meta Shortcuts ----- //

function copyFromTitle() {
  if (inputs.title.value)
    inputs.metaTitle.value = inputs.title.value
}

function copyFromDescription() {
  if (inputs.shortDescription.value)
    inputs.metaDescription.value = inputs.shortDescription.value  
}


// -------- Features -------- //

let features = [""]
getFeaturesFromDOM()

// Read DOM inputs and build array to hold the state
function getFeaturesFromDOM() {
  features = []
  featureInputs.forEach(input => {
    features.push(input.value)
  })
}

// Update the state without re-rendering
function updateFeature(e) {
  const key = e.target.parentElement.dataset.key
  features[key] = e.target.value
}


function addFeature() {
  // Return if last feature is empty
  if (features[features.length - 1] === "")
    return  
  features.push('')
  renderFeatures()
}

function deleteFeature(e) {
  const key = e.target.parentElement.dataset.key
  // If there's only 1 feature, clear it
  if (features.length === 1) {
    features = [""]
  // Otherwise, delete the feature
  } else {
    features.splice(key, 1)
  }
  renderFeatures()
}

// Template for each input
const featureTemplate = (feature, key) => `
  <div data-key="${key}">
    <input type="text" value="${feature}" onchange="updateFeature(event)"/>
    <div class="multiple-input__delete" onclick="deleteFeature(event)">×</div> 
  </div>
`

// Takes the features object and renders template for each entry
function renderFeatures() {
  // Filter empty entries
  features = features.filter((entry, i) => 
    // Allow last entry to be empty
    !(i !== features.length - 1 && entry === "")
  )
  // Generate new HTML
  let html = ''
  features.forEach((feature, i) => 
    html += featureTemplate(features[i], i)
  )
  html += '<div class="multiple-input__add" onclick="addFeature()">Add Feature</div>'
  featuresContainer.innerHTML = html
}

renderFeatures()


// ------ Specifications ------ //

// Use an array rather than object for more readable mutations & reordering
let specifications = [["key", "value"]]
getSpecificationsFromDOM()

// Read DOM inputs and build array to hold the state
function getSpecificationsFromDOM() {
  specifications = []
  specInputs.forEach(input => {
    const key = input.querySelector('[data-type="key"]').value
    const value = input.querySelector('[data-type="value"]').value
    specifications.push([key, value])
  })
}

// Update the state without re-rendering
function updateSpecification(e) {
  const parent = e.target.parentElement
  const index = parent.dataset.key
  const key = parent.querySelector('[data-type="key"]').value
  const value = parent.querySelector('[data-type="value"]').value
  specifications[index] = [key, value]
}

function addSpecification() {
  // Return if last specification is empty
  const lastSpec = specifications[specifications.length - 1]
  if (lastSpec[0] === "" && lastSpec[1] === "")
    return  
  specifications.push(["",""])
  renderSpecifications()
}

function deleteSpecification(e) {
  const key = e.target.parentElement.dataset.key
  // If there's only 1 specification, clear it
  if (specifications.length === 1) {
    specifications = [["", ""]]
  // Otherwise, delete the specification
  } else {
    specifications.splice(key, 1)
  }
  renderSpecifications()
}

// Template for each input
const specificationTemplate = (spec, key) => `
  <div data-key="${key}">
    <input type="text" value="${spec[0]}" data-type="key" onchange="updateSpecification(event)"/>
    <input type="text" value="${spec[1]}" data-type="value" onchange="updateSpecification(event)"/>
    <div class="multiple-input__delete" onclick="deleteSpecification(event)">×</div> 
  </div>`

// Takes the features object and renders template for each entry
function renderSpecifications() {
  // Filter empty entries
  specifications = specifications.filter((entry, i) => 
    // Allow last entry to be empty
    !(i !== specifications.length - 1 
      && entry[0] === ''
      && entry[1] === '')
  )
  // Generate new HTML
  let html = ''
  specifications.forEach((spec, i) => {
    html += specificationTemplate(spec, i)
  })
  html += '<div class="multiple-input__add" onclick="addSpecification()">Add Feature</div>'
  specsContainer.innerHTML = html
}

renderSpecifications()


// ----- Form Submission ----- //

function submitForm(e) {
  e.preventDefault()
  errors.clear()
  const data = new FormData()
  let fileUpload = false
  // Append all basic text inputs
  for (let input in inputs) 
    if (inputs[input])
      data.append(input, inputs[input].value)  
  // Remove empty space from specs & features
  const filteredSpecs = specifications.filter(entry => 
    !(entry[0] === "" && entry[1] === ""))
  const filteredFeatures = features.filter(entry => 
    !(entry === ""))
  // Append specs & features
  data.append("specifications", JSON.stringify(filteredSpecs))
  data.append("features", JSON.stringify(filteredFeatures))
  // Append PDF
  if (manualPDF.files && manualPDF.files[0]) {
    data.append("manualPDF", manualPDF.files[0], "manual.pdf")
    fileUpload = true
  }
  // Append image inputs
  const imageBlocks = imagesContainer.querySelectorAll('.edit-product__images--entry')
  imageBlocks.forEach((block, key) => {
    const input = block.querySelector('input')
    const id = block.dataset.id
    // Use file data if present, otherwise it's existing image ID
    if (input && input.files && input.files[0]) {
      data.append(`image-${key}`, input.files[0])      
      fileUpload = true
    } else if (id) {
      data.append(`image-${key}`, id)
    }
  })
  // Show upload progress bar if required
  if (fileUpload) {
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
    window.location = "/dashboard/products"
  ).catch(err => {
    const message = err.response.data || {
      title: "Error uploading product",
      text: "Please try again. If the problem persists, please contact AMP."
    }
    errors.flash(message.title, message.text)
  })
}


// -----  Delete Product ----- //

function toggleDeleteConfirmation() {
  deleteConfirmation.classList.toggle("active")
}


// ----- Helper Functions ---- //

// Generic drag & drop handlers
function dragOver(e) {
  e.preventDefault()
}

function dragEnter(e) {
  e.preventDefault()
  e.target.classList.add('dragover')
}

function dragLeave(e) {
  e.preventDefault()
  e.target.classList.remove('dragover')
}

// Takes in a string of HTML and returns DOM element
function renderTemplate(html) {
  const div = document.createElement('div')
  div.innerHTML = html.trim()
  return div.firstChild
}