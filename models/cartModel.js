const mongoose = require('mongoose');
const User = require('./userModel');
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  products: [
    {
      productId: String,
      typeOfProd: { type: String, lowercase: true },
      quantity: Number,
      name: String,
      price: Number
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
