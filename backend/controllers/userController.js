const User = require('../models/User');

// GET /api/users  (admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('name');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// GET /api/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// PUT /api/users/:id  (admin or self)
exports.updateUser = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const allowed = ['name', 'email', 'color'];
    if (req.user.role === 'admin') allowed.push('role');
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id  (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed' });
  } catch (err) { next(err); }
};
