import express from 'express';
import mongoose from 'mongoose';

import bodyParser from 'body-parser';
import cors from 'cors';
import contentsRouts from './routes/contents.js';
import authRouts from './routes/auth.js';
const app = express();

const dbURI =
  'mongodb+srv://matanbe7:fitNet2024@fitnet.qt2bqpe.mongodb.net/?retryWrites=true&w=majority&appName=fitNet';

mongoose
    .connect(dbURI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.json());
app.use('', authRouts);
app.use('/contents', contentsRouts);
app.use('/auth', authRouts);
const PORT = process.env.PORT || 5000;
const fun = () => console.log(`Server running on port ${PORT}`);
app.listen(PORT, fun);
