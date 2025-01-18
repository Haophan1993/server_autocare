import express from 'express';
const router = express.Router();

import { authUser, 
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile, getHomePage } from '../controllers/userController.js';
    
import { protect } from '../middleware/authMiddleware.js';


router.post('/', registerUser);

router.post('/auth', authUser);

router.post('/logout', logoutUser);

router.get('/home', protect, getHomePage);

router.get('/profile',protect, getUserProfile);

router.put('/profile',protect, updateUserProfile);


export default router;

