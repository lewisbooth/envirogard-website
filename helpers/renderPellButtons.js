exports.renderPellButtons = html => {
  return html.replace(/\[button .{0,}?\]/g, renderButton)
}

const renderButton = shortcode => {
  console.log(shortcode)
  const href = shortcode.match(/href="([\w\W\/]+?)"/)[1]
  const text = shortcode.match(/title="([\w\W\/]+?)"/)[1]
  return `
    <a class="button button__arrow" href="${href}" target="_blank">
      ${text}
    </a>
  `
}