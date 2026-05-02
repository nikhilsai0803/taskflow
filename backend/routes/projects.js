const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { getProjects, getProject, createProject, updateProject, deleteProject, getProjectStats } = require('../controllers/projectController');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.get('/:id/stats', getProjectStats);

module.exports = router;
