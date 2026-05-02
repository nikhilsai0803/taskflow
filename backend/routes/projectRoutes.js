const express = require('express');
const router  = express.Router();
const {
  getProjects, getProject, createProject,
  updateProject, deleteProject, getProjectStats,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect); // all project routes require login

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.get('/:id/stats', getProjectStats);

module.exports = router;
