const mongoose = require('mongoose');
const User = require('./userModel');
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderType: { type: String },
  orderTime: { type: String },
  orderPrice: { type: String }
});

module.exports = mongoose.model('Order', orderSchema);
