const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const INDEX_PATH = path.join(__dirname, 'index.html');

function renderPatchedIndex(_req, res) {
  fs.readFile(INDEX_PATH, 'utf8', (error, source) => {
    if (error) {
      console.error('Impossible de lire index.html :', error);
      res.status(500).send('Erreur de chargement de CodePilote.');
      return;
    }

    let html = source;

    const headInjection = [
      '<link rel="stylesheet" href="/home-refresh.css?v=3">',
      '<script src="/home-refresh-pre.js?v=3"></script>'
    ].join('\n');

    const bodyInjection = '<script src="/home-refresh.js?v=3"></script>';

    if (!html.includes('/home-refresh.css')) {
      html = html.replace(
        '<script type="module">',
        `${headInjection}\n<script type="module">`
      );
    }

    if (!html.includes('/home-refresh.js')) {
      html = html.replace('</body>', `${bodyInjection}\n</body>`);
    }

    res.type('html').send(html);
  });
}

// La route HTML passe avant express.static afin d'injecter la refonte
// sans modifier le très grand fichier index.html existant.
app.get(['/', '/index.html'], renderPatchedIndex);

// Tous les autres fichiers restent servis normalement.
app.use(express.static(__dirname, { index: false }));

// ============================================================
//  BANQUE DE QUESTIONS DUEL
// ============================================================
const QUESTIONS = [
  { q:"Sur une route à 2 voies sans marquage central, deux véhicules se croisent en sens inverse. Lequel des deux doit serrer à droite ?", choices:["Celui qui monte la pente","Les deux doivent serrer à droite","Celui qui descend la pente"], correct:1, explication:"Sur route bidirectionnelle, chaque conducteur serre à droite. Aucun n'a la priorité sur l'autre." },
  { q:"Le feu tricolore est orange fixe. Que dois-tu faire si tu peux t'arrêter sans risque ?", choices:["Accélérer pour passer avant le rouge","Freiner et t'arrêter avant la ligne","Continuer normalement"], correct:1, explication:"L'orange fixe signifie « arrêtez-vous si vous pouvez ». Forcer le passage est interdit sauf si l'arrêt est impossible." },
  { q:"En agglomération, quelle est la vitesse maximale autorisée par défaut ?", choices:["50 km/h","70 km/h","45 km/h"], correct:0, explication:"En agglomération, la limite générale est de 50 km/h, sauf signalisation différente." },
  { q:"Tu roules sur une route prioritaire. À l'intersection, tu dois :", choices:["Réduire ta vitesse par prudence tout en conservant la priorité","Céder le passage à droite","T'arrêter et attendre"], correct:0, explication:"Sur une route prioritaire, tu conserves la priorité, mais la prudence reste obligatoire." },
  { q:"Quelle distance de sécurité conserver derrière un poids lourd à 80 km/h ?", choices:["Environ 50 m","Environ 80 m","Deux longueurs de camion"], correct:1, explication:"La visibilité étant réduite, une marge d'environ trois à quatre secondes est recommandée." },
  { q:"Un feu réservé aux cyclistes les autorise à passer. En voiture, tu dois :", choices:["Tourner quand même","Attendre ton propre feu vert","Klaxonner puis passer"], correct:1, explication:"Une autorisation réservée aux cyclistes ne donne aucun droit aux véhicules motorisés." },
  { q:"Par temps de pluie sur autoroute, la vitesse maximale autorisée est généralement :", choices:["110 km/h","100 km/h","90 km/h"], correct:0, explication:"Sur autoroute, la limite est généralement abaissée à 110 km/h lorsqu'il pleut." },
  { q:"Le panneau rond à fond blanc, bord rouge et chiffre noir indique :", choices:["Une vitesse conseillée","Une vitesse minimale","Une vitesse maximale"], correct:2, explication:"Un panneau circulaire bordé de rouge indique une interdiction, ici une vitesse maximale." },
  { q:"En cas de crevaison soudaine sur autoroute, quelle est la première chose à faire ?", choices:["Freiner fortement","Tenir le volant et ralentir progressivement","Changer immédiatement de voie"], correct:1, explication:"Il faut d'abord garder le contrôle, tenir le volant et décélérer progressivement." },
  { q:"Dans un giratoire avec cédez-le-passage à l'entrée, qui est prioritaire ?", choices:["Les véhicules entrants","Les véhicules déjà engagés","Le véhicule venant de droite"], correct:1, explication:"Les véhicules déjà engagés dans le giratoire sont prioritaires." },
  { q:"Un triangle rouge contenant un vélo signifie :", choices:["Voie cyclable obligatoire","Danger lié à la présence possible de cyclistes","Interdiction de dépasser les cyclistes"], correct:1, explication:"Le triangle signale un danger et avertit de la présence possible de cyclistes." },
  { q:"Quel est le taux maximal d'alcoolémie pour un conducteur novice ?", choices:["0,5 g/L","0,2 g/L","0 g/L"], correct:1, explication:"Pour un conducteur en période probatoire, la limite est de 0,2 g/L de sang." },
  { q:"À quelle distance en amont d'un passage piéton le stationnement est-il interdit ?", choices:["5 m","10 m","2 m"], correct:0, explication:"Le stationnement est interdit dans les cinq mètres en amont d'un passage piéton." },
  { q:"Les losanges peints au sol désignent généralement :", choices:["Une zone de ralentissement","Une voie réservée","Une interdiction de dépasser"], correct:1, explication:"Les losanges signalent une voie réservée à certaines catégories d'usagers." },
  { q:"Après un accident uniquement matériel, il est recommandé de :", choices:["Appeler systématiquement la police","Remplir un constat amiable","Payer immédiatement l'autre conducteur"], correct:1, explication:"Le constat amiable permet de décrire les circonstances et les dommages pour les assurances." }
];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

