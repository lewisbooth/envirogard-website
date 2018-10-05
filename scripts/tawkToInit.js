const liveChatStartButtons = document.querySelectorAll('.live-chat__start-button')

liveChatStartButtons.forEach(button => 
  button.addEventListener('click', () => Tawk_API.maximize())
)