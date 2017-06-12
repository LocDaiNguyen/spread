const nodemailer = require('nodemailer');

sendVerifyEmail = function(email, rString) {
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
      subject: 'Verify Email', // Subject line
      text: 'Hello world', // plain text body
      html: `Click on link to verify email <a href='${process.env.WEBSITE_URL}/verifications/${rString}'>${process.env.WEBSITE_URL}/verifications/${rString}</a>` // html body
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
          return console.log(err);
      }
      console.log('Message %s sent: %s', info, info.messageId, info.response);
  });
}

module.exports = sendVerifyEmail;