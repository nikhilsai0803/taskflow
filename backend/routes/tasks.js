const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { getTasks, getMyTasks, getTask, createTask, updateTask, deleteTask, getDashboardStats } = require('../controllers/taskController');

router.use(protect);

router.get('/my',             getMyTasks);
router.get('/dashboard-stats',getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
