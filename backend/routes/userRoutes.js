import express from 'express';
const router = express.Router();

import { authUser, 
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile, 
    getHomePage, 
    getAllcodes, 
    getAllusers, 
    deleteUser, 
    editUser } from '../controllers/userController.js';
    
import { protect } from '../middleware/authMiddleware.js';


router.post('/', registerUser);

router.post('/auth', authUser);

router.post('/logout', logoutUser);
router.post('/allcodes', getAllcodes);


router.post('/create-user', registerUser);

router.get('/get-all-user',protect, getAllusers );
router.delete('/delete-user',protect, deleteUser );
router.put('/edit-user',protect, editUser);



router.get('/home', protect, getHomePage);

router.get('/profile',protect, getUserProfile);

router.put('/profile',protect, updateUserProfile);


export default router;

