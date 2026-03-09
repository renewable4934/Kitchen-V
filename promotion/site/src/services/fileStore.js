const fs = require('fs/promises');
const path = require('path');

async function ensureFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '', 'utf8');
  }
}

async function appendNdjson(filePath, object) {
  await ensureFile(filePath);
  await fs.appendFile(filePath, `${JSON.stringify(object)}\n`, 'utf8');
}

module.exports = {
  appendNdjson
};
