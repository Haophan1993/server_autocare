import express from 'express';
import {getTopDoctorHome, markdownSave} from '../controllers/doctorController.js';   
import { protect} from '../middleware/authMiddleware.js';
import sharp from 'sharp';
import multer from 'multer';
import Markdown from '../models/markdownModel.js';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
      // Compress & Convert Image to PNG
      const compressedImage = await sharp(req.file.buffer)
        .resize({ width: 600 }) // Resize to 600px width
        .png({ quality: 80 }) // Convert to PNG & Compress
        .toBuffer();
  
      // Store in MongoDB
      const filename = `${Date.now()}.png`;
      let document = await Markdown.findOne();
      if (!document) document = new Markdown({ content: '', images: [] });
  
      document.images.push({
        filename,
        data: compressedImage,
        contentType: 'image/png',
      });
  
      await document.save();
  
      // Return Image URL (To Use in Markdown)
      res.json({ url: `/image/${filename}` });
    } catch (error) {
      res.status(500).json({ error: 'Error processing image' });
    }
  });
  
  // 🟢 Route to Retrieve Image from MongoDB
  router.get('/image/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const document = await Markdown.findOne({ 'images.filename': filename });
  
      if (!document) return res.status(404).json({ error: 'Image not found' });
  
      const image = document.images.find(img => img.filename === filename);
      res.set('Content-Type', image.contentType);
      res.send(image.data);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving image' });
    }
  });

  router.post('/save', async (req, res) => {
    try {
      const { content } = req.body;
      let document = await Markdown.findOne();
      if (document) {
        document.content = content;
      } else {
        document = new Markdown({ content });
      }
      await document.save();
      res.json({ message: 'Markdown saved successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Error saving content' });
    }
  });


router.get('/top-doctor-home', protect, getTopDoctorHome);
router.post('/save-markdown', markdownSave);









export default router;

