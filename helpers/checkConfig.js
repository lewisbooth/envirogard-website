// Throw errors and exit if config files are not detected

const fs = require("fs")
const path = require("path")

const REQUIRED_FILES = {
    "AWS Config": "variables.aws.json",
    "ENV Variables": "variables.env"
}

exports.checkConfig = () => {
    let errors = []
    // Loop through REQUIRED_FILES and check if files exist
    Object.keys(REQUIRED_FILES).forEach(file => {
        const filePath = path.join(process.env.ROOT, REQUIRED_FILES[file])
        if (!fs.existsSync(filePath)) {
            errors.push(file)
        }
    })

    if (errors.length) {
        errors.forEach(file => {
            console.log(`${file} does not exist at ${REQUIRED_FILES[file]}`)
        })
        process.exit()
    }
}