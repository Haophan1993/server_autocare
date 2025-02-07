import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import multer from 'multer';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;
  

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const upload = multer({
  limits: {
      fileSize: 1000000
  },
  fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Please upload an image'))
      }

      cb(undefined, true)
  }
})

const getimage = async (req, res, next)=>{

  upload.single('image');
  req.user.image= req.file.buffer;
  await req.user.save();


}

export { protect, getimage };
