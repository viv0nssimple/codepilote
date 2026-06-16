const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. REWRITE HEADER
const newHeader = `
<header style="display:flex; justify-content:space-between; align-items:center;">
  <div id="header-logo" class="logo" style="cursor:pointer;" aria-label="Retour à l'accueil">CodePilote</div>
  <div class="header-actions" style="display:flex; align-items:center;">
    <div id="header-level-label" class="header-btn" style="font-weight:bold; margin-right:8px;">---</div>
    <div id="header-user" class="header-btn" style="font-weight:bold; margin-right:8px; display:none;">---</div>
    <button id="btn-logout" class="btn-outline header-btn" title="Se déconnecter" aria-label="Se déconnecter" style="display:none;"></button>
  </div>
</header>
`;

// Find where header starts and ends
html = html.replace(/<header[\s\S]*?<\/header>/, newHeader);

// 2. REWRITE SCREEN HOME
const newScreenHome = `
<div id="screen-home" style="display:none; width:100%;">
  
  <!-- 1. GRANDE CARTE : RÉVISER -->
  <div id="card-reviser">
    <div style="flex:1; min-width:280px; z-index:2; position:relative;">
      <h2 style="color:var(--text); margin-bottom:10px;">Salut, <span id="bento-pseudo" class="skeleton skeleton-text"></span> !</h2>
      <p id="bento-recommendation" class="skeleton skeleton-text" style="margin-bottom:25px;">Chargement...</p>
      
      <button id="btn-home-main-action" class="btn-primary" style="background:var(--cp-blue); color:#fff; padding:14px 28px; font-size:1.1rem; border-radius:20px; box-shadow:0 10px 20px rgba(79,124,255,0.15); display:inline-flex; align-items:center; gap:10px; border:none;">
        <i data-lucide="play" width="20" height="20"></i> Continuer l'entraînement
      </button>
    </div>
    <div style="flex:1; min-width:200px; display:flex; align-items:center; justify-content:center; position:relative; z-index:1;">
      <!-- Abstract Illustration Placeholder -->
      <div style="width:160px; height:160px; background:linear-gradient(135deg, var(--cp-blue), #8B6CFF); border-radius:40px; transform:rotate(-10deg); box-shadow:0 20px 40px rgba(79,124,255,0.2); display:flex; align-items:center; justify-content:center; position:relative;">
        <i data-lucide="book-open" width="64" height="64" color="#fff" stroke-width="1.5"></i>
        <div style="position:absolute; top:-10px; right:-10px; width:40px; height:40px; background:var(--cp-green); border-radius:50%; filter:blur(10px); opacity:0.8;"></div>
      </div>
    </div>
  </div>

  <!-- GRILLE BENTO : 3 CARTES SECONDAIRES -->
  <div class="cp-bento-grid" style="display:grid; margin-top:24px;">
    
    <!-- 2. CARTE JOUER -->
    <div id="card-jouer-container">
      <div class="card-icon" style="background:rgba(255,122,89,0.1); color:var(--cp-orange); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <i data-lucide="gamepad-2" width="32" height="32" stroke-width="2"></i>
      </div>
      <h3 style="margin-bottom:8px;">Jouer</h3>
      <p style="color:var(--cp-muted);">Choisis ton mode et démarre la partie.</p>
      
      <!-- Contenu Extensible -->
      <div id="jouer-expanded">
        <button id="btn-home-solo">
          <i data-lucide="user" width="28"></i>
          <div><strong>Solo</strong><br><span style="font-size:0.85em; opacity:0.8;">Entraînement</span></div>
        </button>
        <button id="btn-home-duel">
          <i data-lucide="swords" width="28"></i>
          <div><strong>Duel</strong><br><span style="font-size:0.85em; opacity:0.8;">Face à face</span></div>
        </button>
        <button id="btn-home-tournament">
          <i data-lucide="trophy" width="28"></i>
          <div><strong>Tournoi</strong><br><span style="font-size:0.85em; opacity:0.8;">Compétition</span></div>
        </button>
        <button disabled style="opacity:0.5; cursor:not-allowed;">
          <i data-lucide="users" width="28"></i>
          <div><strong>Coop</strong><br><span style="font-size:0.85em; opacity:0.8;">Bientôt</span></div>
        </button>
      </div>
      
      <div style="position:absolute; bottom:-10px; right:-10px; opacity:0.05; transform:rotate(-20deg); pointer-events:none;">
        <i data-lucide="zap" width="120" height="120"></i>
      </div>
    </div>

    <!-- 3. CARTE MON PROGRÈS -->
    <div id="btn-home-progress">
      <div class="card-icon" style="background:rgba(56,201,154,0.1); color:var(--cp-green); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <i data-lucide="trending-up" width="32" height="32" stroke-width="2"></i>
      </div>
      <h3 style="margin-bottom:8px;">Mon progrès</h3>
      <p style="color:var(--cp-muted);">Découvre ce que tu maîtrises déjà.</p>
      
      <div style="margin-top:20px;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700; color:var(--cp-muted); margin-bottom:8px;">
          <span>Niveau Actuel</span>
          <span id="bento-xp-txt" class="skeleton skeleton-text"></span>
        </div>
        <div style="width:100%; height:8px; background:rgba(23,32,51,0.05); border-radius:10px; overflow:hidden;">
          <div id="bento-xp-fill" style="height:100%; background:var(--cp-green); width:0%; transition:width 0.6s ease;"></div>
        </div>
      </div>

      <div style="position:absolute; bottom:-10px; right:-10px; opacity:0.05; transform:rotate(15deg); pointer-events:none;">
        <i data-lucide="target" width="120" height="120"></i>
      </div>
    </div>

    <!-- 4. CARTE MON PROFIL -->
    <div id="btn-home-profile">
      <div class="card-icon" style="background:rgba(139,108,255,0.1); color:var(--cp-purple); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <i data-lucide="user-circle" width="32" height="32" stroke-width="2"></i>
      </div>
      <h3 style="margin-bottom:8px;">Mon profil</h3>
      <p style="color:var(--cp-muted);">Identité, Écurie et Classements.</p>
      
      <div style="display:flex; gap:10px; margin-top:20px;">
        <div style="background:rgba(23,32,51,0.04); padding:6px 12px; border-radius:12px; display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:700;">
          <i data-lucide="users" width="14" color="var(--cp-blue)"></i> Social
        </div>
        <div style="background:rgba(23,32,51,0.04); padding:6px 12px; border-radius:12px; display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:700;">
          <i data-lucide="flag" width="14" color="var(--cp-purple)"></i> Écurie
        </div>
      </div>

      <div style="position:absolute; bottom:-10px; right:-10px; opacity:0.05; transform:rotate(-10deg); pointer-events:none;">
        <i data-lucide="award" width="120" height="120"></i>
      </div>
    </div>

  </div>
</div>
`;

