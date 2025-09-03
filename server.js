const express = require('express');
const path = require('path');

const authRoutes = require('./routes/auth');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ggmapv2.html'));
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
