import mongoose from 'mongoose';




const doctorScheduleModel = mongoose.Schema(
  {
    doctorID: {
      type: String,
      required: false,
    },
    date: {
      type: String,
      required: false,
    },
    time: {
      type: String,
      required: false,
      
    },

    currentNumber: {
      type: Number,
      required: false,
      
    },

    maxNumber: {
      type: Number,
      required: false,
      
    },
    
    
  },
  {
    timestamps: true,
  }
);



const doctorSchedule = mongoose.model('doctorSchedule', doctorScheduleModel);

export default doctorSchedule;