html = html.replace(/<div id="screen-home" style="display:none;?">[\s\S]*?<!-- ════ SCREEN : SOCIAL ════ -->/, newScreenHome + '\n\n<!-- ════ SCREEN : SOCIAL ════ -->');

// 3. REMOVE LEFTOVER DUPLICATE JS HANDLERS from index.html that would conflict with home-refresh.js
html = html.replace(/\$\('btn-home-solo'\)\.addEventListener\('click'[\s\S]*?\$\('screen-game'\)\.style\.display = 'block';\s*\}\);/, '');
html = html.replace(/\$\('btn-home-duel'\)\.addEventListener\('click'[\s\S]*?showScreen\('screen-lobby'\);\s*\}\);/, '');
html = html.replace(/\$\('btn-home-tournament'\)\.addEventListener\('click'[\s\S]*?loadTournament\(\);\s*\}\);/, '');

// Fix updateHeader
const updateHeaderFix = `
    function updateHeader() {
      if (window.lucide) window.lucide.createIcons();
      if (currentUser && userProfile) {
        if($('header-user')) {
          $('header-user').textContent = userProfile.pseudo || 'Joueur';
          $('header-user').style.display = 'inline-flex';
        }
        if($('btn-logout')) $('btn-logout').style.display = 'inline-flex';

        const xp   = userProfile.xp || 0;
        const lv   = getLevel(xp);
        const next = getNextLevel(xp);
        if($('header-level-label')) $('header-level-label').textContent = lv.label;
        
        // Bento Main
        if($('bento-pseudo')) {
          $('bento-pseudo').textContent = userProfile.pseudo || 'Pilote';
          $('bento-pseudo').classList.remove('skeleton');
        }
        if($('bento-recommendation')) {
          $('bento-recommendation').textContent = "Quelques minutes pour progresser aujourd'hui.";
          $('bento-recommendation').classList.remove('skeleton');
        }

        // Bento XP
        if (next) {
          const pct = Math.min(100, ((xp - lv.min) / (next.min - lv.min)) * 100);
          if($('bento-xp-fill')) $('bento-xp-fill').style.width  = pct + '%';
          if($('bento-xp-txt')) {
             $('bento-xp-txt').textContent   = \`\${xp} / \${next.min} XP\`;
             $('bento-xp-txt').classList.remove('skeleton');
          }
        } else {
          if($('bento-xp-fill')) $('bento-xp-fill').style.width  = '100%';
          if($('bento-xp-txt')) {
             $('bento-xp-txt').textContent   = \`\${xp} XP — MAX\`;
             $('bento-xp-txt').classList.remove('skeleton');
          }
        }
        
      } else {
        if($('header-user')) $('header-user').style.display = 'none';
        if($('btn-logout')) $('btn-logout').style.display = 'none';
        if($('header-level-label')) $('header-level-label').textContent = '';
      }
    }
`;
html = html.replace(/function updateHeader\(\) \{[\s\S]*?\}\n\n/m, updateHeaderFix + '\n\n');

// 4. Update the "Créer" button
html = html.replace(/<button id="btn-ecurie-create".*?>Créer.*?(100).*?<\/button>/, '<button id="btn-ecurie-create" class="btn-primary" style="width:100%;">Créer pour 100 CodeCoins</button>');


fs.writeFileSync('index.html', html);
console.log('HTML restructured successfully!');
