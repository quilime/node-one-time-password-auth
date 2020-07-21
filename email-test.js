"use strict";
// config variables in .env
require('dotenv').config();
const { createTransport } = require("nodemailer");

async function main() {
  
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const loginKey = '123456789';

  let sendResult = await transporter.sendMail({
    from: process.env.FROM_EMAIL, 
    to: "test@email.com",
    subject: "Your Login Key 🔑",
    // plain text email body
    text: "Your one-time login key\n\n" + loginKey, 
    // html email body
    html: "Your one-time login key<br /><br /><strong style='font-size:2em;'>" + loginKey + "</strong>", 
  });

  console.log("Message sent", sendResult);
}

main()
  .catch(console.error);
