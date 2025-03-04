import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();




const transporter = nodemailer.createTransport({
    service: "gmail", // Use "gmail" or SMTP provider (e.g., SendGrid, Mailgun)
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your app password (not your regular password)
    },
});

const sendEmail = async (to, subject, text, html) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html, // Can send HTML emails
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
};










export { sendEmail };