import asyncHandler from 'express-async-handler';
import Markdown from '../models/markdownModel.js';
import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import doctorSchedule from '../models/doctorScheduleModel.js'



const getUsersWithRoles = async () => {
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

  if (id) {
    try {
      const allUsers = await User.find({ _id: id, roleID: "R2" }).select('-password');


      if (allUsers) {
        res.status(200).json({
          allUserslist: allUsers
        })

      } else {
        res.status(200).json({ message: "No users found" });

      }


    } catch (e) {
      console.log(e)
    }

  } else {
    try {



      //const allUsers = await User.find({roleID:"R2"}).limit(10).select(' -password');
      const allUsers = await getUsersWithRoles();
      if (allUsers) {
        res.status(200).json({
          doctorList: allUsers
        })

      } else {
        res.status(200).json({ message: "No users found" });

      }


    } catch (e) {
      console.log(e)
    }

  }
})


// have to fix => first if the doctorId is existed first then save
const saveDoctorInfor = async (req, res) => {
  const { id, description, content, contentHTML } = req.body;



  try {
    //console.log('check data from client: ', id, description, content, contentHTML)
    if (!(id || content || contentHTML)) {
      res.json({ message: "missing doctor ID" })
    } else {


      const existingMarkdown = await Markdown.findOne({ doctorId: id });
      //console.log(existingMarkdown);
      if (existingMarkdown) {
        await Markdown.findByIdAndUpdate(
          existingMarkdown._id, // Use the _id of the existing document
          {
            content,
            contentHTML,
            description,
            // doctorId: id,  No need to update doctorId, it should be the same
          },
          { new: true, runValidators: true } // Return the updated document, validate updates
        );
        res.status(200).json({ message: "Markdown saved successfully!" })
      } else {
        const newMarkdown = await Markdown.create(
          {
            content,
            contentHTML,
            description,
            doctorId: id,


          });
        res.status(200).json({ message: "Markdown saved successfully!" })

      }
    }

  } catch (error) {
    res.status(500).json({ error: 'Error saving content' });
  }
}



const getDoctorDetail = async (inputId) => {

  return await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(inputId) }, // Match User by _id (if you want a specific doctor)
    },
    {
      $lookup: {
        from: "markdowns",
        let: { userId: '$_id' }, // Define a variable for the User's _id
        pipeline: [
          {
            $addFields: { // Add a new ObjectId field to the Markdown documents
              doctorIdObjectId: { $toObjectId: '$doctorId' },
            },
          },
          {
            $match: { // Match the ObjectId fields
              $expr: { $eq: ['$doctorIdObjectId', '$$userId'] },
            },
          },
        ],
        as: 'markdowns',
      },
    },
  ]);
}


const getDoctorDetailById = async (req, res) => {

  try {

    //console.log(req.query.id);

    let doctorInfo = await getDoctorDetail(req.query.id)
    if (doctorInfo) {
      return res.status(200).json({
        message: "Doctor Found",
        doctor: doctorInfo,
      })

    } else {
      return res.status(200).json({
        message: "No doctor found",
        doctor: [],
      })
    }

  } catch (e) {
    console.log(e);
    return res.status(200).json({
      message: "Error Code From Server",
    })
  }
}

const createBulkDoctorSchedule = async (req, res) => {


  //console.log('Data from client ', req.body.arraySche);
  if (!req.body.arraySche) {
    res.status(200).json({
      message: "missing parameters"
    })

  } else {
    let schedule = req.body.arraySche;
    //console.log('Data from client: ', schedule);
    let docID = schedule[0].doctorID;
    let datePick = schedule[0].date;

    const result = await doctorSchedule.aggregate([
      { $match: { doctorID: docID, date: datePick } },
      {
        $group: {
          _id: "$doctorID",
          totalAppointments: { $sum: 1 },
          existingTimes: { $push: "$time" } // Collect all booked times
        }
      }
    ]);

    // Extract results
    const data = result[0] || { totalAppointments: 0, existingTimes: [] }
    //console.log('Extract schedule of the doctor on DB: ', data );

    let existingTime = data.existingTimes;

    const filterSchedule = schedule.filter(item => {

      return !existingTime.includes(item.time);
    })

    //console.log('After filter: ', filterSchedule);

    if (filterSchedule && filterSchedule.length > 0) {
      try {
        const savedAppointments = await doctorSchedule.insertMany(filterSchedule);

        if (savedAppointments) {
          res.status(200).json({
            message: "Save Appointments successfull",
            appointment: savedAppointments
          })
        }

      }
      catch (e) {
        console.log(e);
      }

    } else {
      res.status(200).json({
        message: "Nothing to Save..",


      })

    }





  }
}

