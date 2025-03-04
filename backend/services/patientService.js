import User from '../models/userModel.js';
import booking from '../models/bookingModel.js';
import generateToken from '../utils/generateToken.js';
import doctorSchedule from '../models/doctorScheduleModel.js';
import { v4 as uuidv4 } from "uuid";

const servicepostBookAppointment = (bookingData) => {
    const { doctorId, time, date, bookingPerson, gender, province,
        patientFirstName, patientLastName, patientPhoneNumber, patientEmail, patientAge } = bookingData;

    // console.log(
    // `doctorId: ${doctorId},
    // time: ${time},
    // date: ${date},
    // bookingPerson: ${bookingPerson},
    // gender: ${gender},
    // province: ${province},
    // patientFirstName: ${patientFirstName},
    // patientLastName: ${patientLastName},
    // patientPhoneNumber: ${patientPhoneNumber},
    // patientEmail: ${patientEmail}`);

    return new Promise(async (resolve, reject) => {
        try {





            const userExists = await User.findOne({ email: patientEmail });


            if (!userExists) {
                const user = await User.create({
                    firstName: patientFirstName,
                    lastName: 'Unknown',
                    email: patientEmail,
                    password: '123456',
                    address: '',
                    roleID: 'R3',
                    phoneNumber: patientPhoneNumber,
                    genderID: gender,
                    positionID: '',

                });

                if (user) {

                    const uniqueID = uuidv4();
                    await booking.create({
                        statusID: 'S1',
                        doctorID: doctorId,
                        patientID: user._id,
                        date: date,
                        timeType: time,
                        bookingPerson: bookingPerson,
                        age: patientAge,
                        confirmToken: uniqueID,
                    });

                    await doctorSchedule.create({
                        doctorID: doctorId,
                        date: date,
                        time: time,
                    })


                    resolve({ message: 'New booking is created for a new patient!' });

                }


            } else {
                const uniqueID = uuidv4();

                let result = await booking.create({
                    statusID: 'S1',
                    doctorID: doctorId,
                    patientID: userExists._id,
                    date: date,
                    timeType: time,
                    bookingPerson: bookingPerson,
                    age: patientAge,
                    confirmToken: uniqueID,
                });

                await doctorSchedule.create({
                    doctorID: doctorId,
                    date: date,
                    time: time,
                })

                resolve({
                    message: 'New booking is created for an existing patient!',
                    result
                });
            }







        } catch (e) {
            reject(e)
        }

    })

}

const serViceVerifyEmail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = data.token;
            let doctorID = data.doctorID;
            let appointmentExists = await booking.findOne({ confirmToken: token, doctorID: doctorID });

            if (appointmentExists) {
                let updateResult= await booking.updateOne(
                    { confirmToken: token, doctorID: doctorID },
                    { $set: { statusID: "S2" } }
                );
                resolve({
                    message : 'Confirm an existing appointment successfull!',
                    updateResult
                })

            }

        } catch (e) {
            reject(e);

        }
    })





}

export {
    servicepostBookAppointment, serViceVerifyEmail
}