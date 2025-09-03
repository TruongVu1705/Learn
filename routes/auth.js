const express = require('express');
const router = express.Router();
const { loginHandler, createAccountHandler, forgotHandler } = require('../controllers/authController');

router.post('/login', loginHandler);
router.post('/create-account', createAccountHandler);
router.post('/forgot-password', forgotHandler);

module.exports = router;