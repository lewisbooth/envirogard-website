const mongoose = require('mongoose')

if (!process.env.DATABASE) {
  console.error('ERROR: No database specified'.bgRed)
  process.exit()
}

mongoose.connect(process.env.DATABASE, {}).then(() => {
  process.env.CONNECTED = 'true'
  console.log('✔ Connected to MongoDB'.green)
}, err => {
  process.env.CONNECTED = 'false'
  console.error(err.message)
  console.error('Error connecting to database'.bgRed)
})