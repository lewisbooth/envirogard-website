// Automatically generates cache-busting links using MD5 hashes
// Hashes all CSS & JS files in the /public folder and returns usable links
// e.g. main.css?v=7815696ecbf1c96e6894b779456d330e

const fs = require("fs")
const path = require("path")
const { hashFile } = require("./hashFile")

const { PUBLIC_FOLDER } = process.env
const STATIC_FOLDERS = ["css", "js"]
const FILE_TYPES = /\.css|\.js/

const hashes = {}

let debounce = false

function generateHashes() {
  if (debounce) return
  debounce = true
  let filesToHash = []
  STATIC_FOLDERS.forEach(folder => {
    // Absolute path to folder
    const folderPath = path.join(PUBLIC_FOLDER, folder)
    // Build array of files in folder
    fs.readdirSync(folderPath)
      .filter(file => file.match(FILE_TYPES))
      .forEach(file => filesToHash.push([folder, file]))
    // Watch for changes and regenerate cache
    fs.watch(folderPath, generateHashes)
  })
  filesToHash.forEach(file => {
    const [directory, filename] = file
    const md5 = hashFile(path.join(PUBLIC_FOLDER, directory, filename))
    // Create a full URL with hash that will work in-browser
    const url = `/${directory}/${filename}?v=${md5}`
    hashes[filename] = url
  })
  setTimeout(() => debounce = false, 200)
}

// Run once on server start, then watch folder for changes
generateHashes()

// Expose the hashes for use in view templates
exports.cacheBuster = (req, res, next) => {
  res.locals.hashes = hashes
  next()
}