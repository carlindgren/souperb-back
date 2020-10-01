const mongoose = require('mongoose');
const Drink = require('./drinkModel');

const cartSchema = new mongoose.Schema({
  drinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Drink' }],
  bread: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bread' }],
  soups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Soup' }]
});

module.exports = mongoose.model('Cart', cartSchema);
