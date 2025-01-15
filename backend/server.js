import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT || 5000;
import userRoutes from './routes/userRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

connectDB();
const app = express();
app.use(cors({credentials: true,origin:true}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/server', serverRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, ()=> console.log(`Server is running on port ${port}`))