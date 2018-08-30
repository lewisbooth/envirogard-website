const fetch = require('node-fetch')
const { depotData } = require('../helpers/depotData')

// Uses the client's IP to find their closest depot
exports.getClosestDepot = async (req, res) => {
  // Use test IP if request comes from localhost
  const clientIP = req.ip.startsWith(":") ? "86.9.243.232" : req.ip
  // In case there's an error, use the HQ location as the default
  const defaultLocation = "south-east"
  // Use IPStack.com to fetch the lat/long of the client IP
  fetch(`http://api.ipstack.com/${clientIP}?access_key=${process.env.IPSTACK_KEY}&fields=longitude,latitude`)
    .then(res => res.json())
    .then(client => {
      let closestDistance = 99999
      let closestDepot = defaultLocation
      // Calculate distance of each depot from the client
      Object.keys(depotData).forEach(depot => {
        const dif = PythagorasEquirectangular(
          client.latitude, 
          client.longitude, 
          depotData[depot].location.latitude, 
          depotData[depot].location.longitude
        )
        if (dif < closestDistance) {
          closestDistance = dif
          closestDepot = depot
        }
      })
      res.json(closestDepot)
    })
    .catch(err => {
      console.log(err)
      res.json(defaultLocation)
    })
}
  
function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
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

// Convert Degress to Radians
function Deg2Rad(deg) {
  return deg * Math.PI / 180
}