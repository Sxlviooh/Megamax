require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const DB_PATH = path.join(__dirname, 'db.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cambia-esta-clave';
const SESSION_SECRET = process.env.SESSION_SECRET || 'cambia-este-secreto';
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 12 } // 12h
}));

function readState() {
  if (!fs.existsSync(DB_PATH)) {
    return { videoUrl: '', chatChannel: '', delayMode: 'latam' };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeState(state) {
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'No autenticado' });
}

// --- API pública: cualquiera puede leer qué hay configurado ahora mismo ---
app.get('/api/state', (req, res) => {
  const state = readState();
  res.json(state);
});

// --- Login del admin ---
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Contraseña incorrecta' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// --- Solo el admin autenticado puede cambiar lo que se muestra ---
app.post('/api/admin/update', requireAuth, (req, res) => {
  const { videoUrl, chatChannel, delayMode } = req.body;
  const current = readState();
  const updated = {
    videoUrl: typeof videoUrl === 'string' ? videoUrl.trim() : current.videoUrl,
    chatChannel: typeof chatChannel === 'string'
      ? chatChannel.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : current.chatChannel,
    delayMode: (delayMode === 'reduced') ? 'reduced' : 'latam'
  };
  writeState(updated);
  res.json({ ok: true, state: updated });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`MEGAMAX watch corriendo en http://localhost:${PORT}`);
  console.log(`Panel admin en http://localhost:${PORT}/admin.html`);
});
