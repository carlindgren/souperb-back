const mongoose = require('mongoose');

//think this through
const userSchema = new mongoose.Schema({
  ROLE: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  displayName: { type: String }, //optional for rendering when logged in.
  phoneNumber: { type: Number },
  preferedPayment: { type: String },
  adress: {
    name: { type: String },
    street: {},
    zipCode: {},
    portCode: {},
    floor: { type: Number }
  },
  discount: { type: Boolean, default: false },
  boughtSoups: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
