const form = document.forms['faq']
const editorElement = document.getElementById('pell')
const editorContent = document.getElementById('pell-data').value

// ------- Text Editor -------- //

const editor = pell.init({
  element: editorElement,
  actions: [
    'bold',
    'italic',
    'heading2',
    'paragraph',
    'link',
    'olist',
    'ulist'
  ],
  onChange: html => { }
})

// Copy the decoded HTML from hidden textarea to Pell editor
editor.content.innerHTML = editorContent

editor.addEventListener("paste", function (event) {
  // cancel paste
  event.preventDefault()

  // get text representation of clipboard
  var text = (event.originalEvent || event).clipboardData.getData('text/plain')

  // insert text manually
  document.execCommand("insertHTML", false, text)
})

// ----- Form Submission ----- //

function submitForm(e) {
  e.preventDefault()
  errors.clear()
  // Send form data
  axios.post(
    window.location.pathname,
    { 'pageContent': editor.content.innerHTML }
  ).then(() =>
    window.location = "/dashboard/faq"
  ).catch(err => {
    console.log('test')
    const message = err.response.data || {
      title: "Error saving page data",
      text: "Please try again. If the problem persists, please contact AMP."
    }
    errors.flash(message.title, message.text)
  })
}
