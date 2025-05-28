import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import UserModel from './models/users.js';
import DreamEntry from './models/dreams.js';

// creating dreamentry for the dream log 
import mongoosePkg from 'mongoose';
const { Schema, model } = mongoosePkg;

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
          // changed to store the email 
          res.json({ message: "Success", user: { email: account.email, id: account._id } });
        } else {
          res.json({ message: "Incorrect password" });
        }
      } else {
        res.json({ message: "User does not exist" });
      }
    })
    .catch(err => {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    });
});

app.post('/register', (req, res) => {
  UserModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.status(400).json(err));
});



// logging dream routes 

app.post('/api/dreams', async (req, res) => {
  try {
    const { date, content, user, isPublic, hours } = req.body;

    if (!user) {
      return res.status(400).json({ error: 'missing user' });
    }

    console.log('Received dream post:', req.body);

    const newDream = new DreamEntry({
      date,
      content,
      user,
      isPublic: !!isPublic,
      hours: hours !== undefined ? Number(hours) : undefined
    });

    await newDream.save();
    console.log('Saved to database:', newDream);
    res.status(201).json(newDream);
  } catch (err) {
    console.error('Save failed:', err);
    res.status(500).json({ error: 'dream was not saved' });
  }
});


app.post('/api/dreams/:dreamId/like', async (req, res) => {
  const dreamId = req.params.dreamId;
  const { user } = req.body;
  const userId = new mongoose.Types.ObjectId(user);

  const dream = await DreamEntry.findById(dreamId);
  if (!dream) {
    res.status(404).send('dream post does not exist');
    return 
  }

  if (dream.likes.includes(userId)){
    res.status(400).send('dream post already liked');
    return
  }

  dream.likes.push(userId);
  await dream.save();

  res.sendStatus(200);
} )

app.post('/api/dreams/:dreamId/comment', async (req, res) => {
  const dreamId = req.params.dreamId;
  const { user, content } = req.body;
  const userId = new mongoose.Types.ObjectId(user);

  const dream = await DreamEntry.findById(dreamId);
  if (!dream) {
    res.status(404).send('dream post does not exist');
    return 
  }

  dream.comments.push({
    user:userId, content
  })

  await dream.save();
  res.sendStatus(200);
})


app.get('/api/dreams', async (req, res) => {
  try {
    const { user , search, isPublic, hours } = req.query;

    // filter users and public/private
    const filter = {};
    if (user) filter.user = user;
    if (isPublic === 'true') filter.isPublic = true;
    if (search) {
      filter.content = { $regex: new RegExp(search, 'i') }; 
    }
    if (hours) filter.hours = Number(hours);

    const dreams = await DreamEntry.find(filter).sort({ date: -1, created: -1 });
    res.json(dreams);
  } catch (err) {
    console.error('Failed to fetch dreams:', err);
    res.status(500).json({ error: 'failed to fetch dreams' });
  }
});


// leaderboard

app.get('/api/leaderboard', async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    // checking last 7 days
    const recentCount = await DreamEntry.countDocuments({
      date: { $gte: weekAgoStr },
      hours: { $gt: 0 }
    });

    // otherwise all-time
    const matchCondition = recentCount >= 10
      ? { date: { $gte: weekAgoStr }, hours: { $gt: 0 } }
      : { hours: { $gt: 0 } };

    const leaderboardData = await DreamEntry.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$user",
          totalHours: { $sum: "$hours" }
        }
      },
      { $sort: { totalHours: -1 } }
    ]);

    const top10 = leaderboardData.slice(0, 10);
    const bottom10 = leaderboardData.slice(-10).reverse();

    res.json({ top10, bottom10, fallback: recentCount < 10 });

  } catch (err) {
    console.error("Leaderboard route error:", err);
    res.status(500).json({ error: "Leaderboard route failed" });
  }
});


// backend run check

app.get('/', (req, res) => {
  res.send('backend runningggg, dream logging should work right now, check the console to see constant updates and error checking');
});

app.listen(5001, () => {
  console.log("server running at http://localhost:5001");
});