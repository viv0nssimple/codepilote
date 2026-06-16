
    import { initializeApp }            from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword,
             signInWithEmailAndPassword, signOut,
             onAuthStateChanged }       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    import { getFirestore, doc, setDoc, getDoc, getDocs,
             collection, query, orderBy,
             limit, onSnapshot, where, addDoc, deleteDoc, updateDoc, serverTimestamp }        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

    // 🔑 CONFIG FIREBASE
    const firebaseConfig = {
      apiKey:            "AIzaSyB6NrVAg0ehOpCpMJxAd1PES_9G14oy-94",
      authDomain:        "superpilot-73a32.firebaseapp.com",
      projectId:         "superpilot-73a32",
      storageBucket:     "superpilot-73a32.firebasestorage.app",
      messagingSenderId: "553371049637",
      appId:             "1:553371049637:web:39fa0302c0e0932c04374c"
    };

    const app  = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db   = getFirestore(app);

    // ============================================================
    //  SONS (Web Audio API)
    // ============================================================
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    window.playSound = function(type) {
      if(audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      if(type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      } else if(type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
      } else if(type === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
      } else if(type === 'win') {
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g); g.connect(audioCtx.destination);
          o.type = 'triangle';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0, now + i*0.1);
          g.gain.linearRampToValueAtTime(0.2, now + i*0.1 + 0.05);
          g.gain.exponentialRampToValueAtTime(0.01, now + i*0.1 + 0.4);
          o.start(now + i*0.1); o.stop(now + i*0.1 + 0.4);
        });
      }
    };

    // ============================================================
    //  QUESTIONS
    // ============================================================
    import { QUESTIONS } from "../questions.js";
    import { generateSeries } from "../randomizer.js";

    const LEVELS = [
      { min:0,    label:"Apprenti",      emoji:"🚥" },
      { min:100,  label:"Stagiaire",     emoji:"🛣️"  },
      { min:300,  label:"Conducteur",    emoji:"🚗" },
      { min:600,  label:"As du volant",  emoji:"🏎️"  },
      { min:1100, label:"Expert Code",   emoji:"🏆" },
      { min:2000, label:"Légende",       emoji:"⭐" },
    ];

    // ============================================================
    //  NIVEAUX (XP global, cumulatif)
    // ============================================================
    

    const BADGES = [
      { id:"premier_pas", emoji:"🎓", label:"Premier Pas",   desc:"Terminer ta première partie" },
      { id:"sans_faute",  emoji:"⚡", label:"Sans Faute !",  desc:"Terminer une partie sans aucune erreur" },
      { id:"serie_feu",   emoji:"🔥", label:"Série de Feu",  desc:"Série de 5 bonnes réponses" },
      { id:"regulier",    emoji:"📅", label:"Régulier",      desc:"Jouer 3 jours d'affilée" },
      { id:"expert",      emoji:"🏆", label:"Expert Code",   desc:"Dépasser 15 points en une partie" },
    ];

    const LESSONS = [
      { emoji:"🚦", title:"Les Priorités", points:[
        "<strong>Priorité à droite</strong> : sur les routes sans panneau, le véhicule venant de ta droite passe en premier",
        "<strong>Giratoire</strong> : les véhicules déjà DEDANS ont la priorité sur ceux qui entrent",
        "<strong>STOP</strong> : arrêt obligatoire, même s'il n'y a personne",
        "<strong>Route prioritaire</strong> : tu ne cèdes pas aux intersections"
      ]},
      { emoji:"🚀", title:"Les Vitesses Limites", points:[
        "<strong>Agglomération</strong> : 50 km/h par défaut",
        "<strong>Route nationale hors agglo</strong> : 80 km/h",
        "<strong>Voie express (2×2 voies)</strong> : 110 km/h",
        "<strong>Autoroute</strong> : 130 km/h — réduit à 110 km/h par temps de pluie"
      ]}
    ];

    // ============================================================
    //  STATE
    // ============================================================
    let currentUser  = null;
    let userProfile  = null;
    let unsubLB      = null;
    let unsubLBTournament = null;
    let currentLesson = 0;
    let gameState = { currentIndex:0, score:0, streak:0, bestStreak:0, correctCount:0, wrongCount:0, answered:false, questions:[] };
    let prevLevelIndex = 0;

    const shuffle = arr => [...arr].sort(() => Math.random() - .5);
    const $  = id => document.getElementById(id);

    function getLevel(xp) {
      let lv = LEVELS[0];
      for (const l of LEVELS) if (xp >= l.min) lv = l;
      return lv;
    }
    function getNextLevel(xp) {
      for (const l of LEVELS) if (xp < l.min) return l;
      return null;
    }
    function showScreen(name) {
      ['screen-auth','screen-onboarding','screen-home','screen-game','screen-leaderboard','screen-lobby','screen-duel','screen-duel-results', 'screen-tournament', 'screen-social', 'screen-ecurie'].forEach(s => {
        const el = $(s);
        if (s === name) {
          el.style.display = 'block';
          el.style.animation = 'none'; void el.offsetWidth;
          el.style.animation = 'screenEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        } else {
          el.style.display = 'none';
        }
      });
    }

    // Global Loader
    window.addEventListener('load', () => {
      setTimeout(() => {
        $('global-loader').style.opacity = '0';
        $('global-loader').style.visibility = 'hidden';
      }, 1200);
    });

    // ============================================================
    //  AUTH STATE
    // ============================================================
    onAuthStateChanged(auth, async user => {
      if (user) {
        currentUser = user;
        await loadProfile();
        updateHeader();
        if (!userProfile?.onboardingDone) {
          currentLesson = 0;
          renderLesson(0);
          showScreen('screen-onboarding');
        } else {
          showScreen('screen-home');
        }
      } else {
        currentUser = null;
        userProfile = null;
        updateHeader();
        showScreen('screen-auth');
      }
    });

    async function loadProfile() {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (!snap.exists()) {
        console.warn("Profil Firestore manquant, création automatique...");
        const defaultProfile = { 
          pseudo: currentUser.email ? currentUser.email.split('@')[0] : 'Joueur', 
          xp: 0, level: 1, trophies: 0, coins: 100, onboardingDone: true, ecurieId: null 
        };
        await setDoc(doc(db, 'users', currentUser.uid), defaultProfile);
        userProfile = defaultProfile;
      } else {
        userProfile = snap.data();
        if (userProfile.coins === undefined) {
          // Retrocompatibilité
          await updateDoc(doc(db, 'users', currentUser.uid), { coins: 100 });
          userProfile.coins = 100;
        }
      }
    }

    function updateHeader() {
      if (currentUser && userProfile) {
        $('header-user').textContent = `👤 ${userProfile.pseudo}`;
        $('header-user').style.display    = 'inline-flex';
        $('btn-header-ecurie').style.display = 'inline-flex';
        $('btn-logout').style.display     = 'inline-flex';
        $('header-xp-wrap').style.display = 'flex';

        const xp   = userProfile.xp || 0;
        const lv   = getLevel(xp);
        const next = getNextLevel(xp);
        $('header-level-label').textContent = lv.emoji + ' ' + lv.label;
        if (next) {
          const pct = Math.min(100, ((xp - lv.min) / (next.min - lv.min)) * 100);
          $('header-xp-fill').style.width  = pct + '%';
          $('header-xp-txt').textContent   = `${xp} / ${next.min} XP`;
        } else {
          $('header-xp-fill').style.width  = '100%';
          $('header-xp-txt').textContent   = `${xp} XP — MAX`;
        }
        const ds = userProfile.dailyStreak || 0;
        $('header-daily').textContent = ds >= 2 ? `🔥 ${ds} jours` : '';
        $('header-daily').style.display = ds >= 2 ? 'block' : 'none';
        $('header-trophies').textContent = `🏆 ${userProfile.trophies || 0}`;
        $('header-coins').textContent = `🪙 ${userProfile.coins || 0}`;
      } else {
        $('header-user').style.display    = 'none';
        $('btn-header-ecurie').style.display = 'none';
        $('btn-logout').style.display     = 'none';
        $('header-xp-wrap').style.display = 'none';
        $('header-daily').style.display   = 'none';
        $('header-trophies').textContent  = '';
        $('header-coins').textContent     = '';
      }
    }

    // ============================================================
    //  HOME ACTIONS
    // ============================================================
    $('btn-home-solo').addEventListener('click', () => {
      gameState.questions = generateSeries([...QUESTIONS], 15);
      showScreen('screen-game');
      startGame();
    });

    $('btn-home-duel').addEventListener('click', () => {
      playSound('tick');
      showScreen('screen-lobby');
      if (!socket) socket = io();
      socket.emit('join_queue', userProfile);
    });

    $('btn-home-tournament').addEventListener('click', () => {
      playSound('tick');
      showScreen('screen-tournament');
      startTournament();
    });

    $('btn-home-social').addEventListener('click', () => {
      playSound('tick');
      showScreen('screen-social');
      loadSocialData();
    });

    $('btn-home-ecurie').addEventListener('click', () => {
      playSound('tick');
      showScreen('screen-ecurie');
      loadEcurieData();
    });

    $('btn-back-home-ecurie').addEventListener('click', () => {
      playSound('tick');
      if (unsubEcurie) { unsubEcurie(); unsubEcurie = null; }
      if (unsubEcurieMembers) { unsubEcurieMembers(); unsubEcurieMembers = null; }
      showScreen('screen-home');
    });

    $('btn-header-ecurie').addEventListener('click', () => {
      if (currentUser && userProfile && userProfile.onboardingDone) {
        playSound('tick');
        showScreen('screen-ecurie');
        loadEcurieData();
      }
    });

    $('header-logo').addEventListener('click', () => {
      if (currentUser && userProfile && userProfile.onboardingDone) {
        playSound('tick');
        showScreen('screen-home');
      }
    });

    // ============================================================
    //  AUTH FORMS
    // ============================================================
    $('form-signup').addEventListener('submit', async e => {
      e.preventDefault();
      const pseudo = $('su-pseudo').value.trim();
      const email  = $('su-email').value.trim();
      const pwd    = $('su-pwd').value;
      const pwd2   = $('su-pwd2').value;
      clearAuthError();
      if (pseudo.length < 2)   return showAuthError("Le pseudo doit faire au moins 2 caractères.");
      if (pwd !== pwd2)        return showAuthError("Les mots de passe ne correspondent pas.");
      if (pwd.length < 6)      return showAuthError("Mot de passe trop court (6 caractères min).");
      setAuthLoading(true);
      try {
        // Vérification de l'unicité du pseudo
        const pseudoLower = pseudo.toLowerCase();
        const pseudoDoc = await getDoc(doc(db, 'pseudos', pseudoLower));
        if (pseudoDoc.exists()) {
          setAuthLoading(false);
          return showAuthError("Ce pseudo est déjà pris. Choisis-en un autre !");
        }

        const cred = await createUserWithEmailAndPassword(auth, email, pwd);
        await setDoc(doc(db, 'users', cred.user.uid), {
          pseudo, email,
          bestScore:0, totalGames:0, bestStreak:0,
          xp:0, dailyStreak:0, lastPlayedDate:'',
          badges:[], onboardingDone:false, trophies: 0, coins: 100, lastPlayed: new Date()
        });

        // Réservation du pseudo
        await setDoc(doc(db, 'pseudos', pseudoLower), { uid: cred.user.uid });

      } catch(err) { setAuthLoading(false); showAuthError(err.message); }
    });

    $('form-signin').addEventListener('submit', async e => {
      e.preventDefault();
      clearAuthError(); setAuthLoading(true);
      try { await signInWithEmailAndPassword(auth, $('si-email').value.trim(), $('si-pwd').value); }
      catch(err) { setAuthLoading(false); showAuthError("Erreur de connexion."); }
    });

    $('btn-logout').addEventListener('click', async () => {
      if (unsubLB) { unsubLB(); unsubLB = null; }
      if (unsubLBTournament) { unsubLBTournament(); unsubLBTournament = null; }
      await signOut(auth);
    });
    $('toggle-to-signup').addEventListener('click', () => {
      clearAuthError();
      $('form-signin').style.display = 'none'; $('form-signup').style.display = 'flex';
      $('auth-tab-signin').classList.remove('active'); $('auth-tab-signup').classList.add('active');
    });
    $('toggle-to-signin').addEventListener('click', () => {
      clearAuthError();
      $('form-signup').style.display = 'none'; $('form-signin').style.display = 'flex';
      $('auth-tab-signup').classList.remove('active'); $('auth-tab-signin').classList.add('active');
    });
    $('auth-tab-signin').addEventListener('click', () => $('toggle-to-signin').click());
    $('auth-tab-signup').addEventListener('click', () => $('toggle-to-signup').click());

    function showAuthError(m) { $('auth-error').textContent = m; $('auth-error').style.display = 'block'; }
    function clearAuthError()  { $('auth-error').textContent = ''; $('auth-error').style.display = 'none'; }
    function setAuthLoading(v) { $('btn-signin').disabled = $('btn-signup').disabled = v; }

    // ============================================================
    //  ONBOARDING
    // ============================================================
    function renderLesson(idx) {
      const l = LESSONS[idx];
      $('lesson-emoji').textContent = l.emoji;
      $('lesson-title').textContent = l.title;
      $('lesson-points').innerHTML  = l.points.map(p => `<li>${p}</li>`).join('');
      $('lesson-counter').textContent = `${idx+1} / ${LESSONS.length}`;
      $('lesson-dots').innerHTML = LESSONS.map((_,i) =>
        `<div class="l-dot ${i===idx?'active':i<idx?'done':''}"></div>`).join('');
      $('lesson-next-btn').textContent = idx === LESSONS.length-1 ? '🚀 Commencer l\'aventure !' : 'Leçon suivante →';
      const card = $('lesson-card');
      card.style.animation = 'none'; void card.offsetWidth;
      card.style.animation = 'cardIn .5s cubic-bezier(.34,1.56,.64,1)';
    }

    $('lesson-next-btn').addEventListener('click', async () => {
      playSound('tick');
      if (currentLesson < LESSONS.length - 1) {
        currentLesson++;
        renderLesson(currentLesson);
      } else {
        if (currentUser) await setDoc(doc(db,'users',currentUser.uid), {onboardingDone:true}, {merge:true});
        if (userProfile) userProfile.onboardingDone = true;
        showScreen('screen-home');
      }
    });

    // ============================================================
    //  LEADERBOARD
    // ============================================================
    $('btn-leaderboard').addEventListener('click', () => { 
      showScreen('screen-leaderboard'); 
      subscribeLeaderboard(); 
      switchLBTab('general');
    });
    $('btn-back-home-lb').addEventListener('click', () => { 
      if(unsubLB) unsubLB(); 
      if(unsubLBTournament) unsubLBTournament(); 
      showScreen('screen-home'); 
    });

    $('tab-lb-general').addEventListener('click', () => switchLBTab('general'));
    $('tab-lb-tournament').addEventListener('click', () => switchLBTab('tournament'));

    function switchLBTab(tab) {
      $('tab-lb-general').classList.remove('active');
      $('tab-lb-tournament').classList.remove('active');
      $('tab-lb-' + tab).classList.add('active');

      if (tab === 'general') {
        $('lb-table-general').style.display = 'table';
        $('lb-table-tournament').style.display = 'none';
        subscribeLeaderboard();
      } else {
        $('lb-table-general').style.display = 'none';
        $('lb-table-tournament').style.display = 'table';
        subscribeLeaderboardTournament();
      }
    }

    function subscribeLeaderboard() {
      if (unsubLB) return;
      unsubLB = onSnapshot(query(collection(db,'users'), orderBy('trophies','desc'), orderBy('bestScore','desc'), limit(15)), snap => {
        const tbody = $('lb-body');
        tbody.innerHTML = '';
        const medals = ['🥇','🥈','🥉'];
        snap.docs.forEach((d, i) => {
          const data = d.data();
          const isMe = currentUser && d.id === currentUser.uid;
          const lv   = getLevel(data.xp || 0);
          const tr   = document.createElement('tr');
          if (isMe) tr.classList.add('lb-me');
          tr.innerHTML = `
            <td class="lb-rank">${medals[i]||'#'+(i+1)}</td>
            <td class="lb-pseudo">${esc(data.pseudo)}${isMe?' <span class="lb-you">Toi</span>':''}<br><small style="color:var(--muted)">${lv.emoji} ${lv.label}</small></td>
            <td class="lb-score">🏆 ${data.trophies??0}</td>
            <td style="color:var(--muted);font-size:.85rem">${data.bestScore??0} pts</td>`;
          tbody.appendChild(tr);
        });
        if (!snap.docs.length) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px">Aucun score encore.</td></tr>';
      });
    }

    function subscribeLeaderboardTournament() {
      if (unsubLBTournament) return;
      const today = new Date().toISOString().split('T')[0];
      unsubLBTournament = onSnapshot(query(collection(db,'users'), 
        orderBy('tournamentDailyScore','desc'), limit(15)), snap => {
        const tbody = $('lb-body-tournament');
        tbody.innerHTML = '';
        const medals = ['🥇','🥈','🥉'];
        snap.docs.forEach((d, i) => {
          const data = d.data();
          if (data.tournamentDate !== today) return; // Sécurité si le where échoue
          const isMe = currentUser && d.id === currentUser.uid;
          const tr   = document.createElement('tr');
          if (isMe) tr.classList.add('lb-me');
          tr.innerHTML = `
            <td class="lb-rank">${medals[i]||'#'+(i+1)}</td>
            <td class="lb-pseudo">${esc(data.pseudo)}${isMe?' <span class="lb-you">Toi</span>':''}</td>
            <td class="lb-score" style="color:var(--green)">${data.tournamentDailyScore % 1000} / 10</td>
            <td style="color:var(--muted);font-size:.85rem">⏳ ${data.tournamentTimeRemaining}s</td>`;
          tbody.appendChild(tr);
        });
        if (!tbody.innerHTML) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px">Aucun participant aujourd\'hui. Sois le premier !</td></tr>';
      }, err => {
        console.error(err);
        $('lb-body-tournament').innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--red);padding:24px">Erreur de chargement du classement.</td></tr>';
      });
    }
    const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // ============================================================
    //  SAVE SCORE (XP + streak + badges)
    // ============================================================
    async function saveScore(score, correctCount, bestStreakGame) {
      if (!currentUser) return null;
      if (score > 0) addEcuriePoints(score);

      const ref  = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(ref);
      const prev = snap.exists() ? snap.data() : {};

      let xpGained = score * 10;
      if (correctCount === QUESTIONS.length) xpGained += 50;
      if (bestStreakGame >= 5) xpGained += 20;
      const newXP = (prev.xp || 0) + xpGained;
      const newCoins = (prev.coins || 0) + correctCount;

      const today     = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now()-86400000).toISOString().split('T')[0];
      const lastDate  = prev.lastPlayedDate || '';
      let dailyStreak = prev.dailyStreak || 0;
      if      (lastDate === today)     { /* same day */ }
      else if (lastDate === yesterday) { dailyStreak++; }
      else                             { dailyStreak = 1; }

      const prevBadges = prev.badges || [];
      const newBadges  = [...prevBadges];
      const earn = id => { if (!newBadges.includes(id)) newBadges.push(id); };
      if (!prev.totalGames || prev.totalGames === 0) earn('premier_pas');
      if (correctCount === QUESTIONS.length)          earn('sans_faute');
      if (bestStreakGame >= 5)                        earn('serie_feu');
      if (dailyStreak >= 3)                           earn('regulier');
      if (score > 15)                                 earn('expert');
      const earnedNew = newBadges.filter(b => !prevBadges.includes(b));

      await setDoc(ref, {
        pseudo:         prev.pseudo ?? 'Anonyme',
        email:          currentUser.email,
        bestScore:      Math.max(score, prev.bestScore || 0),
        bestStreak:     Math.max(bestStreakGame, prev.bestStreak || 0),
        totalGames:     (prev.totalGames || 0) + 1,
        xp:             newXP,
        coins:          newCoins,
        dailyStreak,
        lastPlayedDate: today,
        badges:         newBadges,
        onboardingDone: true,
        lastPlayed:     new Date()
      }, { merge:true });

      await loadProfile();
      updateHeader();
      
      return { xpGained, earnedNew, dailyStreak };
    }

    async function addEcuriePoints(points) {
      if (!userProfile || !userProfile.ecurieId || points <= 0) return;
      try {
        const eId = userProfile.ecurieId;
        const eRef = doc(db, 'ecuries', eId);
        const mRef = doc(db, `ecuries/${eId}/members`, currentUser.uid);
        
        // On récupère d'abord les anciennes valeurs
        const [eSnap, mSnap] = await Promise.all([getDoc(eRef), getDoc(mRef)]);
        
        if (eSnap.exists() && mSnap.exists()) {
          const eData = eSnap.data();
          const mData = mSnap.data();
          
          await updateDoc(eRef, { weeklyPoints: (eData.weeklyPoints || 0) + points });
          await updateDoc(mRef, { weeklyContribution: (mData.weeklyContribution || 0) + points });
        }
      } catch (e) {
        console.error("Erreur ajout points écurie:", e);
      }
    }

    // ============================================================
    //  SOLO GAME ENGINE
    // ============================================================
    $('btn-back-home-game').addEventListener('click', () => showScreen('screen-home'));
    
    function startGame() {
      gameState.currentIndex = 0;
      gameState.score = 0;
      gameState.streak = 0;
      gameState.bestStreak = 0;
      gameState.correctCount = 0;
      gameState.wrongCount = 0;
      gameState.answered = false;
      prevLevelIndex = LEVELS.indexOf(getLevel(userProfile?.xp || 0));
      $('results-screen').style.display = 'none';
      $('question-card').style.display  = 'block';
      showQuestion();
    }

    function showQuestion() {
      gameState.answered = false;
      const q    = gameState.questions[gameState.currentIndex];
      const card = $('question-card');
      card.style.animation = 'none'; void card.offsetWidth;
      card.style.animation = 'cardIn .5s cubic-bezier(.34,1.56,.64,1)';
      
      if (q.Image) {
        $('question-img').src = q.Image.src;
        $('question-img').alt = q.Image.alt || "Image de situation de conduite";
        $('question-img').style.display = 'block';
        $('btn-credits').style.display = 'block';
        $('btn-credits').onclick = () => {
          const p = $('credits-popup');
          p.style.display = p.style.display === 'block' ? 'none' : 'block';
          p.innerHTML = `<strong>Auteur:</strong> ${q.Image.auteur}<br><strong>Licence:</strong> ${q.Image.licence}`;
        };
      } else {
        $('question-img').style.display = 'none';
        $('btn-credits').style.display = 'none';
        $('credits-popup').style.display = 'none';
      }

      $('question-text').textContent = q.q;
      $('feedback').style.display    = 'none';
      $('next-btn').style.display    = 'none';
      const div = $('answers'); div.innerHTML = '';
      shuffle(q.choices.map((text,idx) => ({text,idx}))).forEach(({text,idx}) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn'; btn.textContent = text; btn.dataset.index = idx;
        btn.addEventListener('click', () => handleAnswer(btn, q, idx));
        div.appendChild(btn);
      });
      updateGameUI();
    }

    function handleAnswer(btn, q, idx) {
      if (gameState.answered) return;
      gameState.answered = true;
      const ok = idx === q.correct;
      
      document.querySelectorAll('.answer-btn').forEach(b => {
        b.disabled = true;
        if (parseInt(b.dataset.index) === q.correct) b.classList.add('correct');
      });
      if (!ok) btn.classList.add('wrong');

      if (ok) {
        playSound('correct');
        const bonus = Math.floor(gameState.streak / 3);
        const pts   = 1 + bonus;
        gameState.score += pts; gameState.streak++;
        gameState.bestStreak = Math.max(gameState.bestStreak, gameState.streak);
        gameState.correctCount++;
        showPopup(`+${pts}`, 'var(--green)');
        if (gameState.streak % 3 === 0) showToast(`🔥 Série x${gameState.streak} !`, 'var(--accent2)');
      } else {
        playSound('wrong');
        gameState.score = Math.max(0, gameState.score - 1);
        gameState.streak = 0; gameState.wrongCount++;
        showPopup('-1', 'var(--red)');
      }

      const fb = $('feedback');
      fb.className = ok ? 'correct' : 'wrong';
      fb.innerHTML = `
        <div style="margin-bottom: 10px;">${ok ? '<span class="icon">✅</span> <b>Bonne réponse !</b>' : '<span class="icon">❌</span> <b>Mauvaise réponse.</b>'}</div>
        <div style="background:var(--surface); padding:12px; border-radius:8px; margin-bottom:10px;">
          <strong style="color:var(--accent);">Explication :</strong> ${q.explication}
        </div>
        ${q.analyse_risque ? `<div style="margin-bottom:10px;"><strong style="color:var(--red);">⚠️ Danger principal :</strong> ${q.analyse_risque}</div>` : ''}
        ${q.source_juridique ? `<div style="font-size:0.85rem; color:var(--muted);"><strong style="color:var(--green);">📖 Référence Légifrance :</strong> ${q.source_juridique}</div>` : ''}
      `;
      fb.style.display = 'block';
      updateGameUI();
      $('next-btn').style.display = 'block';
    }

    function updateGameUI() {
      $('score-val').textContent    = gameState.score;
      $('streak-val').textContent   = gameState.streak;
      $('progress-fill').style.width = ((gameState.currentIndex / gameState.questions.length) * 100) + '%';
      $('question-number').textContent = `Question ${gameState.currentIndex+1} / ${gameState.questions.length}`;
    }

    $('next-btn').addEventListener('click', () => {
      playSound('tick');
      gameState.currentIndex++;
      if (gameState.currentIndex >= gameState.questions.length) showResults();
      else showQuestion();
    });

    async function showResults() {
      $('question-card').style.display  = 'none';
      $('results-screen').style.display = 'block';
      $('progress-fill').style.width    = '100%';
      $('badges-section').innerHTML     = '';
      $('xp-gained-wrap').style.display = 'none';
      const pct = gameState.correctCount / gameState.questions.length;
      let trophy = '🥉', title = 'Bien essayé !';
      if      (pct >= .9) { trophy = '🏆'; title = 'Excellent !'; playSound('win'); confetti({particleCount: 150, spread: 80}); }
      else if (pct >= .7) { trophy = '🥇'; title = 'Très bien !'; playSound('win'); confetti({particleCount: 80, spread: 60}); }
      
      $('question-card').style.display = 'none';
      $('results-screen').style.display = 'block';
      $('final-score').textContent = gameState.score;
      $('r-correct').textContent = gameState.score;
      $('r-wrong').textContent = gameState.questions.length - gameState.score;
      $('save-status').textContent = '';

      if (activeChallengeId) {
        finishChallenge();
        return;
      }

      $('progress-fill').style.width    = '100%';
      $('badges-section').innerHTML     = '';
      $('xp-gained-wrap').style.display = 'none';

      $('trophy-icon').textContent  = trophy;
      $('result-title').textContent = title;
      $('final-score').textContent  = gameState.score;
      $('r-correct').textContent    = gameState.correctCount;
      $('r-wrong').textContent      = gameState.wrongCount;
      $('r-streak').textContent     = gameState.bestStreak;

      $('save-status').textContent   = '⏳ Sauvegarde…';
      $('save-status').style.display = 'block';

      const result = await saveScore(gameState.score, gameState.correctCount, gameState.bestStreak);
      if (result) {
        $('save-status').textContent = '✅ Sauvegardé !';
        setTimeout(() => $('save-status').style.display = 'none', 2500);

        $('xp-gained-val').textContent = `+${result.xpGained} XP`;
        $('xp-gained-wrap').style.display = 'flex';

        if (result.dailyStreak >= 2) showToast(`📅 ${result.dailyStreak} jours d'affilée !`, 'var(--yellow)');
        if (result.earnedNew.length) renderNewBadges(result.earnedNew);

        const newXP  = userProfile?.xp || 0;
        const newLvIdx = LEVELS.indexOf(getLevel(newXP));
        if (newLvIdx > prevLevelIndex) {
          prevLevelIndex = newLvIdx;
          const lv = LEVELS[newLvIdx];
          $('lv-emoji').textContent = lv.emoji;
          $('lv-text').textContent  = '🎉 Niveau : ' + lv.label;
          const badge = $('level-badge');
          badge.className = ''; void badge.offsetWidth; badge.className = 'show';
          playSound('win');
          confetti({particleCount: 200, spread: 120, origin: {y: 0.6}});
          setTimeout(() => badge.className = '', 2600);
        }
      }
    }

    function renderNewBadges(ids) {
      const section = $('badges-section');
      section.innerHTML = '<div class="badges-title">🎖️ Nouveaux badges !</div>';
      ids.forEach(id => {
        const def = BADGES.find(b => b.id === id);
        if (!def) return;
        const el = document.createElement('div');
        el.className = 'badge-item';
        el.innerHTML = `<span class="badge-emoji">${def.emoji}</span><div><div class="badge-name">${def.label}</div><div class="badge-desc">${def.desc}</div></div>`;
        section.appendChild(el);
      });
    }

    function showPopup(text, color) {
      const el = document.createElement('div');
      el.className = 'score-popup'; el.textContent = text; el.style.color = color;
      el.style.left = 'calc(50% - 30px)'; el.style.top = 'calc(50% - 60px)';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }

    function showToast(text, color = 'var(--accent2)') {
      const el = document.createElement('div');
      el.className = 'game-toast'; el.textContent = text;
      el.style.setProperty('--tc', color);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }

    $('restart-btn').addEventListener('click', () => { playSound('tick'); startGame(); });
    $('btn-back-home-res').addEventListener('click', () => { showScreen('screen-home'); });

    // ============================================================
    //  SOCKET.IO - MODE DUEL
    // ============================================================
    let socket = null;
    let duelOpponent = null;

    $('btn-cancel-duel').addEventListener('click', () => {
      playSound('tick');
      if (socket) socket.emit('leave_queue');
      showScreen('screen-home');
    });

    $('btn-duel-back').addEventListener('click', () => {
      playSound('tick');
      showScreen('screen-home');
    });

    const io_init = () => {
      if (!socket) socket = io();

      socket.on('match_found', (data) => {
        playSound('win');
        duelOpponent = (data.p1.id === socket.id) ? data.p2 : data.p1;
        $('dp1-score').textContent = "0";
        $('dp2-score').textContent = "0";
        $('dp2-name').textContent = duelOpponent.pseudo;
        showScreen('screen-duel');
        showToast('Adversaire trouvé ! Prépare-toi...', 'var(--green)');
      });

      socket.on('new_question', (data) => {
        $('duel-q-index').textContent = data.isSuddenDeath ? "☠️ Mort Subite !" : `Question ${data.qIndex + 1} / 5`;
        $('duel-q-index').className = data.isSuddenDeath ? 'duel-anim-sd' : '';
        $('duel-q-text').textContent = data.q;
        $('duel-feedback').style.display = 'none';

        const div = $('duel-answers'); div.innerHTML = '';
        data.choices.forEach((c) => {
          const btn = document.createElement('button');
          btn.className = 'answer-btn'; btn.textContent = c.text; btn.dataset.index = c.originalIdx;
          btn.addEventListener('click', () => {
            playSound('tick');
            btn.style.opacity = '0.5';
            socket.emit('submit_answer', c.originalIdx);
          });
          div.appendChild(btn);
        });

        $('duel-timer-fill').style.transition = 'none';
        $('duel-timer-fill').style.width = '100%';
        setTimeout(() => {
          $('duel-timer-fill').style.transition = 'width 30s linear';
          $('duel-timer-fill').style.width = '0%';
        }, 50);
      });

      socket.on('player_scored', (data) => {
        $('duel-timer-fill').style.width = $('duel-timer-fill').style.width; // freeze timer
        $('duel-timer-fill').style.transition = 'none';
        
        const isMe = data.scorerId === socket.id;
        if (isMe) playSound('correct'); else playSound('wrong');

        $('duel-feedback').style.display = 'block';
        $('duel-feedback').className = isMe ? 'correct' : 'wrong';
        $('duel-feedback').innerHTML = isMe ? `<span class="icon">✅</span>Bien joué ! +1 point` : `<span class="icon">❌</span>Trop lent ! L'adversaire a trouvé.`;
        
        document.querySelectorAll('#duel-answers .answer-btn').forEach(b => {
          b.disabled = true;
          if (parseInt(b.dataset.index) === data.correct) b.classList.add('correct');
        });

        const myScore = data.scores[socket.id];
        const opScore = data.scores[Object.keys(data.scores).find(id => id !== socket.id)];
        $('dp1-score').textContent = myScore;
        $('dp2-score').textContent = opScore;
      });

      socket.on('answer_wrong', () => {
        playSound('wrong');
        showToast('❌ Faux !', 'var(--red)');
      });
      
      socket.on('opponent_wrong', () => {
        playSound('tick');
        showToast('👀 Ton adversaire s\'est trompé, prends ton temps !', 'var(--yellow)');
      });

      socket.on('both_wrong', (data) => {
        playSound('wrong');
        $('duel-timer-fill').style.transition = 'none';
        $('duel-feedback').style.display = 'block';
        $('duel-feedback').className = 'wrong';
        $('duel-feedback').innerHTML = `<span class="icon">❌</span>Vous avez tous les deux eu faux !`;
        document.querySelectorAll('#duel-answers .answer-btn').forEach(b => {
          b.disabled = true;
          if (parseInt(b.dataset.index) === data.correct) b.classList.add('correct');
        });
      });

      socket.on('question_timeout', (data) => {
        playSound('wrong');
        $('duel-feedback').style.display = 'block';
        $('duel-feedback').className = 'wrong';
        $('duel-feedback').innerHTML = `⏱️ Temps écoulé !`;
        document.querySelectorAll('#duel-answers .answer-btn').forEach(b => {
          b.disabled = true;
          if (parseInt(b.dataset.index) === data.correct) b.classList.add('correct');
        });
      });

      socket.on('match_end', async (data) => {
        const isDraw = data.isDraw;
        const isWinner = data.winnerId === socket.id;
        
        if (isWinner) { playSound('win'); confetti({particleCount: 200, spread: 100}); }
        else playSound('wrong');

        $('dr-icon').textContent = isWinner ? '🏆' : (isDraw ? '🤝' : '💔');
        $('dr-title').textContent = isWinner ? 'Victoire !' : (isDraw ? 'Égalité !' : 'Défaite...');
        $('dr-desc').textContent = isDraw ? `Tu as fait match nul avec ${duelOpponent.pseudo}` : 
                                  (isWinner ? `Tu as battu ${duelOpponent.pseudo}` : `${duelOpponent.pseudo} t'a battu`);
        
        let trophiesChange = 0;
        if (isWinner) trophiesChange = 10;
        else if (!isDraw) trophiesChange = Math.max(-5, -(userProfile?.trophies || 0));

        if (trophiesChange > 0) $('dr-trophies').textContent = `+${trophiesChange} 🏆`;
        else if (trophiesChange < 0) $('dr-trophies').textContent = `${trophiesChange} 🏆`;
        else $('dr-trophies').textContent = `+0 🏆`;
        $('dr-trophies').style.color = isWinner ? 'var(--yellow)' : (isDraw ? 'var(--muted)' : 'var(--red)');

        showScreen('screen-duel-results');
        
        const myScore = data.scores[socket.id] || 0;
        if (myScore > 0) addEcuriePoints(myScore);

        if (currentUser && (trophiesChange !== 0 || myScore > 0)) {
          const newTrophies = (userProfile.trophies || 0) + trophiesChange;
          const newCoins = (userProfile.coins || 0) + myScore;
          await setDoc(doc(db, 'users', currentUser.uid), { trophies: newTrophies, coins: newCoins }, { merge: true });
          userProfile.trophies = newTrophies;
          userProfile.coins = newCoins;
          updateHeader();
        }
      });

      socket.on('opponent_left', async () => {
        playSound('win'); confetti();
        showToast('L\'adversaire a fui... Victoire par forfait !', 'var(--green)');
        $('dr-icon').textContent = '🏃';
        $('dr-title').textContent = 'Victoire par forfait';
        $('dr-desc').textContent = `${duelOpponent.pseudo} s'est déconnecté.`;
        $('dr-trophies').textContent = '+5 🏆';
        $('dr-trophies').style.color = 'var(--yellow)';
        showScreen('screen-duel-results');

        if (currentUser) {
          const newTrophies = (userProfile.trophies || 0) + 5;
          await setDoc(doc(db, 'users', currentUser.uid), { trophies: newTrophies }, { merge: true });
          userProfile.trophies = newTrophies;
          updateHeader();
        }
      });
    };
    
    onAuthStateChanged(auth, user => {
      if (user) io_init();
    });

    // ============================================================
    //  TOURNAI DU JOUR
    // ============================================================
    let tournoiState = { currentIndex:0, score:0, timeRemaining: 60, interval:null, questions:[] };

    $('btn-back-home-tournoi').addEventListener('click', () => {
      clearInterval(tournoiState.interval);
      showScreen('screen-home');
    });

    function startTournament() {
      // Setup tournament state
      tournoiState.questions = generateSeries([...QUESTIONS], 10);
      tournoiState.currentIndex = 0;
      tournoiState.score = 0;
      tournoiState.timeRemaining = 60; // 60 seconds
      
      $('t-score').textContent = "0";
      $('t-timer').textContent = "60s";
      $('t-timer').style.color = "var(--text)";
      $('t-results').style.display = 'none';
      $('t-question-card').style.display = 'block';

      showTournamentQuestion();

      clearInterval(tournoiState.interval);
      tournoiState.interval = setInterval(() => {
        tournoiState.timeRemaining--;
        $('t-timer').textContent = `${tournoiState.timeRemaining}s`;
        if (tournoiState.timeRemaining <= 10) $('t-timer').style.color = "var(--red)";
        
        if (tournoiState.timeRemaining <= 0) {
          endTournament();
        }
      }, 1000);
    }

    function showTournamentQuestion() {
      const q = tournoiState.questions[tournoiState.currentIndex];
      $('t-question-number').textContent = `Question ${tournoiState.currentIndex+1} / 10`;
      
      if (q.Image) {
        $('t-question-img').src = q.Image.src;
        $('t-question-img').alt = q.Image.alt || "Image de situation";
        $('t-question-img').style.display = 'block';
        $('t-btn-credits').style.display = 'block';
        $('t-btn-credits').onclick = () => {
          const p = $('t-credits-popup');
          p.style.display = p.style.display === 'block' ? 'none' : 'block';
          p.innerHTML = `<strong>Auteur:</strong> ${q.Image.auteur}<br><strong>Licence:</strong> ${q.Image.licence}`;
        };
      } else {
        $('t-question-img').style.display = 'none';
        $('t-btn-credits').style.display = 'none';
        $('t-credits-popup').style.display = 'none';
      }

      $('t-question-text').textContent = q.q;
      
      const div = $('t-answers'); div.innerHTML = '';
      shuffle(q.choices.map((text,idx) => ({text,idx}))).forEach(({text,idx}) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn'; btn.textContent = text; 
        btn.addEventListener('click', () => {
          if (idx === q.correct) {
            playSound('correct');
            tournoiState.score++;
            $('t-score').textContent = tournoiState.score;
            btn.classList.add('correct');
          } else {
            playSound('wrong');
            btn.classList.add('wrong');
          }
          
          document.querySelectorAll('#t-answers .answer-btn').forEach(b => b.disabled = true);
          
          setTimeout(() => {
            tournoiState.currentIndex++;
            if (tournoiState.currentIndex >= tournoiState.questions.length) {
              endTournament();
            } else {
              showTournamentQuestion();
            }
          }, 600);
        });
        div.appendChild(btn);
      });
    }

    async function endTournament() {
      clearInterval(tournoiState.interval);
      playSound('win');
      if (tournoiState.score >= 8) confetti({particleCount: 150, spread: 80});

      $('t-question-card').style.display = 'none';
      $('t-results').style.display = 'block';
      $('t-final-score').textContent = `${tournoiState.score} / 10`;
      
      const today = new Date().toISOString().split('T')[0];
      const dateNum = parseInt(today.replace(/-/g, ''));
      const scoreKey = (dateNum * 1000) + tournoiState.score;
      
      $('t-save-status').textContent = 'Sauvegarde...';
      try {
        const newCoins = (userProfile.coins || 0) + tournoiState.score;
        await setDoc(doc(db, 'users', currentUser.uid), {
          tournamentDailyScore: scoreKey,
          tournamentTimeRemaining: Math.max(0, tournoiState.timeRemaining),
          tournamentDate: today,
          pseudo: userProfile.pseudo,
          coins: newCoins
        }, { merge: true });
        userProfile.coins = newCoins;
        updateHeader();
        
        $('t-save-status').textContent = '✅ Ton score est enregistré pour aujourd\'hui !';
        $('btn-t-lb').style.display = 'inline-block';
      } catch (e) {
        console.error("Erreur Firebase:", e);
        $('t-save-status').textContent = '❌ Erreur de sauvegarde: ' + e.message;
      }
    }

    $('btn-t-lb').addEventListener('click', () => {
      showScreen('screen-leaderboard');
      switchLBTab('tournament');
    });

    // ============================================================
    //  SOCIAL LOGIC
    // ============================================================
    let unsubFriends = null;
    let unsubRequests = null;

    $('btn-back-home-social').addEventListener('click', () => {
      showScreen('screen-home');
      if (unsubFriends) { unsubFriends(); unsubFriends = null; }
      if (unsubRequests) { unsubRequests(); unsubRequests = null; }
    });

    $('btn-social-search').addEventListener('click', async () => {
      const rawInput = $('social-search-input').value.trim();
      const pseudoLower = rawInput.toLowerCase();
      const resContainer = $('social-search-result');
      if (!rawInput) return;
      resContainer.innerHTML = 'Recherche...';
      try {
        let uId = null;
        let uData = null;

        // 1. Chercher dans la collection 'pseudos' (nouveaux comptes)
        const snap = await getDoc(doc(db, 'pseudos', pseudoLower));
        if (snap.exists()) {
          uId = snap.data().uid;
          const uSnap = await getDoc(doc(db, 'users', uId));
          if (uSnap.exists()) uData = uSnap.data();
        } else {
          // 2. Fallback pour les anciens comptes sans document 'pseudos'
          const q = query(collection(db, 'users'), where('pseudo', '==', rawInput));
          const oldSnap = await getDocs(q);
          if (!oldSnap.empty) {
            uId = oldSnap.docs[0].id;
            uData = oldSnap.docs[0].data();
          }
        }

        if (uData && uId !== currentUser.uid) {
          resContainer.innerHTML = `
            <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>${uData.pseudo}</strong><br>
                <small style="color:var(--muted)">XP: ${uData.xp||0}</small>
              </div>
              <button onclick="sendFriendRequest('${uId}', '${uData.pseudo}')" class="btn-primary" style="padding:8px 12px; font-size:0.8rem;">Ajouter</button>
            </div>
          `;
        } else {
          resContainer.innerHTML = '<span style="color:var(--red);">Joueur introuvable ou c\'est toi !</span>';
        }
      } catch (e) {
        resContainer.innerHTML = 'Erreur: ' + e.message;
      }
    });

    window.sendFriendRequest = async (toUserId, toPseudo) => {
      try {
        const requestId = `${currentUser.uid}_${toUserId}`;
        await setDoc(doc(db, 'friendRequests', requestId), {
          fromUserId: currentUser.uid,
          fromPseudo: userProfile.pseudo,
          toUserId: toUserId,
          toPseudo: toPseudo,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        $('social-search-result').innerHTML = '<span style="color:var(--green);">Demande envoyée !</span>';
      } catch (e) { alert("Erreur d'envoi: " + e.message); }
    };

    window.acceptRequest = async (reqId, fromId, fromPseudo) => {
      try {
        await setDoc(doc(db, `users/${currentUser.uid}/friends`, fromId), { pseudo: fromPseudo, since: serverTimestamp() });
        await setDoc(doc(db, `users/${fromId}/friends`, currentUser.uid), { pseudo: userProfile.pseudo, since: serverTimestamp() });
        await deleteDoc(doc(db, 'friendRequests', reqId));
      } catch (e) { console.error(e); }
    };

    window.rejectRequest = async (reqId) => {
      try { await deleteDoc(doc(db, 'friendRequests', reqId)); } catch (e) {}
    };

    window.loadSocialData = function() {
      if (!currentUser) return;
      
      // Listen for requests
      if (unsubRequests) unsubRequests();
      unsubRequests = onSnapshot(query(collection(db, 'friendRequests'), where('toUserId', '==', currentUser.uid)), snap => {
        const list = $('social-requests-list');
        list.innerHTML = '';
        let pendingCount = 0;
        snap.forEach(d => {
          const r = d.data();
          if (r.status === 'pending') {
            pendingCount++;
            list.innerHTML += `
              <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <strong>${r.fromPseudo}</strong>
                <div style="display:flex; gap:5px;">
                  <button onclick="acceptRequest('${d.id}','${r.fromUserId}','${r.fromPseudo}')" class="btn-primary" style="padding:6px 10px; background:var(--green); min-width:unset;">✔️</button>
                  <button onclick="rejectRequest('${d.id}')" class="btn-primary" style="padding:6px 10px; background:var(--red); min-width:unset;">❌</button>
                </div>
              </div>
            `;
          }
        });
        $('req-count').textContent = pendingCount;
        $('social-requests-container').style.display = pendingCount > 0 ? 'block' : 'none';
      });

      // Listen for friends
      if (unsubFriends) unsubFriends();
      unsubFriends = onSnapshot(collection(db, `users/${currentUser.uid}/friends`), snap => {
        const list = $('social-friends-list');
        list.innerHTML = '';
        snap.forEach(d => {
          const f = d.data();
          list.innerHTML += `
            <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
              <strong>${f.pseudo}</strong>
              <button onclick="createChallenge('${d.id}','${f.pseudo}')" class="btn-outline" style="padding:6px 12px; font-size:0.8rem; border-color:var(--accent2); color:var(--accent2);">Défier ⚔️</button>
            </div>
          `;
        });
        if (snap.empty) list.innerHTML = '<span style="color:var(--muted);">Pas encore d\'amis. Ajoute-les en les cherchant par pseudo !</span>';
      });

      // Listen for challenges (received)
      onSnapshot(query(collection(db, 'challenges'), where('toUserId', '==', currentUser.uid)), snap => {
        const list = $('social-challenges-list');
        if(!list) return;
        list.innerHTML = '';
        let count = 0;
        snap.forEach(d => {
          const c = d.data();
          if (c.status === 'pending' && c.toScore === null) {
            count++;
            list.innerHTML += `
              <div style="background:rgba(255,0,128,0.1); border:1px solid rgba(255,0,128,0.3); padding:10px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <strong>${c.fromPseudo} t'a défié !</strong>
                <button onclick="playChallenge('${d.id}', '${c.questionSet.join(',')}')" class="btn-primary" style="padding:6px 12px; background:var(--accent2);">Jouer 🏎️</button>
              </div>
            `;
          }
        });
        $('chal-count').textContent = count;
        $('social-challenges-container').style.display = count > 0 ? 'block' : 'none';
      });
    }

    window.createChallenge = async (friendId, friendPseudo) => {
      // Create a 5-question set
      const qSet = generateSeries([...QUESTIONS], 5).map(q => q.ID);
      try {
        const docRef = await addDoc(collection(db, 'challenges'), {
          fromUserId: currentUser.uid,
          fromPseudo: userProfile.pseudo,
          toUserId: friendId,
          toPseudo: friendPseudo,
          questionSet: qSet,
          fromScore: null,
          toScore: null,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        // We auto-play the challenge immediately for the sender
        playChallenge(docRef.id, qSet.join(','), true);
      } catch (e) { alert("Erreur d'envoi du défi."); console.error(e); }
    };

    let activeChallengeId = null;
    let isChallengeSender = false;

    window.playChallenge = (challengeId, qSetStr, isSender=false) => {
      const qIds = qSetStr.split(',');
      const challengeQuestions = QUESTIONS.filter(q => qIds.includes(q.ID));
      
      gameState.questions = challengeQuestions;
      gameState.currentIndex = 0;
      gameState.score = 0;
      gameState.streak = 0;
      activeChallengeId = challengeId;
      isChallengeSender = isSender;
      
      showScreen('screen-game');
      startGame();
    };

    window.finishChallenge = async () => {
      try {
        const updateData = isChallengeSender 
          ? { fromScore: gameState.score } 
          : { toScore: gameState.score, status: 'completed' };
          
        await updateDoc(doc(db, 'challenges', activeChallengeId), updateData);
        $('save-status').textContent = '✅ Défi enregistré !';
      } catch (e) {
        console.error(e);
        $('save-status').textContent = '❌ Erreur de sauvegarde du défi.';
      }
      activeChallengeId = null;
    };

    // ============================================================
    //  ÉCURIES (GUILDES)
    // ============================================================
    let unsubEcurie = null;
    let unsubEcurieMembers = null;
    const generateEcurieCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

    async function loadEcurieData() {
      if (!currentUser || !userProfile) return;
      $('ecurie-error').textContent = '';
      
      const ecurieId = userProfile.ecurieId;
      if (!ecurieId) {
        $('ecurie-dashboard').style.display = 'none';
        $('ecurie-no-team').style.display = 'block';
        return;
      }
      
      $('ecurie-no-team').style.display = 'none';
      $('ecurie-dashboard').style.display = 'block';

      if (unsubEcurie) unsubEcurie();
      unsubEcurie = onSnapshot(doc(db, 'ecuries', ecurieId), snap => {
        if (!snap.exists()) {
          // Ecurie supprimée
          updateDoc(doc(db, 'users', currentUser.uid), { ecurieId: null });
          userProfile.ecurieId = null;
          loadEcurieData();
          return;
        }
        const data = snap.data();
        $('ecurie-name-display').textContent = data.name;
        $('ecurie-division-name').textContent = data.division.charAt(0).toUpperCase() + data.division.slice(1);
        $('ecurie-points-display').textContent = data.weeklyPoints || 0;
        $('ecurie-code-display').textContent = data.inviteCode;
        
        let badge = '🥉';
        if(data.division === 'argent') badge = '🥈';
        if(data.division === 'or') badge = '🥇';
        if(data.division === 'diamant') badge = '💎';
        
        const logoBadge = $('ecurie-logo-badge');
        if (data.logo) {
          logoBadge.style.backgroundImage = `url(${data.logo})`;
          logoBadge.textContent = '';
        } else {
          logoBadge.style.backgroundImage = 'none';
          logoBadge.textContent = badge;
        }
        
        if (data.chefUserId === currentUser.uid) {
          $('btn-ecurie-admin').style.display = 'block';
        } else {
          $('btn-ecurie-admin').style.display = 'none';
        }

        loadEcurieLeaderboard(data.division);
      });

      if (unsubEcurieMembers) unsubEcurieMembers();
      unsubEcurieMembers = onSnapshot(query(collection(db, `ecuries/${ecurieId}/members`), orderBy('weeklyContribution', 'desc')), snap => {
        const list = $('ecurie-members-list');
        list.innerHTML = '';
        $('ecurie-member-count').textContent = snap.docs.length;
        snap.forEach(d => {
          const m = d.data();
          const isMe = d.id === currentUser.uid;
          list.innerHTML += `
            <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>${m.pseudo} ${isMe ? '(Toi)' : ''}</strong> ${m.role === 'chef' ? '👑' : ''}
              </div>
              <div style="color:var(--green); font-weight:bold;">${m.weeklyContribution || 0} pts</div>
            </div>
          `;
        });
      });
    }

    $('btn-ecurie-create').addEventListener('click', async () => {
      const name = $('ecurie-create-name').value.trim();
      if (!name) return $('ecurie-error').textContent = 'Veuillez entrer un nom pour l\'Écurie.';
      if (name.length > 20) return $('ecurie-error').textContent = 'Nom trop long (max 20).';
      
      if (!userProfile || (userProfile.coins || 0) < 100) {
        return $('ecurie-error').textContent = 'Il te faut 100 CodeCoins pour créer une Écurie !';
      }
      
      try {
        const code = generateEcurieCode();
        const docRef = await addDoc(collection(db, 'ecuries'), {
          name: name,
          inviteCode: code,
          chefUserId: currentUser.uid,
          division: 'bronze',
          weeklyPoints: 0,
          createdAt: serverTimestamp()
        });
        
        await setDoc(doc(db, `ecuries/${docRef.id}/members`, currentUser.uid), {
          pseudo: userProfile.pseudo,
          role: 'chef',
          weeklyContribution: 0,
          joinedAt: serverTimestamp()
        });
        
        const newCoins = (userProfile.coins || 0) - 100;
        await updateDoc(doc(db, 'users', currentUser.uid), { ecurieId: docRef.id, coins: newCoins });
        userProfile.ecurieId = docRef.id;
        userProfile.coins = newCoins;
        loadEcurieData();
        updateHeader();
      } catch(e) { $('ecurie-error').textContent = "Erreur création."; console.error(e); }
    });

    $('btn-ecurie-join').addEventListener('click', async () => {
      const code = $('ecurie-join-code').value.trim().toUpperCase();
      if (!code) return;
      
      try {
        const q = query(collection(db, 'ecuries'), where('inviteCode', '==', code));
        const snap = await getDocs(q);
        if (snap.empty) {
          $('ecurie-error').textContent = 'Code invalide ou Écurie introuvable.';
          return;
        }
        
        const ecurieDoc = snap.docs[0];
        const mSnap = await getDocs(collection(db, `ecuries/${ecurieDoc.id}/members`));
        if (mSnap.size >= 15) {
          $('ecurie-error').textContent = 'Cette Écurie est complète (15/15).';
          return;
        }
        
        await setDoc(doc(db, `ecuries/${ecurieDoc.id}/members`, currentUser.uid), {
          pseudo: userProfile.pseudo,
          role: 'member',
          weeklyContribution: 0,
          joinedAt: serverTimestamp()
        });
        
        await updateDoc(doc(db, 'users', currentUser.uid), { ecurieId: ecurieDoc.id });
        userProfile.ecurieId = ecurieDoc.id;
        loadEcurieData();
      } catch(e) { $('ecurie-error').textContent = "Erreur pour rejoindre."; console.error(e); }
    });

    $('btn-ecurie-leave').addEventListener('click', async () => {
      if(!confirm("Quitter ton Écurie ?")) return;
      try {
        const eId = userProfile.ecurieId;
        await deleteDoc(doc(db, `ecuries/${eId}/members`, currentUser.uid));
        await updateDoc(doc(db, 'users', currentUser.uid), { ecurieId: null });
        userProfile.ecurieId = null;
        loadEcurieData();
      } catch(e) { console.error(e); }
    });

    
    // ----------------------------------------------------
    // RECHERCHE PUBLIQUE
    // ----------------------------------------------------
    $('btn-ecurie-refresh-public').addEventListener('click', async () => {
      const list = $('ecurie-public-list');
      list.innerHTML = '<div style="text-align:center; color:gray;">Recherche en cours...</div>';
      try {
        const q = query(collection(db, 'ecuries'), orderBy('weeklyPoints', 'desc'), limit(15));
        const snap = await getDocs(q);
        list.innerHTML = '';
        if(snap.empty) {
          list.innerHTML = '<div style="text-align:center; color:gray;">Aucune écurie trouvée.</div>';
          return;
        }
        snap.forEach(d => {
          const e = d.data();
          const max = e.maxMembers !== undefined ? e.maxMembers : 20;
          if (max === 0) return; // closed
          const divIcon = e.division==='diamant'?'💎':e.division==='or'?'🥇':e.division==='argent'?'🥈':'🥉';
          
          const div = document.createElement('div');
          div.style.background = 'rgba(255,255,255,0.05)';
          div.style.padding = '10px';
          div.style.borderRadius = '8px';
          div.style.display = 'flex';
          div.style.justifyContent = 'space-between';
          div.style.alignItems = 'center';
          div.innerHTML = `
            <div>
              <div style="font-weight:bold;">${divIcon} ${e.name}</div>
              <div style="font-size:0.8rem; color:var(--muted);">${e.weeklyPoints||0} pts</div>
            </div>
            <button class="btn-primary" style="padding:4px 8px; font-size:0.7rem;" data-id="${d.id}" data-code="${e.inviteCode}">Rejoindre</button>
          `;
          list.appendChild(div);
        });

        list.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => {
            $('ecurie-join-code').value = btn.getAttribute('data-code');
            $('btn-ecurie-join').click();
          });
        });

      } catch(e) {
        console.error(e);
        list.innerHTML = '<div style="text-align:center; color:var(--red);">Erreur réseau.</div>';
      }
    });

    // ----------------------------------------------------
    // PANNEAU ADMINISTRATION
    // ----------------------------------------------------
    let uploadedLogoBase64 = null;

    $('btn-ecurie-admin').addEventListener('click', async () => {
      if(!userProfile || !userProfile.ecurieId) return;
      const snap = await getDoc(doc(db, 'ecuries', userProfile.ecurieId));
      if(!snap.exists()) return;
      const data = snap.data();
      
      $('ecurie-settings-name').value = data.name;
      $('ecurie-settings-max').value = data.maxMembers !== undefined ? data.maxMembers : 20;
      uploadedLogoBase64 = data.logo || null;
      if (uploadedLogoBase64) {
        $('ecurie-settings-logo-preview').style.backgroundImage = `url(${uploadedLogoBase64})`;
        $('ecurie-settings-logo-preview').textContent = '';
      } else {
        $('ecurie-settings-logo-preview').style.backgroundImage = 'none';
        $('ecurie-settings-logo-preview').textContent = '?';
      }
      $('ecurie-settings-error').textContent = '';
      $('ecurie-settings-modal').style.display = 'flex';
    });

    $('btn-close-settings').addEventListener('click', () => {
      $('ecurie-settings-modal').style.display = 'none';
    });

    $('ecurie-settings-logo-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if(!file) return;
      if(file.size > 2 * 1024 * 1024) {
        $('ecurie-settings-error').textContent = "Image trop volumineuse (Max 2Mo).";
        return;
      }
      $('ecurie-settings-error').textContent = "Chargement...";
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 100; canvas.height = 100;
          const ctx = canvas.getContext('2d');
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 100, 100);
          uploadedLogoBase64 = canvas.toDataURL('image/jpeg', 0.8);
          $('ecurie-settings-logo-preview').style.backgroundImage = `url(${uploadedLogoBase64})`;
          $('ecurie-settings-logo-preview').textContent = '';
          $('ecurie-settings-error').textContent = "";
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });

    $('btn-save-ecurie-settings').addEventListener('click', async () => {
      $('ecurie-settings-error').textContent = "Sauvegarde...";
      try {
        const newName = $('ecurie-settings-name').value.trim();
        const newMax = parseInt($('ecurie-settings-max').value, 10);
        if(!newName || newName.length > 20) {
          $('ecurie-settings-error').textContent = "Nom invalide.";
          return;
        }
        await updateDoc(doc(db, 'ecuries', userProfile.ecurieId), {
          name: newName,
          maxMembers: newMax,
          logo: uploadedLogoBase64
        });
        $('ecurie-settings-modal').style.display = 'none';
      } catch(e) {
        console.error(e);
        $('ecurie-settings-error').textContent = "Erreur de sauvegarde.";
      }
    });

