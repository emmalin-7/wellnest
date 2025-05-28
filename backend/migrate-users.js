import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from './models/users.js';
import DreamEntry from './models/dreams.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

const dreams = await DreamEntry.find({}).lean();

for (const dream of dreams) {
  if (typeof dream.user === 'string' && !dream.user.match(/^[0-9a-fA-F]{24}$/)) {
    const userDoc = await UserModel.findOne({ email: dream.user });
    if (userDoc) {
      await DreamEntry.updateOne({ _id: dream._id }, { user: userDoc._id });
      console.log(`updated dream ${dream._id} with user ${userDoc.name}`);
    } else {
      console.warn(`no user for ${dream._id} (user: ${dream.user})`);
    }
  }
}

console.log("conversion complete.");
process.exit();