import nodemailer from "nodemailer"



const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Not written yet in .env
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER, // Not written yet in .env
    pass: process.env.SMTP_PASS, // Not written yet in .env
  },
});


export const sendMail = async ({to, subject, body}) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // sender address
      to, // list of recipients
      subject, // subject line
      html: body
    });

    return info;
  } catch (err) {
    console.error("Error while sending mail", err);
    throw err;
  }
}