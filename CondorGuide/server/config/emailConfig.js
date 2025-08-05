import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(to, subject, htmlContent) {

  const mailOptions = {
    from: `<${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}

export default sendEmail;