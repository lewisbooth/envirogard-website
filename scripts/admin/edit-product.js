// -------- Triggers --------- //

let newImageInput = document.querySelector('input[name="newImage"]')
newImageInput.addEventListener('change', addNewImage)




// --------- Images ---------- //

const imagesContainer = document.querySelector('.edit-product__images')
const newImageBlock = imagesContainer.querySelector('.edit-product__images--new')
const newImageBlockTemplate = newImageBlock.innerHTML
const newImageInputTemplate = newImageInput.cloneNode()
const newImageText = document.querySelector('.edit-product__images--new--text')

// When a new image file is selected, create a client-side preview block
// File input containing image data is moved inside the preview block
function addNewImage(e) {
  const input = e.target
  if (input.files && input.files[0]) {    
    var reader = new FileReader()    
    reader.onload = e => {     
      // Calculate index (key) to uniquely identify the file 
      const index = imagesContainer.querySelectorAll('.edit-product__images--entry').length
      // Create new preview block from template
      const imagePreview = elementFromHTML(`
        <div class="edit-product__images--entry" data-key="${index}">
          <img src="#"/>
          <div class="edit-product__images--entry--delete">×<div> 
        </div>
      `)
      // Attach file input data to preview image src
      imagePreview.querySelector('img').setAttribute('src', e.target.result)
      // Set unique field name on file input
      newImageInput.setAttribute('name', `image-${index}`)
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


// ----- Helper Functions ----- //

// Takes in a string of HTML and returns DOM elements
function elementFromHTML(html) {
  const div = document.createElement('div')
  div.innerHTML = html.trim()
  return div.firstChild
}