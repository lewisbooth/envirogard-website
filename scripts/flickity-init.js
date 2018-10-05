// Initialises the homepage carousel
function flickityInit() {
  var flkty = new Flickity( '.home__slider--carousel', {
    wrapAround: true,
    autoPlay: 5000,
    dragThreshhold: 10,
    selectedAttraction: 0.008,
    friction: 0.18
  })
}