// This is all of the JS required for the Branch Finder widget

// Whenever any DOM element with a [data-area] attribute is clicked, 
// add an '.active' class to elements with a matching [data-area].

const areas = document.querySelectorAll('[data-area]')

areas.forEach(e =>
  e.addEventListener('click', () => {
    areas.forEach(f =>
      f.dataset.area === e.dataset.area ?
        f.classList.add('active') :
        f.classList.remove('active')
    )
  })
)