import asyncHandler from 'express-async-handler';
import Markdown from '../models/markdownModel.js';
import multer from 'multer';
import sharp from 'sharp';



const getUsersWithRoles = async ()=>{
    return await User.aggregate([
        {
          $lookup: {
            from: "allcodes", // Collection name for AllCodes
            localField: "roleID", // Field in User collection (String)
            foreignField: "key", // Matching field in AllCodes collection (String)
            as: "roleDetails",

            
          }
        },
        {
          $unwind: {
            path: "$roleDetails",
            preserveNullAndEmptyArrays: true // Keep users even if roleID has no match
          }
        },

        {
            $lookup: {
              from: "allcodes", // Reference AllCodes again
              localField: "positionID", // Match positionID in User
              foreignField: "key", // Match key in AllCodes
              as: "positionDetails"
            }
          },
          {
            $unwind: {
              path: "$positionDetails",
              preserveNullAndEmptyArrays: true // Keep users even if positionID has no match
            }
          },
        {
            $match: { roleID: "R2" } // Filters users with roleID = "R2"
          }
      ]);
}

const getTopDoctorHome = asyncHandler(async (req, res) => {
    
    const id = req.body.id;

    if(id){
      try{
        const allUsers = await User.find({_id: id, roleID:"R2"}).select('-password');


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



        //const allUsers = await User.find({roleID:"R2"}).limit(10).select(' -password');
        const allUsers = await getUsersWithRoles();
        if(allUsers){
          res.status(200).json({
            doctorList: allUsers
          })
  
        }else{
          res.status(200).json({message: "No users found"});
  
        }
        
  
      }catch(e){
        console.log(e)
      }
      
    }
})



const markdownSave = async (req, res)=>{
  try {
    const { content } = req.body;
    

    const newMarkdown = await Markdown.create(
          {
            content,
            
          });
    
    res.json({ message: 'Markdown saved successfully!' ,
               markDown: newMarkdown});
      

    


    
  } catch (error) {
    res.status(500).json({ error: 'Error saving content' });
  }
}


export{getTopDoctorHome,markdownSave}