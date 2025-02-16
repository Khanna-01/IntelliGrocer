const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['shopper', 'employee', 'manager'], required: true },
  employeeId: { type: String, required: function() { return this.role !== 'shopper'; } },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
