const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE  = path.join(DATA_DIR, 'history.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE))  fs.writeFileSync(DB_FILE, JSON.stringify({ history: [], nextId: 1 }));

function read() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { history: [], nextId: 1 };
  }
}

function write(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const db = {
  getHistory(limit = 60) {
    const data = read();
    return data.history.slice(0, limit);
  },

  insertHistory(item) {
    const data = read();
    const record = {
      id:             data.nextId++,
      platform:       item.platform,
      username:       String(item.username || '').slice(0, 60),
      avatar_color:   item.avatar_color || '#7C3AED',
      comment_text:   String(item.comment_text || '').slice(0, 600),
      likes:          parseInt(item.likes) || 0,
      verified:       item.verified ? 1 : 0,
      timestamp_text: item.timestamp_text || 'ahora',
      extra_data:     JSON.stringify(item.extra_data || {}),
      created_at:     new Date().toISOString(),
    };
    data.history.unshift(record);
    if (data.history.length > 200) data.history = data.history.slice(0, 200);
    write(data);
    return record.id;
  },

  deleteHistory(id) {
    const data = read();
    data.history = data.history.filter(r => r.id !== parseInt(id));
    write(data);
  },

  clearHistory() {
    const data = read();
    data.history = [];
    write(data);
  },
};

module.exports = db;
