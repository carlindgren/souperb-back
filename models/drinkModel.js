const mongoose = require('mongoose');

const drinkSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  calories: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String } //optional for rendering when logged in.
});

module.exports = mongoose.model('Drink', drinkSchema);
