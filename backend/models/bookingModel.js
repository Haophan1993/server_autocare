import mongoose from 'mongoose';




const bookingModel = mongoose.Schema(
    {
        statusID: {
            type: String,
            required: false,
        },
        doctorID: {
            type: String,
            required: false,
        },
        patientID: {
            type: String,
            required: false,

        },
        date: {
            type: String,
            required: false,

        },
        timeType: {
            type: String,
            required: false,

        },
        bookingPerson: {
            type: String,
            required: false,

        },
        age: {
            type: Number,
            required: false,

        },

        confirmToken: {
            type: String,
            required: false,

        },




    },
    {
        timestamps: true,
    }
);



const booking = mongoose.model('booking', bookingModel);

export default booking;
