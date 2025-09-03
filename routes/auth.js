const express = require('express');
const router = express.Router();
const { loginHandler, createAccountHandler } = require('../controllers/authController');

router.post('/login', loginHandler);
router.post('/create-account', createAccountHandler);

module.exports = router;