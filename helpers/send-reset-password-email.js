const nodemailer = require('nodemailer');

sendResetPasswordEmail = function(email, rString) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
      }
  });
  // setup email data with unicode symbols
  let mailOptions = {
      from: `"Angular Spread" <${process.env.EMAIL}>`, // sender address
      to: email, // list of receivers
      subject: 'Reset Password', // Subject line
      text: 'Hello world', // plain text body
      html: `Click on link to reset your password <a href='${process.env.WEBSITE_URL}/passwords/${rString}'>${process.env.WEBSITE_URL}/passwords/${rString}</a>` // html body
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
          return console.log(err);
      }
      console.log('Message %s sent: %s', info, info.messageId, info.response);
  });
}

module.exports = sendResetPasswordEmail;