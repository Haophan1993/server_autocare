import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import Allcodes from '../models/allcodesModel.js';


// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
      
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleID: user.roleID,
        
        
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  });

  


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler( async (req, res) => {
    
  const { firstName,lastName, email, password, 
      address, roleID, phoneNumber, genderID, positionID } = req.body;
  
    
  
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
  
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      address,
      roleID,
      phoneNumber,
      genderID,
      positionID, 

    });
  
    if (user) {
      generateToken(res, user._id);
  
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        roleId: user.roleID,
        
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  });
  
  // @desc    Logout user / clear cookie
  // @route   POST /api/users/logout
  // @access  Public
  const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
  };
  
  // @desc    Get user profile
  // @route   GET /api/users/profile
  // @access  Private
  const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  });
  
  // @desc    Update user profile
  // @route   PUT /api/users/profile
  // @access  Private
  const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
  
      if (req.body.password) {
        user.password = req.body.password;
      }
  
      const updatedUser = await user.save();
  
      res.status(200).json({
        _id: updatedUser._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: updatedUser.email,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  });


  // @desc    Edit user profile
  // @route   PUT /api/users/edit-user
  // @access  Private
  const editUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.body.id);
  
    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.image = req.body.image || user.image;
  
      
  
      const updatedUser = await user.save();
  
      res.status(200).json({
        message: "Updated successfully",
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  });


  const getHomePage = asyncHandler(async (req, res) => {

    const userList = await User.find({}).select('-password');



    res.status(200).json({userList:userList })
  })


  const getAllcodes = asyncHandler(async (req, res) => {

      const inputtype = req.body.type;
  
      if(inputtype){
        try{

          const allcode = await Allcodes.find({type:inputtype});
          
          res.status(200).json({allcode: allcode});

          


    
        }catch(e){
          console.log(e)
        }

      }else{
        res.status(404).json({message: "Missing type of codes"})
      }
   
 
  })

  const getAllusers = asyncHandler(async (req, res) => {

    const id = req.body.id;

    if(id){
      try{
        const allUsers = await User.find({_id: id}).select('-password');


        if(allUsers){
          res.status(200).json({
            allUserslist: allUsers
          })
  
        }else{
          res.status(200).json({message: "No users found"});
  
        }
        
  
      }catch(e){
        console.log(e)
      }

    }else{
      try{
        const allUsers = await User.find({}).select(' -password');

        if(allUsers){
          res.status(200).json({
            allUserslist: allUsers
          })
  
        }else{
          res.status(200).json({message: "No users found"});
  
        }
        
  
      }catch(e){
        console.log(e)
      }
      
    }

    
    
    

    
  });

  const deleteUser = asyncHandler(async (req, res) => {
    if(!req.body.id){
      return res.status(200).json({
        message: "Missing id delete"
      })
    }
    
    try{
      let user = await User.find({_id: req.body.id});
      if(!user){
        res.status(200).json({message: "user is not exist"})
      }
      else{
        await User.deleteOne({_id:req.body.id});
        res.status(200).json({message: "user is delete!"})

      }
      



    }catch(e){
      console.log(e)
    }


  });

  export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getHomePage,
    getAllcodes, 
    getAllusers,
    deleteUser,
    editUser,
  };