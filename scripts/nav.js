const body = document.querySelector('body')
const nav = document.querySelector('nav')
const adminBar = document.querySelector('.admin__bar')
const mobileDropdownButtons = document.querySelectorAll('.nav__secondary--dropdown')

const navHeight = () => adminBar ? 
    nav.offsetHeight + adminBar.offsetHeight : nav.offsetHeight

document.addEventListener('scroll', e => {
    body.className = e.pageY > navHeight() ? "nav-scroll" : ""
})

mobileDropdownButtons.forEach(button => {
    button.addEventListener('click', _ => {
        const buttonWasActive = button.classList.contains('active')
        mobileDropdownButtons.forEach(button => {
            button.classList.remove('active')
        })        
        if (!buttonWasActive) {
            button.classList.add('active')
        }
    })
})