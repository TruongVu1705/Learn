const fs = require('fs').promises;
const path = require('path');

exports.append = async (filename, text) => {
  const p = path.join(__dirname, '..', filename);
  await fs.appendFile(p, text, { encoding: 'utf8' });
};