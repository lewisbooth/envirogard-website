const aws = require("aws-sdk")

exports.send = (mailData, callback) => {
  let errors = []
  if (!mailData.to) errors.push("Please supply a To: address")
  if (!mailData.from) errors.push("Please supply a From: address")
  if (!mailData.subject) errors.push("Please supply a subject line")
  if (!mailData.html) errors.push("Please supply message data")
  if (!callback) errors.push("Please supply a callback function")
  if (errors.length > 0) {
    errors.forEach(error => {
      console.log(error)
    })
    callback(true)
  }

  // Verified SES email accounts only
  var ses = new aws.SES()
  ses.sendEmail(
    {
      Source: mailData.from,
      Destination: { ToAddresses: mailData.to },
      Message: {
        Subject: {
          Data: mailData.subject
        },
        Body: {
          Html: {
            Data: mailData.html
          }
        }
      }
    },
    (err, data) => callback(err, data)
  )
}
