// saving dreams!
// date should autosave
// content is whatever user types

import mongoose from 'mongoose';

const DreamSchema = new mongoose.Schema({
  date: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  hours: { type: Number, required: false },
  created: { type: Date, default: Date.now }
});

export default mongoose.model('DreamEntry', DreamSchema);