$('btn-ecurie-refresh-lb').addEventListener('click', () => {
      if(userProfile.ecurieId && unsubEcurie) {
         // loadEcurieLeaderboard called by onSnapshot, but we can force UI update if needed.
         $('btn-ecurie-refresh-lb').style.transform = 'rotate(180deg)';
         setTimeout(() => $('btn-ecurie-refresh-lb').style.transform = 'none', 300);
      }
    });

    function loadEcurieLeaderboard(division) {
      const tbody = $('ecurie-lb-body');
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Chargement...</td></tr>';
      
      // On getDocs (pas snapshot pour éviter trop de lectures)
      getDocs(query(collection(db, 'ecuries'), where('division', '==', division), orderBy('weeklyPoints', 'desc'), limit(10)))
        .then(snap => {
          tbody.innerHTML = '';
          snap.forEach((d, i) => {
            const e = d.data();
            const isMyEcurie = d.id === userProfile.ecurieId;
            tbody.innerHTML += `
              <tr style="${isMyEcurie ? 'background:rgba(16,185,129,0.15);' : ''}">
                <td style="padding:8px 0;">${i+1}</td>
                <td><strong>${e.name}</strong></td>
                <td style="text-align:right; font-weight:bold; color:var(--green);">${e.weeklyPoints || 0}</td>
              </tr>
            `;
          });
        }).catch(e => console.error(e));
    }



  
