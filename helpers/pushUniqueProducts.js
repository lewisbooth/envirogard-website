exports.pushUniqueProducts = (collections, products) => {
  collections.forEach(collection => {
    if (collection.products) {
      collection.products.forEach(product => {
        // Check if product already exists in first Product query
        let exists = false
        products.forEach(existingProduct => {
          if (product._id.toString() === existingProduct._id.toString())
            exists = true
        })
        // If not, add it to the products array
        if (!exists)
          products.push(product)
      })
    }
  })
}