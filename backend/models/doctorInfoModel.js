import mongoose from 'mongoose';




const doctorInfoModel = mongoose.Schema(
  {
    doctorID: {
      type: String,
      required: false,
    },
    priceID: {
      type: String,
      required: false,
    },
    

    paymentID: {
      type: String,
      required: false,
      
    },
    provinceID: {
      type: String,
      required: false,
      
    },
    clinicName: {
      type: String,
      required: false,
      
    },
    clinicAddress: {
      type: String,
      required: false,
      
    },

    

    note: {
      type: String,
      required: false,
      
    },

    count: {
      type: Number,
      required: false,
      
    },
    
    
  },
  {
    timestamps: true,
  }
);



const doctorInfo = mongoose.model('doctorInfo', doctorInfoModel);

export default doctorInfo;
