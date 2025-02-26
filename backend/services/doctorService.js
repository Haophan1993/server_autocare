
import Markdown from '../models/markdownModel.js';
import doctorSchedule from '../models/doctorScheduleModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import DoctorInfor from '../models/doctorInfoModel.js';


let serviceGetScheduleDetailByDoctorID = (doctorID, datePick) => {
    //console.log('doctorServer here');

    return new Promise(async (resolve, reject) => {
        try {
            //console.log(doctorID, datePick);




            const result = await doctorSchedule.aggregate([
                { $match: { doctorID: doctorID, date: datePick } },
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
            //console.log('Extract schedule of the doctor on DB: ', data);
            let existingTime

            existingTime = data.existingTimes;



            //console.log('existing Time: ', existingTime);
            resolve({
                message: "Respone successfull!",
                existingTime: existingTime
            })






        } catch (e) {
            reject(e);
        }
    })

}

let serviceCreateBulkDoctorSchedule = (schedule) => {
    return new Promise(async (resolve, reject) => {

        try {

            //let schedule = req.body.arraySche;
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

                        resolve({
                            message: "Save Appointments successfull",
                            appointment: savedAppointments
                        })


                    }

                }
                catch (e) {
                    console.log(e);
                }

            } else {
                resolve({
                    message: "Nothing to Save..",


                })

            }








        } catch (e) {
            reject(e);
        }

    })
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

const ServiceGetDoctorDetailById = (inputId) => {

    return new Promise(async (resolve, reject) => {

        try {
            let doctorInfo = await User.aggregate([
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
                {
                    $lookup: {
                        from: "doctorinfos",
                        let: { userId: '$_id' }, // Define a variable for the User's _id
                        pipeline: [
                            {
                                $addFields: { 
                                    doctorIdObjectId: { $toObjectId: '$doctorID' },
                                },
                            },
                            {
                                $match: { // Match the ObjectId fields
                                    $expr: { $eq: ['$doctorIdObjectId', '$$userId'] },
                                },
                            },
                        ],
                        as: 'additionalDoctorinfo',
                    },
                },
            ]);

            if (doctorInfo) {
                resolve(doctorInfo);
            } else {
                resolve();
            }

        } catch (e) {
            console.log(e);
            reject(e);
        }

    })

}

const serviceSaveDoctorInfor = (id, description, content, contentHTML, price, payment,province,clinicName, clinicAddress, clinicNote) => {
    return new Promise(async (resolve, reject) => {
        try {

            const existingMarkdown = await Markdown.findOne({ doctorId: id });
            const existingDoctorInfo = await DoctorInfor.findOne({ doctorID: id })
            console.log(existingDoctorInfo);
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

                resolve({ message: "Updated Markdown successfully!" })

            } else {
                 await Markdown.create(
                    {
                        content,
                        contentHTML,
                        description,
                        doctorId: id,


                    });
                resolve({ message: "Markdown saved successfully!" })

            }
            if(existingDoctorInfo){
                await DoctorInfor.findByIdAndUpdate(
                    existingDoctorInfo._id,{
                    priceID: price, 
                    paymentID: payment,
                    provinceID: province,
                    clinicName: clinicName, 
                    clinicAddress: clinicAddress, 
                    note: clinicNote
                },
                { new: true, runValidators: true });
                
                resolve({ message: "Updated Doctor Infor successfully!" });

            }else{
                await DoctorInfor.create({
                    doctorID: id,
                    priceID: price, 
                    paymentID: payment,
                    provinceID: province,
                    clinicName: clinicName, 
                    clinicAddress: clinicAddress, 
                    note: clinicNote
                })
                console.log("New Doctor Infor successfully!")
                resolve({ message: "New Doctor Infor successfully!" });

            }


        } catch (e) {
            console.log(e);
            reject(e);
        }
    })
}

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

const serviceGetTopDoctorHome = (id) => {

    return new Promise(async (resolve, reject) => {
        try {
            if (id) {
                try {
                    const allUsers = await User.find({ _id: id, roleID: "R2" }).select('-password');


                    if (allUsers) {
                        resolve.json({
                            allUserslist: allUsers
                        })

                    } else {
                        resolve({ message: "No users found" });

                    }


                } catch (e) {
                    console.log(e)
                }

            } else {
                try {



                    //const allUsers = await User.find({roleID:"R2"}).limit(10).select(' -password');
                    const allUsers = await getUsersWithRoles();
                    if (allUsers) {
                        resolve({
                            doctorList: allUsers
                        })

                    } else {
                        resolve({ message: "No users found" });

                    }


                } catch (e) {
                    console.log(e)
                }

            }

        } catch (e) {
            console.log(e);
            reject(e);
        }
    })

}

const serviceGetExtraDetailByDoctorID = (id)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            let doctorInfo = await User.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(id) }, // Match User by _id (if you want a specific doctor)
                },
                {
                    $lookup: {
                        from: "doctorinfos",
                        let: { userId: '$_id' }, // Define a variable for the User's _id
                        pipeline: [
                            {
                                $addFields: { 
                                    doctorIdObjectId: { $toObjectId: '$doctorID' },
                                },
                            },
                            {
                                $match: { // Match the ObjectId fields
                                    $expr: { $eq: ['$doctorIdObjectId', '$$userId'] },
                                },
                            },

                            {
                                $lookup: {
                                    from: "allcodes",
                                    localField: "priceID", // Field in doctorinfos
                                    foreignField: "key", // Field in allcodes
                                    as: "priceInfo",
                                },
                            },
                            {
                                $lookup: {
                                    from: "allcodes",
                                    localField: "paymentID", // Field in doctorinfos
                                    foreignField: "key", // Field in allcodes
                                    as: "paymentInfo",
                                },
                            },

                            {
                                $lookup: {
                                    from: "allcodes",
                                    localField: "provinceID", // Field in doctorinfos
                                    foreignField: "key", // Field in allcodes
                                    as: "provinceInfo",
                                },
                            },
                        ],
                        as: 'additionalDoctorinfo',
                    },
                },
                
                {
                    $project:{
                        image:0,
                        password:0,
                    }
                }
            ]);

            if (doctorInfo) {
                resolve(doctorInfo);
            } else {
                resolve();
            }

        } catch (e) {
            console.log(e);
            reject(e);
        }
    })
}

export {
    serviceGetScheduleDetailByDoctorID,
    serviceCreateBulkDoctorSchedule,
    ServiceGetDoctorDetailById,
    serviceSaveDoctorInfor,
    serviceGetTopDoctorHome,
    serviceGetExtraDetailByDoctorID
}

