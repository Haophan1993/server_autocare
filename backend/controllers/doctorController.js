import asyncHandler from 'express-async-handler';
import {serviceGetScheduleDetailByDoctorID, 
  serviceCreateBulkDoctorSchedule,
  ServiceGetDoctorDetailById, 
serviceSaveDoctorInfor,
serviceGetTopDoctorHome} from '../services/doctorService.js';




// Done
const getTopDoctorHome = asyncHandler(async (req, res) => {

  const id = req.body.id;
  try{
    const allUsers = await serviceGetTopDoctorHome(id);
      if (allUsers) {
        res.status(200).json(allUsers)

      } else {
        res.status(200).json({ message: "No users found" });

      }


  }catch(e){
    res.status(500).json({
      e
    })
  }

  // if (id) {
  //   try {
  //     const allUsers = await User.find({ _id: id, roleID: "R2" }).select('-password');


  //     if (allUsers) {
  //       res.status(200).json({
  //         allUserslist: allUsers
  //       })

  //     } else {
  //       res.status(200).json({ message: "No users found" });

  //     }


  //   } catch (e) {
  //     console.log(e)
  //   }

  // } else {
  //   try {



  //     //const allUsers = await User.find({roleID:"R2"}).limit(10).select(' -password');
  //     const allUsers = await getUsersWithRoles();
  //     if (allUsers) {
  //       res.status(200).json({
  //         doctorList: allUsers
  //       })

  //     } else {
  //       res.status(200).json({ message: "No users found" });

  //     }


  //   } catch (e) {
  //     console.log(e)
  //   }

  // }
})


//Done
const saveDoctorInfor = async (req, res) => {
  const { id, description, content, contentHTML, 
    price, payment,province,clinicName, clinicAddress, clinicNote } = req.body;



  try {
    //console.log('check data from client: ', id, description, content, contentHTML)
    if (!(id || content || contentHTML)) {
      res.json({ message: "missing doctor ID" })
    } else {

      const serviceRespone = await serviceSaveDoctorInfor(id, description, content, contentHTML, price, payment,province,clinicName, clinicAddress, clinicNote);
      if(serviceRespone){
        res.status(200).json(serviceRespone);
      }

      // const existingMarkdown = await Markdown.findOne({ doctorId: id });
      // //console.log(existingMarkdown);
      // if (existingMarkdown) {
      //   await Markdown.findByIdAndUpdate(
      //     existingMarkdown._id, // Use the _id of the existing document
      //     {
      //       content,
      //       contentHTML,
      //       description,
      //       // doctorId: id,  No need to update doctorId, it should be the same
      //     },
      //     { new: true, runValidators: true } // Return the updated document, validate updates
      //   );
      //   res.status(200).json({ message: "Markdown saved successfully!" })
      // } else {
      //   const newMarkdown = await Markdown.create(
      //     {
      //       content,
      //       contentHTML,
      //       description,
      //       doctorId: id,


      //     });
      //   res.status(200).json({ message: "Markdown saved successfully!" })

      // }
    }

  } catch (error) {
    res.status(500).json({ error: 'Error saving content' });
  }
}







// Done
const getDoctorDetailById = async (req, res) => {

  if(req.query.id){
    try{
      let doctorInfo = await ServiceGetDoctorDetailById(req.query.id);
      if (doctorInfo) {
            return res.status(200).json({
              message: "Doctor Found",
              doctorInfo,
            })
      
          } else {
            return res.status(200).json({
              message: "No doctor found",
              doctor: [],
            })
          }

    }catch(e){
      console.log(e);
     return res.status(200).json({
       message: "Error Code From Server",
     })
    }
  }else{
    return res.status(200).json({
      message: "Missing parameters",
    })
  }


  
}

// Done
const createBulkDoctorSchedule = async (req, res) => {


  
  if (!req.body.arraySche) {
    res.status(200).json({
      message: "missing parameters"
    })

  } else {
    
    let infor = await serviceCreateBulkDoctorSchedule(req.body.arraySche);
    return res.status(200).json(
      infor
    )
  }
}



// Done 
const getScheduleDetailByDoctorID = async (req, res) => {



  let docID = req.query.doctorID;
  let datePick = req.query.selectedDate;

  if(docID&&datePick){
    try{
      let infor = await serviceGetScheduleDetailByDoctorID(docID,datePick);
      //console.log('infor at controller: ', infor);
      return res.status(200).json(
        infor
      )

    }catch(e){
      console.log(e);
      return res.status(200).json({
        message: 'Error from server'
      })
    }
    
  }else{
       res.status(200).json({
      message: "Missing parameters from client!"
    })
  }
}


export { getTopDoctorHome, 
  saveDoctorInfor, 
  getDoctorDetailById, 
  createBulkDoctorSchedule, 
  getScheduleDetailByDoctorID }