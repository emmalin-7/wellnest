import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import UserModel from './models/users.js';
import DreamEntry from './models/dreams.js';

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

// user login and register routes
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  UserModel.findOne({ email })
    .then(account => {
      if (account) {
        if (account.password === password) {
          res.json({
            message: "Success",
            user: {
              email: account.email,
              id: account._id,
              name: account.name
            }
          });
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

// creating users into database
app.post('/register', (req, res) => {
  UserModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.status(400).json(err));
});

// logging dream routes
app.post('/api/dreams', async (req, res) => {
  try {
    const { date, content, user, isPublic, hours } = req.body;

    if (!user) return res.status(400).json({ error: 'missing user' });

    let userId = user;
    if (!mongoose.Types.ObjectId.isValid(user)) {
      const userDoc = await UserModel.findOne({ email: user });
      if (!userDoc) return res.status(400).json({ error: 'User not found' });
      userId = userDoc._id;
    }

    const newDream = new DreamEntry({
      date,
      content,
      user: userId,
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

  let userId = user;
  if (!mongoose.Types.ObjectId.isValid(user)) {
    const userDoc = await UserModel.findOne({ email: user });
    if (!userDoc) return res.status(400).send('User not found');
    userId = userDoc._id;
  }

  const dream = await DreamEntry.findById(dreamId);
  if (!dream) return res.status(404).send('dream post does not exist');
  if (dream.likes.includes(userId)) return res.status(400).send('dream post already liked');

  dream.likes.push(userId);
  await dream.save();
  res.sendStatus(200);
});

app.post('/api/dreams/:dreamId/comment', async (req, res) => {
  const dreamId = req.params.dreamId;
  const { user, content } = req.body;

  let userId = user;
  if (!mongoose.Types.ObjectId.isValid(user)) {
    const userDoc = await UserModel.findOne({ email: user });
    if (!userDoc) return res.status(400).send('User not found');
    userId = userDoc._id;
  }

  const dream = await DreamEntry.findById(dreamId);
  if (!dream) return res.status(404).send('dream post does not exist');

  dream.comments.push({ user: userId, content });
  await dream.save();
  res.sendStatus(200);
});

app.get('/api/dreams', async (req, res) => {
  try {
    const { user , search, isPublic, hours } = req.query;

    const filter = {};
    if (user) filter.user = user;
    if (isPublic === 'true') filter.isPublic = true;
    if (search) filter.content = { $regex: new RegExp(search, 'i') };
    if (hours) filter.hours = Number(hours);

    const dreams = await DreamEntry.find(filter)
      .sort({ date: -1, created: -1 })
      .populate('user', 'name');

    res.json(dreams);
  } catch (err) {
    console.error('Failed to fetch dreams:', err);
    res.status(500).json({ error: 'failed to fetch dreams' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    const recentCount = await DreamEntry.countDocuments({
      date: { $gte: weekAgoStr },
      hours: { $gt: 0 }
    });

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

    // Populate user names
    const populated = await UserModel.populate(leaderboardData, { path: '_id', select: 'name' });

    const top10 = populated.slice(0, 10);
    const bottom10 = populated.slice(-10).reverse();

    res.json({ top10, bottom10, fallback: recentCount < 10 });
  } catch (err) {
    console.error("Leaderboard route error:", err);
    res.status(500).json({ error: "Leaderboard route failed" });
  }
});

// deleting posts

app.delete('/api/dreams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.user; // for safety, we confirm ownership

    const dream = await DreamEntry.findById(id);
    if (!dream) return res.status(404).json({ error: 'Dream not found' });

    if (dream.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Cannot delete this dream' });
    }

    await dream.deleteOne();
    res.status(200).json({ message: 'Dream deleted' });
  } catch (err) {
    console.error('Error deleting dream:', err);
    res.status(500).json({ error: 'Failed to delete dream' });
  }
});

// visiting user profiles 

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).select('name email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});


app.get('/', (req, res) => {
  res.send('backend runningggg, dream logging should work right now, check the console to see constant updates and error checking');
});

app.listen(5001, () => {
  console.log("server running at http://localhost:5001");
});