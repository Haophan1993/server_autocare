import mongoose from 'mongoose';

const markdownSchema = new mongoose.Schema(
    {
  content: {
    type: String}
    , // Markdown content (without Base64 images)

    contentHTML: {
        type: String}
        ,
    description:{
        type: String
    },

    doctorId:{
        type: String
    },
    specialtyId:{
        type: String
    },
    clinicId:{
        type: String
    },
  images: [
    {
      filename: String, // Image file name
      data: Buffer, // Binary image data
      contentType: String, // MIME type (e.g., 'image/png')
    },
  ],
});

const Markdown = mongoose.model('Markdown', markdownSchema);

export default  Markdown;