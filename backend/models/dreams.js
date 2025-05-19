// saving dreams!
// date should autosave
// content is whatever user types

const mongoose = require('mongoose');

const DreamSchema = new mongoose.Schema({
  date: { type: String, required: true },
  content: { type: String, required: true }
});

module.exports = mongoose.model('DreamEntry', DreamSchema);