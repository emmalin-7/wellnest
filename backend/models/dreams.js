// saving dreams!
// date should autosave
// content is whatever user types

import mongoose from 'mongoose';

const DreamSchema = new mongoose.Schema({
  date: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: String, required: true }
});

export default mongoose.model('DreamEntry', DreamSchema);