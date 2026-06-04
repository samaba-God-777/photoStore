const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'PhotoStudio'} <${process.env.FROM_EMAIL || 'noreply@photostudio.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    await transporter.sendMail(message);
  } else {
    console.log('⚠️  Email no enviado (SMTP no configurado). Contenido:', { to: options.email, subject: options.subject, message: options.message });
  }
};

module.exports = sendEmail;
