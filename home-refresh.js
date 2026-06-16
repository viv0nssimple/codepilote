(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const allScreenIds = [
    'screen-auth',
    'screen-onboarding',
    'screen-home',
    'screen-game',
    'screen-leaderboard',
    'screen-lobby',
    'screen-duel',
    'screen-duel-results',
    'screen-tournament',
    'screen-social',
    'screen-ecurie'
  ];

  function hideAllScreens() {
    allScreenIds.forEach(id => {
      const screen = byId(id);
      if (screen) screen.style.display = 'none';
    });
  }

  function openExistingScreen(screenId, triggerId) {
    const trigger = byId(triggerId);
    if (trigger) trigger.click();

    window.setTimeout(() => {
      hideAllScreens();
      const screen = byId(screenId);
      if (screen) {
        screen.style.display = 'block';
        screen.style.animation = 'screenEnter .45s cubic-bezier(.2,.8,.2,1)';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  }

  function createIcon(name, size = 20) {
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', name);
    icon.setAttribute('width', String(size));
    icon.setAttribute('height', String(size));
    return icon;
  }

  function createOverlay(id, title, description) {
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'cp-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <section class="cp-panel" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
        <div class="cp-panel__top">
          <div>
            <p class="cp-eyebrow">CodePilote</p>
            <h2 id="${id}-title">${title}</h2>
            <p>${description}</p>
          </div>
          <button class="cp-panel__close" type="button" aria-label="Fermer">×</button>
        </div>
        <div class="cp-panel__content"></div>
      </section>
    `;

    const close = () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('cp-modal-open');
    };

    overlay.querySelector('.cp-panel__close').addEventListener('click', close);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) close();
    });

    document.body.appendChild(overlay);

    return {
      overlay,
      content: overlay.querySelector('.cp-panel__content'),
      open() {
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cp-modal-open');
        overlay.querySelector('.cp-panel__close').focus();
      },
      close
    };
  }

  function setupHome() {
    const home = byId('screen-home');
    if (!home) return;

    const reviseCard = byId('card-reviser');
    const playCard = byId('card-jouer-container');
    const progressCard = byId('btn-home-progress');
    const profileCard = byId('btn-home-profile');
    const expanded = byId('jouer-expanded');
    const mainAction = byId('btn-home-main-action');

    const grid = playCard?.parentElement;
    if (grid) grid.classList.add('cp-bento-grid');

    if (reviseCard && !reviseCard.querySelector('.cp-activity-meta')) {
      const meta = document.createElement('div');
      meta.className = 'cp-activity-meta';
      meta.append(createIcon('sparkles', 16));
      meta.append('Objectif du jour');
      reviseCard.querySelector('div')?.prepend(meta);
    }

    const recommendation = byId('bento-recommendation');
    if (recommendation) {
      const observer = new MutationObserver(() => {
        if (
          !recommendation.classList.contains('skeleton') &&
          recommendation.textContent.trim().length < 25
        ) {
          recommendation.textContent =
            'Quelques minutes suffisent pour consolider tes acquis aujourd’hui.';
        }
      });
      observer.observe(recommendation, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    if (playCard && expanded) {
      playCard.setAttribute('role', 'button');
      playCard.setAttribute('tabindex', '0');
      playCard.setAttribute('aria-expanded', 'false');
      playCard.setAttribute('aria-controls', 'jouer-expanded');

      const togglePlayCard = () => {
        const willOpen = !playCard.classList.contains('is-expanded');
        playCard.classList.toggle('is-expanded', willOpen);
        playCard.setAttribute('aria-expanded', String(willOpen));
        expanded.style.display = willOpen ? 'grid' : 'none';

        [progressCard, profileCard, reviseCard].forEach(card => {
          if (card) card.classList.toggle('cp-muted-card', willOpen);
        });

        if (window.lucide) window.lucide.createIcons();
      };

      playCard.addEventListener(
        'click',
        event => {
          if (event.target.closest('button')) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          togglePlayCard();
        },
        true
      );

      playCard.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        togglePlayCard();
      });

      if (!expanded.querySelector('.cp-sound-toggle')) {
        const soundToggle = document.createElement('button');
        soundToggle.type = 'button';
        soundToggle.className = 'cp-sound-toggle';
        soundToggle.setAttribute('aria-pressed', 'false');

        const renderSoundLabel = () => {
          soundToggle.replaceChildren(
            createIcon(
              window.codePiloteSoundEnabled ? 'volume-2' : 'volume-x',
              18
            ),
            document.createTextNode(
              window.codePiloteSoundEnabled
                ? ' Sons de jeu activés'
                : ' Sons de jeu désactivés'
            )
          );
          soundToggle.setAttribute(
            'aria-pressed',
            String(window.codePiloteSoundEnabled)
          );
          if (window.lucide) window.lucide.createIcons();
        };

        soundToggle.addEventListener('click', event => {
          event.stopPropagation();
          window.codePiloteSoundEnabled = !window.codePiloteSoundEnabled;
          renderSoundLabel();
        });

        expanded.appendChild(soundToggle);
        renderSoundLabel();
      }
    }

    if (mainAction) {
      mainAction.addEventListener(
        'click',
        event => {
          event.preventDefault();
          event.stopImmediatePropagation();
          byId('btn-home-solo')?.click();
        },
        true
      );
    }

    const progressOverlay = createOverlay(
      'cp-progress-overlay',
      'Mon progrès',
      'Une lecture rapide de ton niveau actuel et de tes prochains objectifs.'
    );

    progressOverlay.content.innerHTML = `
      <div class="cp-panel__grid">
        <article class="cp-panel-card cp-progress-summary">
          <div class="cp-progress-ring" data-label="XP" style="--cp-progress:0%"></div>
          <strong>Progression générale</strong>
          <span id="cp-progress-xp">Données en cours de chargement…</span>
        </article>
        <article class="cp-panel-card">
          <strong>Point fort</strong>
          <span>Continue à jouer pour révéler les thèmes que tu maîtrises le mieux.</span>
        </article>
        <article class="cp-panel-card">
          <strong>À travailler</strong>
          <span>Tes prochaines sessions feront apparaître tes priorités de révision.</span>
        </article>
        <article class="cp-panel-card">
          <strong>Objectif conseillé</strong>
          <span>Une série courte et régulière vaut mieux qu’une longue session occasionnelle.</span>
        </article>
      </div>
    `;

    const syncProgressOverlay = () => {
      const xpText =
        byId('bento-xp-txt')?.textContent?.trim() ||
        'Données en cours de chargement…';
      const fillWidth = byId('bento-xp-fill')?.style?.width || '0%';
      const label = byId('cp-progress-xp');
      const ring = progressOverlay.overlay.querySelector('.cp-progress-ring');

      if (label) label.textContent = xpText;
      if (ring) ring.style.setProperty('--cp-progress', fillWidth);
    };

    if (progressCard) {
      progressCard.setAttribute('role', 'button');
      progressCard.setAttribute('tabindex', '0');

      const openProgress = event => {
        event?.preventDefault();
        event?.stopImmediatePropagation();
        syncProgressOverlay();
        progressOverlay.open();
      };

      progressCard.addEventListener('click', openProgress, true);
      progressCard.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') openProgress(event);
      });
    }

    const profileOverlay = createOverlay(
      'cp-profile-overlay',
      'Mon profil',
      'Retrouve ton identité de pilote et les espaces communautaires.'
    );

    profileOverlay.content.innerHTML = `
      <div class="cp-profile-head">
        <div class="cp-avatar" aria-hidden="true">CP</div>
        <div>
          <strong id="cp-profile-name">Pilote</strong>
          <span id="cp-profile-level">Niveau en cours de chargement…</span>
        </div>
      </div>
      <div class="cp-panel__grid">
        <button class="cp-panel-card" id="cp-open-social" type="button">
          <strong>Communauté</strong>
          <span>Amis, demandes et défis.</span>
        </button>
        <button class="cp-panel-card" id="cp-open-ecurie" type="button">
          <strong>Mon Écurie</strong>
          <span>Membres, ligue et gestion.</span>
        </button>
        <button class="cp-panel-card" id="cp-open-leaderboard" type="button">
          <strong>Classements</strong>
          <span>Compare ta progression avec les autres pilotes.</span>
        </button>
        <button class="cp-panel-card cp-danger-card" id="cp-logout" type="button">
          <strong>Se déconnecter</strong>
          <span>Quitter proprement la session.</span>
        </button>
      </div>
    `;

    const syncProfile = () => {
      const name =
        byId('header-user')?.textContent?.trim() ||
        byId('bento-pseudo')?.textContent?.trim() ||
        'Pilote';
      const level =
        byId('header-level-label')?.textContent?.trim() ||
        'Niveau en cours de chargement…';

      profileOverlay.overlay.querySelector('#cp-profile-name').textContent = name;
      profileOverlay.overlay.querySelector('#cp-profile-level').textContent = level;
      const avatar = profileOverlay.overlay.querySelector('.cp-avatar');
      avatar.textContent = name
        .split(/\s+/)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CP';
    };

    if (profileCard) {
      profileCard.setAttribute('role', 'button');
      profileCard.setAttribute('tabindex', '0');

      const openProfile = event => {
        event?.preventDefault();
        event?.stopImmediatePropagation();
        syncProfile();
        profileOverlay.open();
      };

      profileCard.addEventListener('click', openProfile, true);
      profileCard.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') openProfile(event);
      });
    }

    profileOverlay.overlay
      .querySelector('#cp-open-social')
      .addEventListener('click', () => {
        profileOverlay.close();
        openExistingScreen('screen-social', 'btn-home-social');
      });

    profileOverlay.overlay
      .querySelector('#cp-open-ecurie')
      .addEventListener('click', () => {
        profileOverlay.close();
        openExistingScreen('screen-ecurie', 'btn-home-ecurie');
      });

    profileOverlay.overlay
      .querySelector('#cp-open-leaderboard')
      .addEventListener('click', () => {
        profileOverlay.close();
        openExistingScreen('screen-leaderboard', 'btn-leaderboard');
      });

    profileOverlay.overlay
      .querySelector('#cp-logout')
      .addEventListener('click', () => {
        profileOverlay.close();
        byId('btn-logout')?.click();
      });
  }

  function cleanLegacyPlaceholders() {
    const placeholderIds = [
      'ecurie-name-display',
      'ecurie-division-name',
      'ecurie-points-display',
      'ecurie-code-display',
      'final-score',
      'r-correct',
      'r-wrong'
    ];

    placeholderIds.forEach(id => {
      const element = byId(id);
      if (!element) return;

      const sync = () => {
        const value = element.textContent.trim();
        element.classList.toggle(
          'is-placeholder',
          value === '---' || value === ''
        );
      };

      sync();

      new MutationObserver(sync).observe(element, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });

    document.querySelectorAll('*').forEach(element => {
      if (
        element.childNodes.length === 1 &&
        element.firstChild?.nodeType === Node.TEXT_NODE
      ) {
        element.textContent = element.textContent.replace(
          /Chargement\.\.\./g,
          'Chargement…'
        );
      }
    });
  }

  function improveNavigation() {
    const headerLogo = byId('header-logo');
    if (headerLogo) {
      headerLogo.setAttribute('role', 'button');
      headerLogo.setAttribute('tabindex', '0');
      headerLogo.setAttribute('aria-label', 'Retour à l’accueil');

      const hideEcurieBeforeHome = () => {
        const ecurie = byId('screen-ecurie');
        if (ecurie) ecurie.style.display = 'none';
      };

      headerLogo.addEventListener('click', hideEcurieBeforeHome, true);
      headerLogo.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') headerLogo.click();
      });
    }

    [
      'btn-back-home-social',
      'btn-back-home-ecurie',
      'btn-back-home-lb',
      'btn-back-home-game',
      'btn-back-home-res',
      'btn-back-home-tournoi',
      'btn-duel-back'
    ].forEach(id => {
      const button = byId(id);
      if (!button) return;

      button.addEventListener(
        'click',
        () => {
          const ecurie = byId('screen-ecurie');
          if (ecurie) ecurie.style.display = 'none';
        },
        true
      );
    });
  }

  function initialize() {
    setupHome();
    cleanLegacyPlaceholders();
    improveNavigation();

    if (window.lucide) window.lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
