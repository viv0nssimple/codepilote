const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Sert le dossier courant (où se trouve index.html)
app.use(express.static(__dirname));

// ============================================================
//  BANQUE DE QUESTIONS (Identique au client)
// ============================================================
const QUESTIONS = [
  { q:"Sur une route à 2 voies sans marquage central, deux véhicules se croisent en sens inverse. Lequel des deux doit serrer à droite ?", choices:["Celui qui monte la pente","Les deux doivent serrer à droite","Celui qui descend la pente"], correct:1, explication:"Sur route bidirectionnelle, chaque conducteur serre à droite. Aucun n'a la priorité sur l'autre." },
  { q:"Le feu tricolore est orange fixe. Que dois-tu faire si tu peux t'arrêter sans risque ?", choices:["Accélérer pour passer avant le rouge","Freiner et t'arrêter avant la ligne","Continuer normalement"], correct:1, explication:"L'orange fixe signifie 'arrêtez-vous si vous pouvez'. Forcer le passage est interdit sauf si l'arrêt est impossible." },
  { q:"En agglomération, quelle est la vitesse maximale autorisée par défaut ?", choices:["50 km/h","70 km/h","45 km/h"], correct:0, explication:"En agglomération la limite générale est 50 km/h (art. R413-3), sauf panneau différent." },
  { q:"Tu roules sur une route prioritaire (panneau AB6). À l'intersection, tu dois :", choices:["Réduire ta vitesse par prudence mais tu as la priorité","Céder le passage à droite","T'arrêter et attendre"], correct:0, explication:"Sur route prioritaire tu conserves la priorité, mais la prudence reste obligatoire." },
  { q:"Distance de sécurité minimale derrière un poids lourd à 80 km/h sur autoroute ?", choices:["50 m environ (2 s)","80 m environ (3-4 s)","2 longueurs de camion"], correct:1, explication:"Derrière un poids lourd la visibilité est réduite : 3-4 secondes (≈80 m) sont recommandées." },
  { q:"Feu rouge mais panneau 'feu vert clignotant' pour les cyclistes. Tu dois :", choices:["Tourner quand même","Attendre ton feu vert en laissant passer les vélos","Klaxonner et passer"], correct:1, explication:"Le feu vert clignotant pour vélos ne donne aucun droit aux véhicules motorisés." },
  { q:"Par temps de pluie sur autoroute, la vitesse maximale autorisée est :", choices:["110 km/h","100 km/h","90 km/h"], correct:1, explication:"Par pluie sur autoroute : 100 km/h (art. R413-2)." },
  { q:"Le panneau rond à fond blanc avec bord rouge et chiffre noir signifie :", choices:["Vitesse conseillée","Vitesse minimale obligatoire","Vitesse maximale autorisée"], correct:2, explication:"Panneau rond rouge = interdiction. Ici : vitesse maximale autorisée." },
  { q:"Crevaison soudaine sur autoroute : quelle est la première chose à faire ?", choices:["Freiner fort","Allumer les feux de détresse et tenir fermement le volant","Changer immédiatement de voie"], correct:1, explication:"Priorité : garder le contrôle. Feux de détresse, volant ferme, décélération progressive." },
  { q:"Qui est prioritaire dans un giratoire en France ?", choices:["Les véhicules qui entrent","Les véhicules déjà engagés","Celui qui vient de droite"], correct:1, explication:"Dans un giratoire le cédez-le-passage est à l'entrée. Les véhicules DEDANS ont la priorité." },
  { q:"Triangle rouge avec un vélo à l'intérieur. Cela signifie :", choices:["Voie réservée aux cyclistes","Attention, présence possible de cyclistes","Interdiction de dépasser les cyclistes"], correct:1, explication:"Triangle rouge = DANGER. Il avertit de la présence possible de cyclistes, sans rien interdire." },
  { q:"Taux d'alcoolémie maximal pour un conducteur NOVICE :", choices:["0,5 g/L","0,2 g/L","0 g/L (zéro alcool)"], correct:1, explication:"Conducteur en période probatoire : 0,2 g/L de sang (contre 0,5 g/L pour les confirmés)." },
  { q:"Distance minimale interdite pour se garer avant un passage piéton ?", choices:["5 m en amont du passage","10 m avant ET après","5 m avant ET après"], correct:0, explication:"Arrêt et stationnement interdits à moins de 5 m en amont d'un passage piéton (art. R417-11)." },
  { q:"Les losanges peints au sol sur la chaussée signifient :", choices:["Zone de ralentissement","Voie réservée (bus, vélos, taxis…)","Zone de dépassement interdit"], correct:1, explication:"Les losanges au sol = voie réservée. Circuler dessus en véhicule normal est interdit." },
  { q:"Accident avec uniquement des dégâts matériels. Tu dois obligatoirement :", choices:["Appeler la police dans tous les cas","Remplir un constat amiable avec l'autre conducteur","Payer comptant si tu es en tort"], correct:1, explication:"Sans blessé : constat amiable obligatoire. La police n'est pas requise." }
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ============================================================
//  MATCHMAKING & GAME STATE
// ============================================================
let queue = [];
const rooms = {};

io.on('connection', (socket) => {
  console.log('Joueur connecté:', socket.id);

  // ── 1. Matchmaking ──
  socket.on('join_queue', (userProfile) => {
    console.log(`Joueur rejoint la file: ${socket.id}, Pseudo: ${userProfile?.pseudo}`);
    
    // Éviter les doublons
    if (queue.find(u => u.id === socket.id)) {
      console.log('Déjà dans la file !');
      return;
    }
    
    queue.push({ id: socket.id, profile: userProfile, socket: socket });
    socket.emit('queue_joined');
    console.log(`Taille de la file d'attente: ${queue.length}`);

    if (queue.length >= 2) {
      console.log('Match trouvé !');
      const p1 = queue.shift();
      const p2 = queue.shift();
      const roomId = 'room_' + p1.id + '_' + p2.id;
      
      const s1 = p1.socket;
      const s2 = p2.socket;

      if (!s1 || !s2) return; // Si l'un s'est déconnecté entre temps
      
      s1.join(roomId);
      s2.join(roomId);

      const match = {
        roomId,
        players: {
          [p1.id]: { profile: p1.profile, score: 0, wrongCurrent: false },
          [p2.id]: { profile: p2.profile, score: 0, wrongCurrent: false }
        },
        qIndex: 0,
        questions: shuffle([...QUESTIONS]).slice(0, 5), // 5 questions pour le duel
        isSuddenDeath: false,
        timeout: null
      };
      rooms[roomId] = match;

      io.to(roomId).emit('match_found', {
        p1: { id: p1.id, pseudo: p1.profile.pseudo, trophies: p1.profile.trophies || 0 },
        p2: { id: p2.id, pseudo: p2.profile.pseudo, trophies: p2.profile.trophies || 0 }
      });

      // Lancement de la première question après 3s d'intro
      setTimeout(() => sendNextQuestion(match), 3000);
    }
  });

  socket.on('leave_queue', () => {
    queue = queue.filter(u => u.id !== socket.id);
  });

  // ── 2. Envoi des questions ──
  function sendNextQuestion(match) {
    if (!rooms[match.roomId]) return; // Si la room a été supprimée (déco)

    const pIds = Object.keys(match.players);
    const s1 = match.players[pIds[0]].score;
    const s2 = match.players[pIds[1]].score;

    // Condition de fin de match (si on a fait 3 questions et pas d'égalité)
    if (match.qIndex >= match.questions.length && !match.isSuddenDeath) {
      if (s1 === s2) {
        match.isSuddenDeath = true;
      } else {
        const winnerId = s1 > s2 ? pIds[0] : pIds[1];
        io.to(match.roomId).emit('match_end', { 
          winnerId, 
          scores: { [pIds[0]]: s1, [pIds[1]]: s2 },
          isDraw: false
        });
        delete rooms[match.roomId];
        return;
      }
    }
    
    // Ajout d'une question pour la mort subite si besoin
    if (match.qIndex >= match.questions.length && match.isSuddenDeath) {
        const pool = QUESTIONS.filter(q => !match.questions.includes(q));
        if (pool.length === 0) {
            // Plus de questions dispos du tout = Égalité forcée
            io.to(match.roomId).emit('match_end', { winnerId: null, scores: { [pIds[0]]: s1, [pIds[1]]: s2 }, isDraw: true });
            delete rooms[match.roomId];
            return;
        }
        match.questions.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    const q = match.questions[match.qIndex];
    // Reset state for this question
    for (let p in match.players) match.players[p].wrongCurrent = false;

    // Mélange des choix (on envoie le texte + l'index original)
    const choicesWithOriginalIndex = q.choices.map((text, idx) => ({ text, idx }));
    const shuffledChoices = shuffle(choicesWithOriginalIndex);

    io.to(match.roomId).emit('new_question', {
      qIndex: match.qIndex,
      isSuddenDeath: match.isSuddenDeath,
      q: q.q,
      choices: shuffledChoices.map(c => ({ text: c.text, originalIdx: c.idx }))
    });

    // Timeout de 30 secondes
    match.timeout = setTimeout(() => {
      io.to(match.roomId).emit('question_timeout', { correct: q.correct, explication: q.explication });
      match.qIndex++;
      setTimeout(() => sendNextQuestion(match), 4500);
    }, 30000);
  }

  // ── 3. Réception d'une réponse ──
  socket.on('submit_answer', (answerIdx) => {
    const roomId = Array.from(socket.rooms).find(r => r.startsWith('room_'));
    if (!roomId) return;
    const match = rooms[roomId];
    if (!match) return;

    const p = match.players[socket.id];
    if (p.wrongCurrent) return; // Déjà répondu faux

    const q = match.questions[match.qIndex];
    
    if (answerIdx === q.correct) {
      clearTimeout(match.timeout);
      p.score++;
      io.to(roomId).emit('player_scored', { 
        scorerId: socket.id, 
        correct: q.correct, 
        explication: q.explication,
        scores: {
          [Object.keys(match.players)[0]]: match.players[Object.keys(match.players)[0]].score,
          [Object.keys(match.players)[1]]: match.players[Object.keys(match.players)[1]].score
        }
      });
      match.qIndex++;
      setTimeout(() => sendNextQuestion(match), 4500);
    } else {
      p.wrongCurrent = true;
      socket.emit('answer_wrong'); // Le dit uniquement au joueur qui s'est trompé
      socket.to(roomId).emit('opponent_wrong'); // Prévient l'adversaire
      
      // Si les deux se sont trompés
      const bothWrong = Object.values(match.players).every(pl => pl.wrongCurrent);
      if (bothWrong) {
        clearTimeout(match.timeout);
        io.to(roomId).emit('both_wrong', { correct: q.correct, explication: q.explication });
        match.qIndex++;
        setTimeout(() => sendNextQuestion(match), 4500);
      }
    }
  });

  // ── 4. Déconnexion (Forfait) ──
  socket.on('disconnect', () => {
    console.log('Joueur déconnecté:', socket.id);
    queue = queue.filter(u => u.id !== socket.id);

    const roomId = Object.keys(rooms).find(r => r.includes(socket.id));
    if (roomId) {
      const match = rooms[roomId];
      clearTimeout(match.timeout);
      io.to(roomId).emit('opponent_left');
      delete rooms[roomId];
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur Node.js en ligne sur http://localhost:${PORT}`);
});
