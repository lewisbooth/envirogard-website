const body = document.querySelector('body')
const nav = document.querySelector('nav')
const adminBar = document.querySelector('.admin__bar')
const mobileDropdownButtons = document.querySelectorAll('.nav__secondary--dropdown')

// Recalculates every time in case window has resized
const navHeight = () =>
    adminBar ?
        nav.offsetHeight + adminBar.offsetHeight :
        nav.offsetHeight

// Add .nav-scroll class when scrolling to stick nav to the top of the viewport
document.addEventListener('scroll', e =>
    e.pageY > navHeight() ?
        body.classList.add("nav-scroll") :
        body.classList.remove("nav-scroll")
)
for (let i = 0; i < mobileDropdownButtons.length; i++) {
    const button = mobileDropdownButtons[i]
    button.addEventListener('click', () => {
        const buttonWasActive = button.classList.contains('active')
        for (let j = 0; j < mobileDropdownButtons.length; j++) {
            mobileDropdownButtons[j].classList.remove('active')
        }
        if (!buttonWasActive) {
            button.classList.add('active')
        }
    })
}