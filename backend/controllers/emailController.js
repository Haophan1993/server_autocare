import { sendEmail } from '../services/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.CONFIRM_URL;

export const sendTestEmail = async (req, res) => {
  try {
    //console.log('Data From Client ', req.body)
    const { to, subject, message, bookingDa, bookingResult } = req.body;

    let time=bookingDa.time;
    let date=bookingDa.date;
    let doctorID=bookingDa.doctorId;

    //console.log(bookingResult.confirmToken);
    
    const htmlContent = `<h1>Welcome!</h1><p> ${message} This is the confirm emal from 
    Booking Care. Your appointment is on ${date} at ${time} with doctor ${doctorID}</p>
    <br></br> Please click the link belove to confrim ... <br></br>
    <a href="${port}${bookingResult.confirmToken}&doctorID=${doctorID}" >Click Here</a>`
    ;

    await sendEmail(to, subject, message, htmlContent);

    res.status(200).json({ success: true, message: "Email sent successfully! ✅" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
