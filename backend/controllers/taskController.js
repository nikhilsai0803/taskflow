const Task    = require('../models/Task');
const Project = require('../models/Project');

// GET /api/tasks  (with filters)
exports.getTasks = async (req, res, next) => {
  try {
    const { project, assignee, status, priority, overdue, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') {
      const myProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }]
      }).select('_id');
      filter.project = { $in: myProjects.map(p => p._id) };
    }

    if (project)  filter.project  = project;
    if (assignee) filter.assignee = assignee;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (overdue === 'true') {
      filter.status  = { $ne: 'done' };
      filter.dueDate = { $lt: new Date() };
    }

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignee', 'name email color initials')
        .populate('createdBy', 'name')
        .populate('project', 'name color')
        .sort('-createdAt').skip(skip).limit(Number(limit)),
      Task.countDocuments(filter)
    ]);

    res.json({ success: true, count: tasks.length, total, page: Number(page), data: tasks });
  } catch (err) { next(err); }
};

// GET /api/tasks/my
exports.getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name color')
      .populate('assignee', 'name color initials')
      .sort('dueDate');
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) { next(err); }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee createdBy', 'name email color initials')
      .populate('project', 'name color members owner');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { name, description, project, assignee, status, priority, dueDate, tags } = req.body;
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found' });

    const canCreate = req.user.role === 'admin'
      || proj.owner.toString() === req.user._id.toString()
      || proj.members.some(m => m.toString() === req.user._id.toString());
    if (!canCreate) return res.status(403).json({ success: false, message: 'Not a project member' });

    const task = await Task.create({ name, description, project, assignee, status, priority, dueDate, tags, createdBy: req.user._id });
    await task.populate(['assignee', 'createdBy', 'project']);
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const canEdit = req.user.role === 'admin'
      || task.createdBy.toString() === req.user._id.toString()
      || task.assignee?.toString() === req.user._id.toString()
      || task.project.owner.toString() === req.user._id.toString();
    if (!canEdit) return res.status(403).json({ success: false, message: 'Not authorized to edit' });

    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignee createdBy', 'name email color initials')
      .populate('project', 'name color');
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const canDelete = req.user.role === 'admin'
      || task.createdBy.toString() === req.user._id.toString()
      || task.project.owner.toString() === req.user._id.toString();
    if (!canDelete) return res.status(403).json({ success: false, message: 'Not authorized to delete' });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

// GET /api/tasks/dashboard-stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const myProjects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select('_id');
    const pIds = myProjects.map(p => p._id);

    const [total, done, inProgress, overdue, myOpen] = await Promise.all([
      Task.countDocuments({ project: { $in: pIds } }),
      Task.countDocuments({ project: { $in: pIds }, status: 'done' }),
      Task.countDocuments({ project: { $in: pIds }, status: 'in_progress' }),
      Task.countDocuments({ project: { $in: pIds }, status: { $ne: 'done' }, dueDate: { $lt: new Date() } }),
      Task.countDocuments({ assignee: userId, status: { $ne: 'done' } }),
    ]);

    res.json({ success: true, data: { total, done, inProgress, overdue, myOpen, projects: pIds.length } });
  } catch (err) { next(err); }
};
