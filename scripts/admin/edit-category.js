const form = document.forms['category']
const imageInput = form.querySelector('[name="coverImage"]')
const imagePreviewContainer = form.querySelector('.image-preview')
const imagePreview = imagePreviewContainer.querySelector('.image-preview img')
const copyFromTitleLink = form.querySelector('#copy-from-title')
const copyFromDescriptionLink = form.querySelector('#copy-from-description')
const uploadProgress = document.querySelector('.admin__upload-progress')
const uploadProgressBar = uploadProgress.querySelector('progress')
const deleteConfirmation = document.querySelector('#delete-item__lightbox')

const inputs = {
  title: form.querySelector('input[name="title"]'),
  shortDescription: form.querySelector('textarea[name="shortDescription"]'),
  longDescription: form.querySelector('textarea[name="longDescription"]'),
  metaTitle: form.querySelector('input[name="metaTitle"]'),
  metaDescription: form.querySelector('textarea[name="metaDescription"]'),
}

const deleteImage = form.querySelector('input[name="deleteImage"]')

// -------- Triggers --------- //

imageInput.addEventListener('change', previewImage)
copyFromTitleLink.addEventListener('click', copyFromTitle)
copyFromDescriptionLink.addEventListener('click', copyFromDescription)


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

function copyFromDescription() {
  if (inputs.shortDescription.value)
    inputs.metaDescription.value = inputs.shortDescription.value
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
    window.location = "/dashboard/categories"
  ).catch(err => {
    const message = err.response.data || {
      title: "Error uploading category",
      text: "Please try again. If the problem persists, please contact AMP."
    }
    errors.flash(message.title, message.text)
  })
}


// -----  Delete Category ----- //

function toggleDeleteConfirmation() {
  deleteConfirmation.classList.toggle("active")
}