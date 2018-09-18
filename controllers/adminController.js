const mongoose = require("mongoose")

exports.dashboard = async (req, res) => {
  res.render('dashboard')
}