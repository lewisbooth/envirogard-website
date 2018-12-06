const pug = require('pug')
const mail = require("./sendMail")

// Emails a simple template which contains the formatted messageData object

exports.newsletterForm = ({
  toAddress = [process.env.CONTACT_FORM_EMAIL],
  fromAddress = process.env.CONTACT_FORM_EMAIL,
  templateFile = process.env.ROOT + "/views/emails/newsletterForm.pug",
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
      subject: `Envirogard Newsletter Request | ${messageData.firstName} ${messageData.lastName}`,
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