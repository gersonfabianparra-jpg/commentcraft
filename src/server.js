require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const api     = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "https://html2canvas.hertzen.com",
                   "https://pagead2.googlesyndication.com", "https://www.googletagmanager.com",
                   "https://partner.googleadservices.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc:   ["https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com"],
    },
  },
}));

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', api);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

/* En Vercel el módulo se importa como handler — no levantar servidor propio */
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n✨ CommentCraft corriendo en http://localhost:${PORT}\n`);
  });
}

module.exports = app;
