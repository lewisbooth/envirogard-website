const toggleBoxes = document.querySelectorAll('.product__block--mobile-toggle h3')

for (let i = 0; i < toggleBoxes.length; i++) {
  const toggle = toggleBoxes[i]
  toggle.addEventListener('click', e =>
    e.target.classList.toggle('active')
  )
}

// Initialises the product image carousel
function flickityInit() {
  var navCarousel = new Flickity('.product__carousel--nav', {
    wrapAround: false,
    asNavFor: '.product__carousel--current',
    pageDots: false,
    dragThreshhold: 10,
    selectedAttraction: 0.1,
    friction: 0.5
  })
  var currentCarousel = new Flickity('.product__carousel--current', {
    wrapAround: true,
    pageDots: false,
    dragThreshhold: 10,
    selectedAttraction: 0.1,
    friction: 0.5
  })
}