const areaButtons = document.querySelectorAll('[data-area]')
const navBranchName = document.querySelector('.nav__menu--branch--name')
const useLocationButtons = document.querySelectorAll('.branch-finder__info--title--use-location')

// Import data file via Gulp (not valid JS)
// The same file is imported into the backend and uses exports object, 
// so we create an exports object here to suppress errors
let exports = {}
@import '../helpers/depotData.js'

// Initialise location on page load
initLocation()

// Update the location preference when user clicks on
// an element with the [data-area] attribute
areaButtons.forEach(e =>
  e.addEventListener('click', () => {
    updateLocation(e.dataset.area)
  })
)

// Reset the location to IP lookup when 'Use Location'
// buttons are pressed
useLocationButtons.forEach(e =>
  e.addEventListener('click', () => {
    initLocation(true)
  })
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
      .then(res => {
        updateLocation(res)
      })
  }
}

// Change the cookie preference and change necessary page elements
function updateLocation(newLocation) {
  if (newLocation) {
    Cookies.set('locationDepot', newLocation, { expires: 365 })
  }
  const localDepot = newLocation || Cookies.get('locationDepot')
  // Render branch finder
  areaButtons.forEach(area =>
    area.dataset.area === localDepot ?
      area.classList.add('active') :
      area.classList.remove('active')
  )
  // Change name of location in navbar
  navBranchName.innerText = depotData[localDepot].name
}