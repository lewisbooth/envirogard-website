const body = document.querySelector('body')
const navHeight = document.querySelector('.nav').offsetHeight

document.addEventListener('scroll', e => {
    body.className = e.pageY > navHeight ? "nav-scroll" : ""
})