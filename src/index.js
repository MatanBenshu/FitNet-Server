
// Import required modules.
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import contentsRouts from './routes/contents.js';
import authRouts from './routes/auth.js';
import pingRouts from './routes/ping.js';
import aboutRouts from './routes/about.js';
import postRouts from './routes/post.js';
import eventRouts from './routes/event.js';
import groupRouts from './routes/group.js';
import userRouts from './routes/user.js';

// Set up the Express app. 
const app = express();

// Connect to MongoDB database.
const dbURI =
  'mongodb+srv://matanbe7:fitNet2024@fitnet.qt2bqpe.mongodb.net/?retryWrites=true&w=majority&appName=fitNet';

mongoose
    .connect(dbURI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve images from the public/images directory.
const __dirname = path.resolve();
//const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use('/ping', pingRouts);
app.use('/about', aboutRouts);
app.use('/contents' ,contentsRouts);
app.use('/auth', authRouts);
app.use('/posts', postRouts);
app.use('/events', eventRouts);
app.use('/groups', groupRouts);
app.use('/users', userRouts);

// Start the server.
const PORT = process.env.PORT || 5000;
const fun = () => console.log(`Server running on port ${PORT}`);
app.listen(PORT, fun);

