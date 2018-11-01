const fetch = require('node-fetch')
const mongoose = require("mongoose")
const Product = mongoose.model("Product")
const { depotData } = require('../helpers/depotData')
const { parseSortParams } = require("../helpers/parseSortParams")
const { parseFilterParams } = require("../helpers/parseFilterParams")

const DEFAULT_LOCATION = "south-east"

// Uses the client's IP to find their closest depot
exports.getClosestDepot = async (req, res) => {
  // Use test IP (midlands) if request comes from localhost
  const clientIP = req.ip.startsWith(":") ? "86.9.243.232" : req.ip
  const API_ROUTE = `http://api.ipstack.com/${clientIP}?access_key=${process.env.IPSTACK_KEY}&fields=longitude,latitude`
  // Use IPStack.com to fetch the lat/long of the client IP
  fetch(API_ROUTE)
    .then(res => res.json())
    .then(client => {
      let closestDistance = 99999
      let closestDepot = DEFAULT_LOCATION
      // Calculate distance of each depot from the client
      for (depot in depotData) {
        const distance = getDistance(
          client.latitude, 
          client.longitude, 
          depotData[depot].location.latitude, 
          depotData[depot].location.longitude
        )
        if (distance < closestDistance) {
          closestDistance = distance
          closestDepot = depot
        }
      }
      res.json(closestDepot)
    })
    .catch(err => {
      console.log(err)
      res.json(DEFAULT_LOCATION)
    })

    // Calculate distance between two lat/long points on a sphere
    function getDistance(lat1, lon1, lat2, lon2) {
      lat1 = Deg2Rad(lat1)
      lat2 = Deg2Rad(lat2)
      lon1 = Deg2Rad(lon1)
      lon2 = Deg2Rad(lon2)
      var R = 6371 // km
      var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2)
      var y = (lat2 - lat1)
      var d = Math.sqrt(x * x + y * y) * R
      return d
    }
    
    // Convert Degrees to Radians
    function Deg2Rad(deg) {
      return deg * Math.PI / 180
    }
}

// Takes search term from req.body and returns a list of matching products
exports.searchProducts = async (req, res) => {
  const sort = parseSortParams(req.body)
  const filter = parseFilterParams(req.body)
  const products = await Product
    .find(filter)
    .limit(10)
    .sort(sort)
  // Select only the useful fields
  // Using .select('<fields>') on the query doesn't work with async/await?
  const results = products.map(product => {
    return {
      id: product._id,
      title: product.title,
      image: product.mainImageThumbnailURL,
      editURL: product.editURL,
      pageURL: product.pageURL,
    }
  })
  res.json(results)
}