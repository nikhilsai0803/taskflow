const Project = require('../models/Project');
const Task    = require('../models/Task');

// GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const projects = await Project.find(filter)
      .populate('owner', 'name email color initials')
      .populate('members', 'name email color initials')
      .sort('-createdAt');

    // Attach task counts
    const withCounts = await Promise.all(projects.map(async (p) => {
      const obj = p.toJSON();
      obj.taskCount = await Task.countDocuments({ project: p._id });
      obj.doneCount = await Task.countDocuments({ project: p._id, status: 'done' });
      return obj;
    }));

    res.json({ success: true, count: withCounts.length, data: withCounts });
  } catch (err) { next(err); }
};

// GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email color initials')
      .populate('members', 'name email color initials');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Access control
    const isAccessible = req.user.role === 'admin'
      || project.owner._id.toString() === req.user._id.toString()
      || project.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isAccessible) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

// POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, color, members } = req.body;
    const memberIds = members || [];
    if (!memberIds.includes(req.user._id.toString())) memberIds.push(req.user._id);

    const project = await Project.create({ name, description, color, owner: req.user._id, members: memberIds });
    await project.populate(['owner', 'members']);
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Only owner or admin can update' });

    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('owner members');
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Only owner or admin can delete' });

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();
    res.json({ success: true, message: 'Project and all tasks deleted' });
  } catch (err) { next(err); }
};

// GET /api/projects/:id/stats
exports.getProjectStats = async (req, res, next) => {
  try {
    const pId = req.params.id;
    const [total, todo, inProgress, done, blocked, overdue] = await Promise.all([
      Task.countDocuments({ project: pId }),
      Task.countDocuments({ project: pId, status: 'todo' }),
      Task.countDocuments({ project: pId, status: 'in_progress' }),
      Task.countDocuments({ project: pId, status: 'done' }),
      Task.countDocuments({ project: pId, status: 'blocked' }),
      Task.countDocuments({ project: pId, status: { $ne: 'done' }, dueDate: { $lt: new Date() } }),
    ]);
    res.json({ success: true, data: { total, todo, inProgress, done, blocked, overdue, progress: total ? Math.round(done/total*100) : 0 } });
  } catch (err) { next(err); }
};
