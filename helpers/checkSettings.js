// Checks if Settings are available and creates defaults if not
const mongoose = require("mongoose")
const Settings = mongoose.model("Settings")
const Subcategory = mongoose.model("Subcategory")

// Check if settings already exist
const hasSettings = Settings.countDocuments({})

if (!hasSettings) {
  // Generate default popular products
  const subcategories = Subcategory
      .find({})
      .sort({ updatedAt: -1 })
      .limit(5)

  // Extract Subcategory ids
  const popularProducts = subcategories.map(subcategory => subcategory.id) || []

  Settings({ popularProducts }).save()

  console.log('Created default Settings')
}