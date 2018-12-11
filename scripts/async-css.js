const asyncScripts = document.querySelector('noscript[name="async-css"]').childNodes
const head = document.querySelector('head')

window.addEventListener('load', () => {
  for (let i = 0; i < asyncScripts.length; i++) {
    head.innerHTML += asyncScripts[i].textContent.trim()
  }
})