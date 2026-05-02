const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');

router.use(protect);

router.route('/')
  .get(adminOnly, getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(adminOnly, deleteUser);

module.exports = router;
