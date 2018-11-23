const liveChatStartButtons = document.querySelectorAll('.live-chat__start-button')
for (i = 0; i < liveChatStartButtons.length; i++) {
  liveChatStartButtons[i].addEventListener('click', () =>
    Tawk_API.maximize()
  )
}