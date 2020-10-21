const mongoose = require('mongoose');
const User = require('./userModel');
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  active: { type: Boolean, default: true },
  orderType: { type: String },
  orderTime: { type: String },
  orderPrice: { type: String },
  orderNo: { type: Number }
});

module.exports = mongoose.model('Order', orderSchema);
