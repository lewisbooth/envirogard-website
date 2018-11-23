let areaButtons = document.querySelectorAll('[data-area]')
const navBranchName = document.querySelector('.nav__menu--branch--name')
const useLocationButtons = document.querySelectorAll('.branch-finder__info--title--use-location')
const areaSelectDropdown = document.querySelector('select[name="branch"]')
const navPhoneLink = document.querySelector('.nav__menu--contact--phone')
const navEmailLink = document.querySelector('.nav__menu--contact--email')
const mapSvgContainer = document.querySelector('.branch-finder__map')
const mapSvgData = document.querySelector('.branch-finder__map object')

// Import data file via Gulp (NOT VALID JS)
// @import line is replaced with the file contents when transpiled
// Creating an exports object suppresses transpile errors
let exports = {}
@import '../helpers/depotData.js'

initLocation()

// Update the location preference when user clicks on
// an element with the [data-area] attribute
for (let i = 0; i < areaButtons.length; i++) {
  updateLocationOnClick(areaButtons[i])
}

// For the map to be interactive, it must be a proper <svg> DOM node.
// Linking to an external SVG doesn't allow adding event listeners etc.
// To do this, we load the file into an <object> element and extract the XML.
// This function is fired by the <object> 'onload' attribute in the template.
function mapLoaded() {
  // Extract parsed DOM node from <object>
  const data = mapSvgData.contentDocument.documentElement
  // Replace <object> with parsed element
  mapSvgContainer.innerHTML = ''
  mapSvgContainer.appendChild(data)
  areaButtons = document.querySelectorAll('[data-area]')
  // Re-attach the event listeners because SVG was not present on page load
  for (let i = 0; i < areaButtons.length; i++) {
    updateLocationOnClick(areaButtons[i])
  }
  // Re-render map to select active location
  initLocation()
}

// Change preference via drop-down in the nav
if (areaSelectDropdown) {
  areaSelectDropdown.addEventListener('change', e =>
    updateLocation(e.target.value)
  )
}

// Reset the location to IP lookup when
// 'Use Location' buttons are pressed
for (let i = 0; i < useLocationButtons.length; i++) {
  useLocationButtons[i].addEventListener('click', () =>
    initLocation(true)
  )
}

// Initialise the location preference from cookie or IP
function initLocation(forceLookup = false) {
  // Try to fetch the location from cookies
  const localDepot = Cookies.get('locationDepot')
  // Use the cookie if it's already set
  if (localDepot !== 'null' && !forceLookup) {
    updateLocation(localDepot)
  } else {
    // Otherwise, get location from IP address
    // Returns "south-east" etc
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        // Remove quotes from string
        const newLocation = xhr.responseText.replace(/"/g, '')
        updateLocation(newLocation)
      }
    }
    xhr.open("GET", "/api/get-closest-depot")
    xhr.send()
  }
}

// Change the cookie preference and change necessary page elements
function updateLocation(newLocation = Cookies.get('locationDepot') || 'south-east') {
  Cookies.set('locationDepot', newLocation, { expires: 365 })
  // Render branch finder
  for (i = 0; i < areaButtons.length; i++) {
    const area = areaButtons[i]
    // IE11 does not support classList on SVG elements, because Microsoft.
    if (area.classList)
      area.getAttribute('data-area') === newLocation ?
        area.classList.add('active') :
        area.classList.remove('active')
  }
  // Update the navigation links with new data
  if (navPhoneLink && navEmailLink && navBranchName) {
    navPhoneLink.setAttribute('href', 'tel:' + depotData[newLocation].telephone)
    navEmailLink.setAttribute('href', 'mailto:' + depotData[newLocation].email)
    navBranchName.innerText = depotData[newLocation].name
  }
  // Update <select> element
  if (areaSelectDropdown) {
    areaSelectDropdown.value = newLocation
  }
}

function updateLocationOnClick(e) {
  e.addEventListener('click', () =>
    updateLocation(e.getAttribute('data-area'))
  )
}