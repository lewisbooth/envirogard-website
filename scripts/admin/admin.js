class AdminErrors {
  constructor() {
    this.messages = []
    this.container = document.querySelector(".admin__errors")
  }
  flash(title = "Error", text = "An error occured. Please try again.") {
    this.messages.push({ title, text })
    this.render()
  }
  clear() {
    this.messages = []
    this.render()
  }
  render() {
    if (!this.container) {
      return console.error("No error container found. Please create a <div> with class '.admin__errors'.")
    }
    if (this.messages.length > 0) {
      this.container.classList.add('active')
    } else {
      this.container.classList.remove('active')
    }
    this.container.innerHTML = this.messages
      .map(message => `
        <div class="admin__errors--message">
          <h5>${message.title}</h5>
          <p>${message.text}</p>
        </div>
      `).join(",")
  }
}

const errors = new AdminErrors()