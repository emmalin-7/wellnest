import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import UserModel from './models/users.js';

// creating dreamentry for the dream log 
import mongoosePkg from 'mongoose';
const { Schema, model } = mongoosePkg;
const DreamEntry = model('DreamEntry', new Schema({
  date: { type: String, required: true },
  content: { type: String, required: true }
}));

// connect to .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173' }));

// connect to mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.error("mongodb connection error:", err));



// user login and register routes (this should work, is tested)

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email })
    .then(account => {
      if (account) {
        if (account.password === password) {
          res.json("Success");
        } else {
          res.json("Incorrect password");
        }
      } else {
        res.json("User does not exist");
      }
    })
    .catch(err => res.status(500).json("Server error"));
});

app.post('/register', (req, res) => {
  UserModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.status(400).json(err));
});



// logging dream routes 

app.post('/api/dreams', async (req, res) => {
  try {
    const { date, content } = req.body;

    // logging incoming dreams
    console.log('Received dream post:', req.body);

    const newDream = new DreamEntry({ date, content });
    await newDream.save();

    // log if saved
    console.log('Saved to database:', newDream);
    res.status(201).json(newDream);
  } catch (err) {
    console.error('Save failed:', err);
    res.status(500).json({ error: 'dream was not saved' });
  }
});

app.get('/api/dreams', async (req, res) => {
  try {
    const dreams = await DreamEntry.find().sort({ date: -1 });
    res.json(dreams);
  } catch (err) {
    console.error('Failed to fetch dream', err);
    res.status(500).json({ error: 'failed to fetch dream' });
  }
});


// backend run check

app.get('/', (req, res) => {
  res.send('backend runningggg, dream logging should work right now, check the console to see constant updates and error checking');
});

app.listen(5001, () => {
  console.log("server running at http://localhost:5001");
});