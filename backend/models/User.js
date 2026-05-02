const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'], trim: true, maxlength: [50, 'Name too long']
  },
  email: {
    type: String, required: [true, 'Email is required'], unique: true,
    lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password: {
    type: String, required: [true, 'Password is required'], minlength: [6, 'Min 6 characters'], select: false
  },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  avatar: { type: String, default: '' },
  color: { type: String, default: '#4f8ef7' },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// Virtual: initials
UserSchema.virtual('initials').get(function () {
  return this.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
});

UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
