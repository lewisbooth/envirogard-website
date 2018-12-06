// Checks if Settings are available and creates defaults if not
const mongoose = require("mongoose")
const Settings = mongoose.model("Settings")
const Subcategory = mongoose.model("Subcategory")

exports.checkSettings = async () => {
    // Check if settings already exist
    const hasSettings = await Settings.countDocuments({})
    if (hasSettings) return

    // Generate default popular products
    const subcategories = await Subcategory
        .find({})
        .sort({ updatedAt: -1 })
        .limit(5)

    // Extract Subcategory ids
    const popularProducts = subcategories.map(subcategory => subcategory.id)

    await new Settings({ popularProducts }).save()

    console.log('Created default Settings')
}