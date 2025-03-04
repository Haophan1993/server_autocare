import express from 'express';

import {postBookAppointment, postVerifyEmail} from '../controllers/patientController.js';
import { sendTestEmail } from '../controllers/emailController.js';

const router = express.Router();

router.post('/book-appointment', postBookAppointment);
router.post('/send-confirm-email', sendTestEmail);
router.post('/verify', postVerifyEmail);




export default router;