// ============================================================
//  MATCHMAKING ET ÉTAT DES DUELS
// ============================================================
let queue = [];
const rooms = {};

io.on('connection', socket => {
  console.log('Joueur connecté :', socket.id);

  socket.on('join_queue', userProfile => {
    if (queue.some(player => player.id === socket.id)) return;

    queue.push({
      id: socket.id,
      profile: userProfile || {},
      socket
    });

    socket.emit('queue_joined');

    if (queue.length < 2) return;

    const playerOne = queue.shift();
    const playerTwo = queue.shift();

    if (!playerOne?.socket || !playerTwo?.socket) return;

    const roomId = `room_${playerOne.id}_${playerTwo.id}`;
    playerOne.socket.join(roomId);
    playerTwo.socket.join(roomId);

    const match = {
      roomId,
      players: {
        [playerOne.id]: {
          profile: playerOne.profile,
          score: 0,
          wrongCurrent: false
        },
        [playerTwo.id]: {
          profile: playerTwo.profile,
          score: 0,
          wrongCurrent: false
        }
      },
      qIndex: 0,
      questions: shuffle(QUESTIONS).slice(0, 5),
      isSuddenDeath: false,
      timeout: null
    };

    rooms[roomId] = match;

    io.to(roomId).emit('match_found', {
      p1: {
        id: playerOne.id,
        pseudo: playerOne.profile?.pseudo || 'Pilote 1',
        trophies: playerOne.profile?.trophies || 0
      },
      p2: {
        id: playerTwo.id,
        pseudo: playerTwo.profile?.pseudo || 'Pilote 2',
        trophies: playerTwo.profile?.trophies || 0
      }
    });

    setTimeout(() => sendNextQuestion(match), 3000);
  });

  socket.on('leave_queue', () => {
    queue = queue.filter(player => player.id !== socket.id);
  });

  function endMatch(match, winnerId, isDraw = false) {
    const playerIds = Object.keys(match.players);
    io.to(match.roomId).emit('match_end', {
      winnerId,
      scores: {
        [playerIds[0]]: match.players[playerIds[0]].score,
        [playerIds[1]]: match.players[playerIds[1]].score
      },
      isDraw
    });
    delete rooms[match.roomId];
  }

  function sendNextQuestion(match) {
    if (!rooms[match.roomId]) return;

    const playerIds = Object.keys(match.players);
    const scoreOne = match.players[playerIds[0]].score;
    const scoreTwo = match.players[playerIds[1]].score;

    if (match.qIndex >= match.questions.length && !match.isSuddenDeath) {
      if (scoreOne === scoreTwo) {
        match.isSuddenDeath = true;
      } else {
        endMatch(
          match,
          scoreOne > scoreTwo ? playerIds[0] : playerIds[1]
        );
        return;
      }
    }

    if (match.qIndex >= match.questions.length && match.isSuddenDeath) {
      const available = QUESTIONS.filter(
        question => !match.questions.includes(question)
      );

      if (available.length === 0) {
        endMatch(match, null, true);
        return;
      }

      match.questions.push(
        available[Math.floor(Math.random() * available.length)]
      );
    }

    const question = match.questions[match.qIndex];
    if (!question) {
      endMatch(match, null, true);
      return;
    }

    Object.values(match.players).forEach(player => {
      player.wrongCurrent = false;
    });

    const choices = shuffle(
      question.choices.map((text, index) => ({
        text,
        originalIdx: index
      }))
    );

    io.to(match.roomId).emit('new_question', {
      qIndex: match.qIndex,
      isSuddenDeath: match.isSuddenDeath,
      q: question.q,
      choices
    });

    match.timeout = setTimeout(() => {
      if (!rooms[match.roomId]) return;

      io.to(match.roomId).emit('question_timeout', {
        correct: question.correct,
        explication: question.explication
      });

      match.qIndex += 1;
      setTimeout(() => sendNextQuestion(match), 4500);
    }, 30000);
  }

  socket.on('submit_answer', answerIndex => {
    const roomId = [...socket.rooms].find(room => room.startsWith('room_'));
    if (!roomId) return;

    const match = rooms[roomId];
    const player = match?.players?.[socket.id];
    const question = match?.questions?.[match.qIndex];

    if (!match || !player || !question || player.wrongCurrent) return;

    if (answerIndex === question.correct) {
      clearTimeout(match.timeout);
      player.score += 1;

      const playerIds = Object.keys(match.players);

      io.to(roomId).emit('player_scored', {
        scorerId: socket.id,
        correct: question.correct,
        explication: question.explication,
        scores: {
          [playerIds[0]]: match.players[playerIds[0]].score,
          [playerIds[1]]: match.players[playerIds[1]].score
        }
      });

      match.qIndex += 1;
      setTimeout(() => sendNextQuestion(match), 4500);
      return;
    }

    player.wrongCurrent = true;
    socket.emit('answer_wrong');
    socket.to(roomId).emit('opponent_wrong');

    const bothWrong = Object.values(match.players).every(
      currentPlayer => currentPlayer.wrongCurrent
    );

    if (bothWrong) {
      clearTimeout(match.timeout);

      io.to(roomId).emit('both_wrong', {
        correct: question.correct,
        explication: question.explication
      });

      match.qIndex += 1;
      setTimeout(() => sendNextQuestion(match), 4500);
    }
  });

  socket.on('disconnect', () => {
    queue = queue.filter(player => player.id !== socket.id);

    const roomId = Object.keys(rooms).find(room => room.includes(socket.id));
    if (!roomId) return;

    const match = rooms[roomId];
    clearTimeout(match.timeout);
    io.to(roomId).emit('opponent_left');
    delete rooms[roomId];
  });
});

const PORT = Number(process.env.PORT) || 3000;

server.listen(PORT, () => {
  console.log(`CodePilote en ligne sur le port ${PORT}`);
});
