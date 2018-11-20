let areaButtons = document.querySelectorAll('[data-area]')
const navBranchName = document.querySelector('.nav__menu--branch--name')
const useLocationButtons = document.querySelectorAll('.branch-finder__info--title--use-location')
const areaSelectDropdown = document.querySelector('select[name="branch"]')
const navPhoneLink = document.querySelector('.nav__menu--contact--phone')
const navEmailLink = document.querySelector('.nav__menu--contact--email')
const mapSvgContainer = document.querySelector('.branch-finder__map')
const mapSvgData = mapSvgContainer.querySelector('object')

// Import data file via Gulp (NOT VALID JS)
// @import line is replaced with the file contents when transpiled
// Creating an exports object suppresses transpile errors
let exports = {}
@import '../helpers/depotData.js'

// Initialise location on page load
initLocation()

// Update the location preference when user clicks on
// an element with the [data-area] attribute
areaButtons.forEach(e =>
  e.addEventListener('click', () =>
    updateLocation(e.dataset.area)
  )
)

// For the map to be interactive, it must be a parsed <svg> DOM element.
// To do this, we load the file into an <object> element and parse the XML.
mapSvgData.addEventListener("load", () => {
  // Extract parsed DOM node from <object>
  const data = mapSvgData.contentDocument.documentElement
  // Replace <object> with parsed element
  mapSvgContainer.innerHTML = ''
  mapSvgContainer.appendChild(data)
  areaButtons = document.querySelectorAll('[data-area]')
  // Re-attach the event listeners because SVG was not present on page load
  areaButtons.forEach(e =>
    e.addEventListener('click', () =>
      updateLocation(e.dataset.area)
    )
  )
})

// Change preference via drop-down in the nav
if (areaSelectDropdown) {
  areaSelectDropdown.addEventListener('change', e =>
    updateLocation(e.target.value)
  )
}

// Reset the location to IP lookup when
// 'Use Location' buttons are pressed
useLocationButtons.forEach(e =>
  e.addEventListener('click', () =>
    initLocation(true)
  )
)

// Initialise the location preference from cookie or IP
function initLocation(forceLookup = false) {
  // Try to fetch the location from cookies
  const localDepot = Cookies.get('locationDepot')
  // Use the cookie if it's already set
  if (localDepot && !forceLookup) {
    updateLocation(localDepot)
  } else {
    // Otherwise, get location from IP address
    // Returns "south-east" etc
    fetch("/api/get-closest-depot")
      .then(res => res.json())
      .then(res =>
        updateLocation(res)
      )
  }
}

// Change the cookie preference and change necessary page elements
function updateLocation(newLocation = Cookies.get('locationDepot')) {
  Cookies.set('locationDepot', newLocation, { expires: 365 })
  // Render branch finder
  areaButtons.forEach(area =>
    area.dataset.area === newLocation ?
      area.classList.add('active') :
      area.classList.remove('active')
  )
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