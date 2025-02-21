import express from 'express';
import User from '../models/userModel.js';


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
    editUser, 
     } from '../controllers/userController.js';


    
import { protect} from '../middleware/authMiddleware.js';



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



router.post('/create-user-wimage' ,protect,    async (req, res) => {
      
    const { firstName,lastName, email, password, 
        address,  phoneNumber,roleID, genderID, positionID, image } = req.body;
        // const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        // const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // const resizeImage = await sharp(imageBuffer)
        // .resize(300, 300)
        // .toFormat('png');

        
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            address,
            roleID,
            genderID,
            image,
            phoneNumber,           
            positionID,
             
      
          });



    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})







export default router;

