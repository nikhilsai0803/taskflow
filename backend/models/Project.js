const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Project name is required'], trim: true, maxlength: [100, 'Name too long']
  },
  description: { type: String, trim: true, maxlength: [500, 'Description too long'], default: '' },
  color:  { type: String, default: '#4f8ef7' },
  owner:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
}, { timestamps: true, toJSON: { virtuals: true } });

// Virtual: task count (populated externally)
ProjectSchema.virtual('taskCount', {
  ref: 'Task', localField: '_id', foreignField: 'project', count: true
});

module.exports = mongoose.model('Project', ProjectSchema);
