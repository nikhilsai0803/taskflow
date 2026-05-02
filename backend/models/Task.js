const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Task name is required'], trim: true, maxlength: [200, 'Name too long']
  },
  description: { type: String, trim: true, default: '' },
  project:  { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:   { type: String, enum: ['todo', 'in_progress', 'done', 'blocked'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate:  { type: Date, default: null },
  tags:     [{ type: String, trim: true }],
}, { timestamps: true, toJSON: { virtuals: true } });

// Virtual: overdue
TaskSchema.virtual('isOverdue').get(function () {
  return this.dueDate && this.status !== 'done' && new Date(this.dueDate) < new Date();
});

// Index for efficient queries
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignee: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);
