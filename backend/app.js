import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import UserModel from './models/users.js';


// connecting to .env holding Mongo Key
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// initiating express app
const app = express()
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173' })); // frontend runs on 5173

// connecting to the MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Connection error:", err));

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  UserModel.findOne({email: email})
  .then(account => {
    if(account) {
      if(account.password === password) {
        res.json("Success")
      } else {
        res.json("the password is incorrect")
      }
    } else {
      res.json("User does not exist")
    }
  })
})

app.post('/register', (req, res) => {
  UserModel.create(req.body)
  .then(users => res.json(users))
  .catch(err => res.json(err))
})

// controller
app.get('/', (req, res) => {
  res.send('backend still working!');
});

app.listen(5001, () => {
  console.log("server started at http://localhost:5001"); // backend runs on 5001
});



