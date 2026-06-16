const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const INDEX_PATH = path.join(__dirname, 'index.html');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10kb' }));
function renderPatchedIndex(_req, res) {
  fs.readFile(INDEX_PATH, 'utf8', (error, source) => {
    if (error) { console.error('Impossible de lire index.html :', error); return res.status(500).send('Erreur de chargement de CodePilote.'); }
    let html = source;
    html = html
      .replace(/\s*<script[^>]+src=["']\/home-refresh-pre\.js[^"']*["'][^>]*><\/script>\s*/gi, '\n')
      .replace(/\s*<link[^>]+href=["']\/home-refresh\.css[^"']*["'][^>]*>\s*/gi, '\n')
      .replace(/\s*<script[^>]+src=["']\/home-refresh\.js[^"']*["'][^>]*><\/script>\s*/gi, '\n');
    if (!html.includes('</head>')) { return res.status(500).send('La fin du head est introuvable.'); }
    if (!html.includes('</body>')) { return res.status(500).send('La fin du body est introuvable.'); }
    const cssLinks = ['css/tokens.css','css/base.css','css/components.css','css/screens.css','css/responsive.css'].map(href => `<link rel="stylesheet" href="/${href}?v=8">`).join('\n');
    html = html.replace('</head>', `${cssLinks}\n</head>`);
    html = html.replace('</body>', '<script type="module" src="/js/main.js?v=8"></script>\n</body>');
    res.set({ 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
    res.type('html').send(html);
  });
}
app.get(['/', '/index.html'], renderPatchedIndex);
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
const QUESTIONS = require('./questions.js');
function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
let queue = [];
const rooms = {};
const playerRooms = new Map();
function sendNextQuestion(match) {
  if (!match) return;
  const question = match.questions[match.qIndex];
  if (!question) {
    io.to(match.roomId).emit('duel_over', { scores: Object.fromEntries(Object.entries(match.players).map(([id, p]) => [id, p.score])) });
    return;
  }
  Object.values(match.players).forEach(p => { p.wrongCurrent = false; });
  io.to(match.roomId).emit('new_question', { index: match.qIndex, q: question.q, choices: question.choices });
  match.timeout = setTimeout(() => { match.qIndex += 1; sendNextQuestion(match); }, 15000);
}
io.on('connection', socket => {
  console.log('Joueur connecté :', socket.id);
  socket.on('join_queue', userProfile => {
    if (queue.some(p => p.id === socket.id)) return;
    queue.push({ id: socket.id, profile: userProfile || {}, socket });
    socket.emit('queue_joined');
    if (queue.length < 2) return;
    const p1 = queue.shift();
    const p2 = queue.shift();
    if (!p1?.socket || !p2?.socket) return;
    const roomId = `room_${p1.id}_${p2.id}`;
    p1.socket.join(roomId);
    p2.socket.join(roomId);
    playerRooms.set(p1.id, roomId);
    playerRooms.set(p2.id, roomId);
    rooms[roomId] = {
      roomId,
      players: {
        [p1.id]: { profile: p1.profile, score: 0, wrongCurrent: false, lastAnswerAt: 0 },
        [p2.id]: { profile: p2.profile, score: 0, wrongCurrent: false, lastAnswerAt: 0 }
      },
      qIndex: 0,
      questions: shuffle(QUESTIONS).slice(0, 5),
      isSuddenDeath: false,
      timeout: null
    };
    io.to(roomId).emit('match_found', { roomId });
    sendNextQuestion(rooms[roomId]);
  });
  socket.on('submit_answer', ({ roomId, answerIndex } = {}) => {
    const match = rooms[roomId];
    const player = match?.players?.[socket.id];
    const question = match?.questions?.[match.qIndex];
    if (!match || !player || !question || player.wrongCurrent) return;
    if (Date.now() - player.lastAnswerAt < 300) return;
    player.lastAnswerAt = Date.now();
    if (answerIndex === question.correct) {
      clearTimeout(match.timeout);
      player.score += 1;
      const ids = Object.keys(match.players);
      io.to(roomId).emit('player_scored', { scorerId: socket.id, correct: question.correct, explication: question.explication, scores: { [ids[0]]: match.players[ids[0]].score, [ids[1]]: match.players[ids[1]].score } });
      match.qIndex += 1;
      setTimeout(() => sendNextQuestion(match), 4500);
      return;
    }
    player.wrongCurrent = true;
    socket.emit('answer_wrong');
    socket.to(roomId).emit('opponent_wrong');
    if (Object.values(match.players).every(p => p.wrongCurrent)) {
      clearTimeout(match.timeout);
      io.to(roomId).emit('both_wrong', { correct: question.correct, explication: question.explication });
      match.qIndex += 1;
      setTimeout(() => sendNextQuestion(match), 4500);
    }
  });
  socket.on('disconnect', () => {
    queue = queue.filter(p => p.id !== socket.id);
    const roomId = playerRooms.get(socket.id);
    playerRooms.delete(socket.id);
    if (!roomId) return;
    const match = rooms[roomId];
    if (!match) return;
    clearTimeout(match.timeout);
    io.to(roomId).emit('opponent_left');
    Object.keys(match.players).forEach(id => playerRooms.delete(id));
    delete rooms[roomId];
  });
});
const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => console.log(`CodePilote en ligne sur le port ${PORT}`));
