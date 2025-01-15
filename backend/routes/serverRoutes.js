import express from 'express';
import {getHomePage} from '../controllers/serverControlller.js';

const router = express.Router();


    
import { protect } from '../middleware/authMiddleware.js';




router.get('/get-crud', getHomePage);




export default router;

