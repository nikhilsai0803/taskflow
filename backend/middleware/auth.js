const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Admin only
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Project member check
exports.projectMember = async (req, res, next) => {
  const Project = require('../models/Project');
  const project = await Project.findById(req.params.projectId || req.body.project);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const isMember = project.members.some(m => m.toString() === req.user._id.toString());
  const isOwner  = project.owner.toString() === req.user._id.toString();
  const isAdmin  = req.user.role === 'admin';

  if (!isMember && !isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not a project member' });
  }
  req.project = project;
  next();
};
