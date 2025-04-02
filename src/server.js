import express from 'express';
import path from 'path';
import cors from 'cors';
import { baseUrl, pool } from './server-helpers/db-pool.js';
import { inquireRedirect, logMicroAccess } from './controllers/redirect.controller.js';
import { findMicroRegistry, handleCreateMicro } from './controllers/micro.controller.js';

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

//
// _____________________________________
// Create endpoint
app.post('/api/micro', async (req, res) => {
  const { link, label, passcode } = req.body;
  const clientInfo = JSON.stringify({
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date(),
  });
  const response = await handleCreateMicro({ link, label, passcode, clientInfo });
  return res.status(response.status).json(response.payload);
});

app.post('/api/micro/:link', async (req, res) => {
  const { link } = req.params;
  const { label, passcode } = req.query;
  const clientInfo = JSON.stringify({
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date(),
  });
  const response = await handleCreateMicro({ link, label, passcode, clientInfo });
  return res.status(response.status).json(response.payload);
});

//
// _____________________________________
// Redirect endpoint
app.get('/:micro', async (req, res) => {
  let { micro } = req.params;
  micro = micro.toUpperCase();

  try {
    const microlinkResult = await findMicroRegistry({ micro });
    if (!microlinkResult || !microlinkResult.link) {
      return res.status(404).send('Micro link not found');
    }

    logMicroAccess(micro, req);

    const redirectUrl = await inquireRedirect(microlinkResult.link, req);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).send('Server error');
  }
});

//
// _____________________________________
// whatever
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    healthy: true,
    uptime: process.uptime(),
    mood: ['😀', 'happy', '😄', 'angry', 'sad', 'great', '😂', 'sei la mano to bem'][(Math.random() * 7) | 0],
  });
});

// terminal feedback that its working
const port = process.env.PORT || 3069;
app.listen(port, () => {
  console.log(`⧃〉Server running at "${baseUrl}"`);
});

// for when you press "ctrl + C" on the terminbal
process.on('SIGINT', () => {
  pool.end().then(() => {
    console.log('⧃〉Database pool closed');
    process.exit(0);
  });
});

export default app;
