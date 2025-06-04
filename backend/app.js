import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

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
//        if (account.password === password) {
        if (bcrypt.compareSync(password, account.password)) {
          res.json({
            message: "Success",
            user: {
              email: account.email,
              id: account._id,
              name: account.name,
              hasChosenStar: account.hasChosenStar || false,
              starColor: account.starColor || null
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
// CHECKS FOR PASSWORD REQS
app.post('/register', (req, res) => {
  const { password } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 10 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    });
  }

  // password encryption!!
  const salt = bcrypt.genSaltSync(10);
  req.body.password = bcrypt.hashSync(password, salt);

  UserModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.status(400).json(err));
});

// logging dream routes
app.post('/api/dreams', async (req, res) => {
  try {
    const { content, user, isPublic, hours } = req.body;

    const pstNow = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const dateOnly = new Date(pstNow);
    const yyyy = dateOnly.getFullYear();
    const mm = String(dateOnly.getMonth() + 1).padStart(2, '0');
    const dd = String(dateOnly.getDate()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;

    if (!user) return res.status(400).json({ error: 'missing user' });

    let userId = user;
    if (!mongoose.Types.ObjectId.isValid(user)) {
      const userDoc = await UserModel.findOne({ email: user });
      if (!userDoc) return res.status(400).json({ error: 'User not found' });
      userId = userDoc._id;
    }

    const existing = await DreamEntry.findOne({ user: userId, date });
    if (existing) {
      return res.status(400).json({ error: 'You already posted a dream for today.' });
    }

    const pst = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const pstDate = new Date(pst);
    const year = pstDate.getFullYear();
    const month = String(pstDate.getMonth() + 1).padStart(2, '0');
    const day = String(pstDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const newDream = new DreamEntry({
      date: formattedDate,
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

// dealing with post liking 
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

// dealing with comment posts
app.post('/api/dreams/:dreamId/comment', async (req, res) => {
  const dreamId = req.params.dreamId;
  const { user, content } = req.body;

  if (!user) {
    return res.status(400).send('User required');
  }

  if (!content) {
    return res.status(400).send('Content required');
  }

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

// deleting comments, checks per user

app.delete('/api/dreams/:dreamId/comments/:commentId', async (req, res) => {
  const { dreamId, commentId } = req.params;
  const { user } = req.body;

  if (!user) {
    return res.status(400).send('User required');
  }

  let userId = user;
  if (!mongoose.Types.ObjectId.isValid(user)) {
    const userDoc = await UserModel.findOne({ email: user });
    if (!userDoc) return res.status(400).send('User not found');
    userId = userDoc._id;
  }

  const dream = await DreamEntry.findById(dreamId);
  if (!dream) return res.status(404).send('Dream post does not exist');

  const comment = dream.comments.id(commentId);
  if (!comment) return res.status(404).send('Comment not found');

  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).send('You can only delete your own comments');
  }

  console.log(`User ${userId} attempting to delete comment ${commentId} from dream ${dreamId}`);
  dream.comments = dream.comments.filter(c => c._id.toString() !== commentId);
  await dream.save();

  res.sendStatus(200);
});


app.get('/api/dreams', async (req, res) => {
  try {
    const { user, search, isPublic, hours, userSearch, date } = req.query;

    const filter = {};

    if (user) filter.user = user;
    if (isPublic === 'true') filter.isPublic = true;
    if (search) filter.content = { $regex: new RegExp(search, 'i') };
    if (hours) filter.hours = Number(hours);
    if (date) filter.date = date;

    const dreamsQuery = DreamEntry.find(filter)
    .sort({ date: -1, created: -1 })
    .populate('user', 'name starColor')
    .populate('comments.user', 'name email');

    let dreams = await dreamsQuery.exec();

    // post-query filtering by user name
    if (userSearch) {
      const regex = new RegExp(userSearch, 'i');
      dreams = dreams.filter(d => d.user?.name?.match(regex));
    }


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
    if (recentCount >= 10) {
      // 7 day avg, with missing days be 0
      const dates = [...Array(7)].map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return d.toISOString().slice(0, 10);
      });
    
      const users = await UserModel.find({}, '_id name');
      const userMap = {};
      users.forEach(user => {
        userMap[user._id.toString()] = { name: user.name, daily: {} };
      });

      const dreams = await DreamEntry.find({
        date: { $in: dates }
      });

      for (const dream of dreams) {
        const userId = dream.user.toString();
        if (userMap[userId]) {
          userMap[userId].daily[dream.date] = (userMap[userId].daily[dream.date] || 0) + (dream.hours || 0);
        }
      }

      // calculate the user averages for the leaderboard rankings
      const userAvgs = Object.entries(userMap)
      .filter(([_, { daily }]) => Object.keys(daily).length > 0)
      .map(([id, { name, daily }]) => {
        const total = dates.reduce((sum, date) => sum + (daily[date] || 0), 0);
        const avg = total / 7;
        return { _id: { _id: id, name }, avg };
      });

      userAvgs.sort((a, b) => b.avg - a.avg);
      const top10 = userAvgs.slice(0, 10);
      const bottom10 = userAvgs.slice(-10).reverse();

      res.json({ top10, bottom10, totalUsers: userAvgs.length, fallback: false });

    } else {
      const matchCondition = { hours: { $gt: 0 } };
      // const matchCondition = recentCount >= 10
      //   ? { date: { $gte: weekAgoStr }, hours: { $gt: 0 } }
      //   : { hours: { $gt: 0 } };

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

    // populate user names
    const populated = await UserModel.populate(leaderboardData, { path: '_id', select: 'name' });

    const top10 = populated.slice(0, 10);
    const bottom10 = populated.slice(-10).reverse();

    res.json({ top10, bottom10, fallback: recentCount < 10 })
    };
  } catch (err) {
    console.error("Leaderboard route error:", err);
    res.status(500).json({ error: "Leaderboard route failed" });
  }
});

// deleting posts

app.delete('/api/dreams/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // for safety, we confirm ownership
    const userId = req.query.user; 

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
    const user = await UserModel.findById(req.params.userId).select('name email starColor');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// star color choosing TEEHEE

app.put('/api/users/:userId/star', async (req, res) => {
  const { userId } = req.params;
  const { starColor } = req.body;

  if (!starColor) return res.status(400).json({ error: 'starColor is required' });

  try {
    const user = await UserModel.findByIdAndUpdate(userId, {
      starColor,
      hasChosenStar: true
    }, { new: true });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Error updating star color:', err);
    res.status(500).json({ error: 'Failed to update star color' });
  }
});


app.get('/', (req, res) => {
  res.send('backend runningggg, dream logging should work right now, check the console to see constant updates and error checking');
});

app.listen(5001, () => {
  console.log("server running at http://localhost:5001");
});