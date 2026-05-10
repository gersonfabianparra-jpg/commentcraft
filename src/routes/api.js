const express = require('express');
const router  = express.Router();
const db      = require('../database/db');

router.get('/health', (_req, res) => res.json({ status: 'ok', app: 'CommentCraft', v: '1.0.0' }));

router.get('/history', (_req, res) => {
  try {
    res.json({ success: true, data: db.getHistory() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/history', (req, res) => {
  try {
    const { platform, username, avatar_color, comment_text, likes, verified, timestamp_text, extra_data } = req.body;
    if (!platform || !username || !comment_text)
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });

    const id = db.insertHistory({ platform, username, avatar_color, comment_text, likes, verified, timestamp_text, extra_data });
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/history/:id', (req, res) => {
  try {
    db.deleteHistory(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/history', (_req, res) => {
  try {
    db.clearHistory();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
