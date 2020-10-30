const mongoose = require('mongoose');
const User = require('./userModel');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryDetails: {
    phoneNo: { type: Number },
    portCode: { type: Number || String },
    floor: { type: Number },
    street: { type: String },
    latlng: [{ type: Number }],
    name: { type: String }
  },
  cartItems: [{}],
  active: { type: Boolean, default: true },
  orderType: { type: String }, //delivery or takeAway
  orderTime: { type: String }, //when to pickup or when wanting order
  orderPrice: { type: String }, //Price of the order
  orderNo: { type: Number },
  deploymentReady: { type: Boolean, default: false }
});

module.exports = mongoose.model('Order', orderSchema);
