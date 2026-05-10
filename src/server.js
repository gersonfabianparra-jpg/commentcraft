require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const api     = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3000;

/* CSP desactivado — AdSense usa docenas de dominios de Google que
   no se pueden blanquear estáticamente sin romper la verificación */
app.use(helmet({ contentSecurityPolicy: false }));

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
