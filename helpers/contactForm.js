const pug = require('pug')
const mail = require("./sendMail")

// Emails a simple template which contains the formatted messageData object

exports.contactForm = ({
  toAddress = [process.env.CONTACT_FORM_EMAIL],
  fromAddress = process.env.CONTACT_FORM_EMAIL,
  templateFile = process.env.ROOT + "/views/emails/contactForm.pug",
  messageData = {}
}) => {
  return new Promise((resolve, reject) => {
    const messageTemplate = pug.renderFile(
      templateFile,
      messageData
    )
    const mailData = {
      to: toAddress,
      from: fromAddress,
      subject: "Envirogard Website Enquiry | " + messageData.name,
      html: messageTemplate
    }
    const mailCallback = err => {
      if (err) {
        reject("🔥  Email Error: " + err)
      } else {
        console.log("📧  Email sent successfully")
        resolve()
      }
    }
    mail.send(mailData, mailCallback)
  })
}