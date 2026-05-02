const express = require('express');
const router  = express.Router();
const {
  getTasks, getMyTasks, getTask,
  createTask, updateTask, deleteTask, getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect); // all task routes require login

router.get('/my',              getMyTasks);
router.get('/dashboard-stats', getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
