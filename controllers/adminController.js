const mongoose = require("mongoose")

exports.products = async (req, res) => {
  res.render('admin/productList', {
    title: "All Products"
  })
}

exports.newProduct = async (req, res) => {
  res.render('admin/product', {
    title: "New Product"
  })
}