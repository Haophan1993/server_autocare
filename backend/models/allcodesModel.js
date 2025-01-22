import mongoose from 'mongoose';




const allcodesSchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    value_en: {
      type: String,
      required: false,
      
    },
    value_vn: {
      type: String,
      required: false,
    },
    
  },
  {
    timestamps: true,
  }
);



const Allcodes = mongoose.model('Allcodes', allcodesSchema);

export default Allcodes;
