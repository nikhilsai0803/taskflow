const express = require('express');
const router  = express.Router();
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect); // all user routes require login

router.get('/',        adminOnly, getUsers);
router.get('/:id',     getUser);
router.put('/:id',     updateUser);
router.delete('/:id',  adminOnly, deleteUser);

module.exports = router;
