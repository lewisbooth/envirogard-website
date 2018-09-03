const form = document.forms['contact']
const inputs = form.querySelectorAll('input, textarea')
const errorContainer = document.querySelector('.contact-forms__enquiry--errors')

form.addEventListener('submit', e => {
  e.preventDefault()
  const data = {}
  inputs.forEach(input => {
    data[input.name] = input.value
  })
  axios.post("/contact", data)
    .then(res => {
      window.location = "/contact/success"
    })
    .catch(err => {
      renderErrors(err.response.data)
    })
})

function renderErrors(errors) {
  errorContainer.innerHTML = 
    `<span>Error submitting your form, please try again:</span>`
  errorContainer.innerHTML += 
    errors.map(error => `<p>${error}</p>`).join('')
}