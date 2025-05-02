import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

/*
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);
*/

app.use('/api/auth', authRoutes);

app.listen(5001, () => {
  console.log("server started at http://localhost:5001");
});

app.get('/', (req, res) => {
  res.send('backend still working!');
});


/*
// controller
app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.listen(5001, () => {
  console.log("Server started at http://localhost:5001");
});
*/