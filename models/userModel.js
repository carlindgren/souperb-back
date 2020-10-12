const mongoose = require('mongoose');

//think this through
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  displayName: { type: String }, //optional for rendering when logged in.
  phoneNumber: { type: Number },
  soup: [String],
  bread: [String],
  drinks: [String],
  preferedPayment: { type: String },
  Adress: {
    street: { type: String },
    ZipCode: {},
    portCode: { type: Number },
    floor: { type: Number }
  }
});

module.exports = mongoose.model('User', userSchema);
