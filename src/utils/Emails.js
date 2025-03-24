import nodemailer from "nodemailer";
import {ApiError} from "../utils/ApiError.js";
const transporter = nodemailer.createTransport({    
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    secure: false
});


const sendEmail =async (mailDetails) => {

    const mailOptions = {
        from: {
            name: "Team5 Ishanya",
            address: process.env.EMAIL_USER
        },
        to: mailDetails.toAddresses, // Array of email addresses
        subject: mailDetails.subject,
        text: mailDetails.text,
        html: mailDetails.html,
        attachments: mailDetails.attachments
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new ApiError("Error sending email", 500);
    }
    return null;
}

export {sendEmail};