const saveAppointmentsBatch = async (appointments) => {
  try {
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return console.log("Invalid input: Must provide an array of appointments.");
    }

    // Extract unique doctorIDs and dates from the request
    const doctorDatePairs = [...new Set(appointments.map(a => `${a.doctorID}_${a.date}`))];

    // Fetch existing appointment counts and booked times in a single query
    const existingData = await doctorSchedule.aggregate([
      {
        $match: {
          $or: doctorDatePairs.map(pair => {
            const [doctorID, date] = pair.split("_");
            return { doctorID: new mongoose.Types.ObjectId(doctorID), date };
          })
        }
      },
      {
        $group: {
          _id: { doctorID: "$doctorID", date: "$date" },
          totalAppointments: { $sum: 1 },
          existingTimes: { $push: "$time" }
        }
      }
    ]);

    // Convert aggregation results into a lookup map
    const appointmentLookup = new Map();
    existingData.forEach(doc => {
      appointmentLookup.set(`${doc._id.doctorID}_${doc._id.date}`, {
        totalAppointments: doc.totalAppointments,
        existingTimes: doc.existingTimes
      });
    });

    // Validate all appointments before insertion
    for (let appointment of appointments) {
      const key = `${appointment.doctorID}_${appointment.date}`;
      const existingData = appointmentLookup.get(key) || { totalAppointments: 0, existingTimes: [] };

      // Check if doctor has reached max appointments for the day
      if (existingData.totalAppointments >= 10) {
        return console.log(`Booking failed: Doctor ${appointment.doctorID} already has 10 appointments on ${appointment.date}.`);
      }

      // Check if the time slot is already taken
      if (existingData.existingTimes.includes(appointment.time)) {
        return console.log(`Booking failed: Time slot ${appointment.time} is already booked for doctor ${appointment.doctorID} on ${appointment.date}.`);
      }

      // Update the lookup to simulate adding this appointment (to avoid duplicate booking within the same batch)
      existingData.totalAppointments += 1;
      existingData.existingTimes.push(appointment.time);
      appointmentLookup.set(key, existingData);
    }

    // If all validations pass, insert the batch in a single operation
    const insertedAppointments = await doctorSchedule.insertMany(appointments);
    console.log("Appointments booked successfully:", insertedAppointments);
  } catch (error) {
    console.error("Error saving appointments:", error);
  }
};


const getScheduleDetailByDoctorID = async (req, res) => {



  let docID = req.query.doctorID;
  let datePick = req.query.selectedDate;
  //console.log('Data from client: ', docID, datePick);

  if(docID&&datePick){
    try{
      const result = await doctorSchedule.aggregate([
        { $match: { doctorID: docID, date: datePick } },
        {
          $group: {
            _id: "$doctorID",
            totalAppointments: { $sum: 1 },
            existingTimes: { $push: "$time" } // Collect all booked times
          }
        }
      ]);
    
      // Extract results
      const data = result[0] || { totalAppointments: 0, existingTimes: [] }
      //console.log('Extract schedule of the doctor on DB: ', data );
    
      let existingTime = data.existingTimes;

      res.status(200).json({
        message: "Respone successfull!",
        existingTime: existingTime
      })
  
    }catch(e){
      console.log(e);
    }

  }else{
    res.status(200).json({
      message: "Missing parameters from client!"
    })
  }
  
  


}


export { getTopDoctorHome, saveDoctorInfor, getDoctorDetailById, createBulkDoctorSchedule, getScheduleDetailByDoctorID }