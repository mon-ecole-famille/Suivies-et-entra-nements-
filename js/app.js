import * as St from './store.js';
import { LESSONS, DETECTIVE, PROMPT_CHALLENGES, PROMPT_BOX, CHARTER, TIER_BY_LEVEL } from './data/ia.js';
import { evaluatePrompt } from './prompt-lab.js';

const $app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const go = (h) => { location.hash = h; };
const S = () => St.S;
let parentUnlocked = false;

// ======================= Utilitaires UI =======================
function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms);
}
function modal(html, { onMount } = {}) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="sheet">${html}</div>`;
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
  document.body.appendChild(m); onMount && onMount(m); return m;
}
function pinPrompt(title = 'Code parent') {
  return new Promise((resolve) => {
    const m = modal(`<h3>🔒 ${esc(title)}</h3><input class="pin" type="password" inputmode="numeric" maxlength="6" placeholder="••••" autofocus>
      <div class="row"><button class="btn ghost" data-close>Annuler</button><button class="btn" data-ok>Valider</button></div>`);
    const inp = m.querySelector('input'); setTimeout(() => inp.focus(), 50);
    const ok = () => { const good = St.checkPin(inp.value); if (good) { m.remove(); resolve(true); } else { inp.value = ''; inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); } };
    m.querySelector('[data-ok]').onclick = ok; inp.onkeydown = (e) => { if (e.key === 'Enter') ok(); };
    m.addEventListener('click', (e) => { if (e.target.closest('[data-close]') || e.target === m) resolve(false); });
  });
}
async function share(title, text, url) {
  if (navigator.share) { try { await navigator.share({ title, text, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(url); toast('Lien copié ✅'); } catch (e) { /* ignore */ }
  modal(`<h3>${esc(title)}</h3><p>${esc(text)}</p><textarea class="linkbox" readonly>${esc(url)}</textarea>
    <div class="row"><a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}">WhatsApp</a>
    <a class="btn ghost" href="sms:?&body=${encodeURIComponent(text + ' ' + url)}">SMS</a><button class="btn ghost" data-close>Fermer</button></div>`);
}
function confetti() {
  const em = ['🎉', '⭐', '✨', '🎊', '💫', '🏅'];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('span'); s.className = 'confetti'; s.textContent = em[i % em.length];
    s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = Math.random() * 0.6 + 's'; s.style.fontSize = 16 + Math.random() * 18 + 'px';
    document.body.appendChild(s); setTimeout(() => s.remove(), 3200);
  }
}
const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } };
const fmtMin = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`; };
const pct = (r) => Math.round(r * 100) + ' %';
const frDate = (iso) => iso ? new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
const subOf = (kid, key) => St.subjects(kid).find((s) => s.key === key) || { name: key, icon: '•', color: '#888' };
const header = (title, back) => `<header class="top"><button class="icon" onclick="${back ? `location.hash='${back}'` : 'history.back()'}">←</button><h1>${title}</h1><span></span></header>`;
const levelBar = (kid) => { const L = St.levelInfo(kid.xp); return `<div class="lvl"><span class="lvl-n">Niv. ${L.lvl}</span><div class="bar"><i style="width:${(L.cur / L.need) * 100}%"></i></div><span class="lvl-t">${L.title}</span></div>`; };
function ring(val, max, label) {
  const r = 34, c = 2 * Math.PI * r, p = Math.min(1, max ? val / max : 0);
  return `<svg class="ring" viewBox="0 0 80 80"><circle cx="40" cy="40" r="${r}" class="ring-bg"/><circle cx="40" cy="40" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}"/><text x="40" y="38">${Math.round(val)}</text><text x="40" y="54" class="small">${label}</text></svg>`;
}

// ======================= Routeur =======================
const routes = [
  [/^#?\/?$/, home],
  [/^#\/setup$/, setup],
  [/^#\/import\/(.+)$/, importView],
  [/^#\/k\/(\w+)$/, kidHome],
  [/^#\/k\/(\w+)\/quiz\/([\w-]+)\/?([\w-]*)$/, quiz],
  [/^#\/k\/(\w+)\/ia$/, iaHub],
  [/^#\/k\/(\w+)\/ia\/lessons$/, iaLessons],
  [/^#\/k\/(\w+)\/ia\/detective$/, iaDetective],
  [/^#\/k\/(\w+)\/ia\/lab$/, iaLab],
  [/^#\/k\/(\w+)\/ia\/box$/, iaBox],
  [/^#\/k\/(\w+)\/ia\/charter$/, iaCharter],
  [/^#\/k\/(\w+)\/rewards$/, rewards],
  [/^#\/k\/(\w+)\/badges$/, badges],
  [/^#\/k\/(\w+)\/progress$/, kidProgress],
  [/^#\/parent$/, parentHome],
  [/^#\/parent\/k\/(\w+)$/, parentKid],
  [/^#\/parent\/settings$/, parentSettings],
];
async function render() {
  const h = location.hash || '#/';
  window.scrollTo(0, 0);
  document.querySelectorAll('.modal').forEach((m) => m.remove());
  for (const [re, fn] of routes) { const m = h.match(re); if (m) { document.body.className = ''; await fn(...m.slice(1)); return; } }
  go('#/');
}
window.addEventListener('hashchange', render);

function needKid(id) { const k = St.kidById(id); if (!k) { go('#/'); return null; } document.body.className = 'lvl-' + k.level; return k; }

// ======================= Accueil / choix du profil =======================
function home() {
  if (!S().kids.length) return welcome();
  const kids = S().kids.filter((k) => !k.remote);
  $app.innerHTML = `<div class="page center">
    <div class="hero"><div class="logo">🎓</div><h1>Mon École</h1><p>Qui s’entraîne aujourd’hui ?</p></div>
    <div class="kids">${kids.map((k) => `<button class="kid-card" onclick="location.hash='#/k/${k.id}'"><span class="av">${k.avatar}</span><b>${esc(k.name)}</b><small>${St.LEVELS[k.level].label} · 🔥 ${St.liveStreak(k)}</small></button>`).join('')}</div>
    ${!kids.length ? '<p class="muted">Aucun profil enfant sur cet appareil. Ouvre le lien d’installation reçu, ou passe par l’espace parent.</p>' : ''}
    <button class="btn ghost wide" onclick="location.hash='#/parent'">👨‍👩‍👧‍👦 Espace parent</button>
  </div>`;
}
function welcome() {
  $app.innerHTML = `<div class="page center">
    <div class="hero"><div class="logo big">🎓</div><h1>Mon École</h1><p>Entraînement, progrès et compétences IA<br>pour toute la famille.</p></div>
    <div class="card"><h3>👨 Je suis le parent</h3><p>Je crée les profils, le code parent et les récompenses.</p><button class="btn wide" onclick="location.hash='#/setup'">Configurer la famille</button></div>
    <div class="card"><h3>🧒 Je suis un enfant</h3><p>Ouvre simplement le <b>lien d’installation</b> que ton parent t’a envoyé : ton profil se créera tout seul.</p></div>
  </div>`;
}
function setup() {
  const presets = [['', '1st2s', '🌸', 'Prénom de ma grande'], ['', '3e', '⚽', 'Prénom de mon fils'], ['', 'ce2', '🦄', 'Prénom de ma petite']];
  $app.innerHTML = `${header('Configuration', '#/')}<div class="page">
    <div class="card"><h3>1. Code parent</h3><p class="muted">Il protège l’espace parent et la validation des récompenses.</p>
      <input id="pin" type="password" inputmode="numeric" maxlength="6" placeholder="4 à 6 chiffres"></div>
    <div class="card"><h3>2. Les enfants</h3>
      ${presets.map((p, i) => `<div class="kid-form"><select id="av${i}">${St.AVATARS.map((a) => `<option ${a === p[2] ? 'selected' : ''}>${a}</option>`).join('')}</select>
        <input id="n${i}" placeholder="${p[3]}"><select id="l${i}">${Object.entries(St.LEVELS).map(([k, v]) => `<option value="${k}" ${k === p[1] ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>`).join('')}
      <p class="muted">Laisse un prénom vide pour ne pas créer le profil.</p></div>
    <button class="btn wide" id="go">C’est parti 🚀</button></div>`;
  document.getElementById('go').onclick = () => {
    const pin = document.getElementById('pin').value.trim();
    if (!/^\d{4,6}$/.test(pin)) return toast('Le code doit faire 4 à 6 chiffres');
    S().pin = St.hashPin(pin);
    for (let i = 0; i < 3; i++) { const n = document.getElementById('n' + i).value.trim(); if (n) S().kids.push(St.newKid(n, document.getElementById('l' + i).value, document.getElementById('av' + i).value)); }
    if (!S().kids.length) return toast('Ajoute au moins un enfant');
    St.save(); parentUnlocked = true; toast('Famille configurée 🎉'); go('#/parent');
  };
}
async function importView(code) {
  try {
    const r = await St.importCode(code);
    history.replaceState(null, '', location.pathname + (r.type === 'setup' ? `#/k/${r.kid.id}` : '#/parent'));
    if (r.type === 'setup') { toast(`Bienvenue ${r.kid.name} ! Ton profil est prêt 🎉`, 3500); confetti(); }
    else if (r.type === 'report') toast(`Bilan de ${r.kid.name} mis à jour ✅`, 3500);
    else toast('Ce bilan est plus ancien que les données de cet appareil.');
    render();
  } catch (e) { console.error(e); toast('Lien invalide ou incomplet 😕', 4000); go('#/'); }
}

// ======================= Accueil enfant =======================
function kidHome(id) {
  const k = needKid(id); if (!k) return;
  if (k.remote) { go('#/parent/k/' + id); return; }
  S().lastKid = k.id; St.save();
  const d = k.days[St.today()] || { ms: 0, ok: 0, n: 0, missions: {} };
  const ms = St.missions(k); const due = St.dueCount(k);
  const greet = new Date().getHours() < 18 ? 'Salut' : 'Bonsoir';
  $app.innerHTML = `<div class="page">
    <header class="kid-top"><button class="icon" onclick="location.hash='#/'">⇦</button>
      <div class="who"><span class="av sm">${k.avatar}</span><div><b>${greet} ${esc(k.name)} !</b><small>${St.LEVELS[k.level].long}</small></div></div>
      <div class="pills"><span class="pill fire">🔥 ${St.liveStreak(k)}</span><span class="pill gem">💎 ${St.points(k)}</span></div></header>
    ${levelBar(k)}
    ${St.reportDue(k) && k.sessions.length ? `<button class="banner" id="rep">📨 Envoie ton bilan de la semaine à tes parents (+20 💎)</button>` : ''}
    <div class="today">${ring(d.ms / 60000, k.goalMin, `/ ${k.goalMin} min`)}
      <div class="missions"><h3>Missions du jour</h3>${ms.map((m) => { const [a, b] = m.prog(d); const done = d.missions && d.missions[m.id]; return `<div class="mission ${done ? 'done' : ''}"><span>${done ? '✅' : '◻️'}</span><p>${m.t}</p><small>${a}/${b}</small></div>`; }).join('')}</div></div>
    <button class="cta" onclick="location.hash='#/k/${k.id}/quiz/daily'">⚡ Défi du jour <small>10 questions toutes matières</small></button>
    ${due ? `<button class="cta alt" onclick="location.hash='#/k/${k.id}/quiz/review'">🔁 Révise tes erreurs <small>${due} question${due > 1 ? 's' : ''} à revoir</small></button>` : ''}
    <h2>Matières</h2>
    <div class="grid">${St.subjects(k).map((s) => { const ss = St.subjectStats(k)[s.key]; return `<button class="tile" style="--c:${s.color}" onclick="location.hash='${s.key === 'ia' ? `#/k/${k.id}/ia` : `#/k/${k.id}/quiz/train/${s.key}`}'"><span>${s.icon}</span><b>${s.name}</b><small>${ss ? pct(ss.ok / ss.n) + ' réussite' : 'À découvrir'}</small></button>`; }).join('')}</div>
    <div class="grid three">
      <button class="tile small" onclick="location.hash='#/k/${k.id}/rewards'"><span>🎁</span><b>Récompenses</b></button>
      <button class="tile small" onclick="location.hash='#/k/${k.id}/badges'"><span>🏅</span><b>Badges</b><small>${Object.keys(k.badges).length}/${St.BADGES.length}</small></button>
      <button class="tile small" onclick="location.hash='#/k/${k.id}/progress'"><span>📈</span><b>Mes progrès</b></button>
    </div>
    <button class="btn ghost wide" id="rep2">📨 Envoyer mon bilan aux parents</button>
  </div>`;
  const send = async () => { const first = St.reportDue(k); const url = await St.reportLink(k); if (first) { St.addXp(k, 20); St.save(); toast('+20 💎 merci !'); } render(); await share(`Bilan de ${k.name}`, `📚 Voici mon bilan scolaire (${St.LEVELS[k.level].label}) :`, url); };
  const r = document.getElementById('rep'); if (r) r.onclick = send;
  document.getElementById('rep2').onclick = send;
}

// ======================= Quiz =======================
let Q = null;
function quiz(id, mode, sub) {
  const k = needKid(id); if (!k) return;
  const n = k.level === 'ce2' ? 8 : 10;
  const list = St.buildSession(k, { subject: sub || null, mode: mode === 'daily' ? 'train' : mode, n });
  if (!list.length) { toast(mode === 'review' ? 'Rien à réviser pour l’instant, bravo ! 🎉' : 'Pas de questions disponibles'); go('#/k/' + id); return; }
  Q = { k, list, i: 0, ok: 0, combo: 0, xp: 0, ms: 0, mode, sub: sub || null, t0: Date.now(), answered: false, mistakes: [] };
  showQ();
}
function showQ() {
  const { k, list, i } = Q; const q = list[i]; Q.answered = false; Q.t0 = Date.now();
  const s = subOf(k, q.m);
  const numeric = !q.ch && q.a.every((x) => /^[\d\s.,]+$/.test(x));
  $app.innerHTML = `<div class="page quiz">
    <header class="top"><button class="icon" id="quit">✕</button><div class="qbar"><i style="width:${(i / list.length) * 100}%"></i></div><span class="pill">${i + 1}/${list.length}</span></header>
    <div class="qmeta"><span class="tag" style="--c:${s.color}">${s.icon} ${esc(s.name)}</span><span class="tag ghost">${esc(q.c)}</span>${Q.combo >= 3 ? `<span class="tag combo">🔥 x${Q.combo}</span>` : ''}</div>
    <div class="question">${esc(q.q)}</div>
    ${q.ch ? `<div class="choices">${q.ch.map((c, j) => `<button class="choice" data-j="${j}">${esc(c)}</button>`).join('')}</div>`
    : `<form class="answer" id="af"><input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" ${numeric ? 'inputmode="decimal"' : ''} placeholder="Ta réponse"><button class="btn">Valider</button></form><button class="link" id="idk">Je ne sais pas</button>`}
    <div id="fb"></div></div>`;
  document.getElementById('quit').onclick = () => { if (confirm('Quitter la séance ? Tes réponses sont déjà enregistrées.')) go('#/k/' + k.id); };
  if (q.ch) document.querySelectorAll('.choice').forEach((b) => { b.onclick = () => answer(+b.dataset.j); });
  else {
    const inp = document.getElementById('ans'); setTimeout(() => inp.focus(), 80);
    document.getElementById('af').onsubmit = (e) => { e.preventDefault(); if (inp.value.trim()) answer(inp.value); };
    document.getElementById('idk').onclick = () => answer('');
  }
}
function answer(val) {
  if (Q.answered) return; Q.answered = true;
  const q = Q.list[Q.i]; const ms = Date.now() - Q.t0;
  const ok = St.isCorrect(q, val);
  Q.combo = ok ? Q.combo + 1 : 0;
  const xp = St.recordAnswer(Q.k, q, ok, ms, Q.combo);
  Q.xp += xp; Q.ms += Math.min(ms, 120000); if (ok) Q.ok++; else Q.mistakes.push(q);
  buzz(ok ? 30 : [60, 40, 60]);
  const good = q.ch ? q.ch[q.a] : q.a[0];
  if (q.ch) document.querySelectorAll('.choice').forEach((b) => { const j = +b.dataset.j; b.disabled = true; if (j === q.a) b.classList.add('good'); else if (j === val) b.classList.add('bad'); });
  else { const inp = document.getElementById('ans'); inp.disabled = true; inp.classList.add(ok ? 'good' : 'bad'); document.getElementById('idk')?.remove(); document.querySelector('#af .btn').remove(); }
  const cheers = ['Bravo !', 'Excellent !', 'Super !', 'Génial !', 'Parfait !', 'Trop fort !'];
  document.getElementById('fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'ko'}">
    <b>${ok ? `✅ ${cheers[Math.floor(Math.random() * cheers.length)]} <span class="xp">+${xp} XP</span>` : `❌ La bonne réponse : <u>${esc(good)}</u>`}</b>
    <p>💡 ${esc(q.e)}</p><button class="btn wide" id="next">${Q.i + 1 < Q.list.length ? 'Suivant →' : 'Voir mon résultat 🏁'}</button></div>`;
  const nx = document.getElementById('next'); nx.focus({ preventScroll: true }); nx.scrollIntoView({ behavior: 'smooth', block: 'center' });
  nx.onclick = () => { Q.i++; if (Q.i < Q.list.length) showQ(); else finish(); };
}
function finish() {
  const { k, list, ok, xp, ms, mode, sub, mistakes } = Q;
  const r = St.endSession(k, { mode, sub: sub || (mode === 'daily' ? 'mix' : null), n: list.length, ok, ms, xp });
  const total = xp + r.bonus; const rate = ok / list.length;
  if (rate >= 0.7) confetti();
  const msg = rate === 1 ? 'Sans faute, incroyable ! 🌟' : rate >= 0.8 ? 'Très beau travail ! 💪' : rate >= 0.5 ? 'Bien joué, continue comme ça ! 👍' : 'Chaque erreur te fait progresser. On s’y remet ? 🌱';
  $app.innerHTML = `<div class="page center result">
    <div class="score">${ok}<small>/${list.length}</small></div><h2>${msg}</h2>
    <div class="pills big"><span class="pill gem">+${total} XP</span><span class="pill">⏱️ ${fmtMin(ms)}</span><span class="pill fire">🔥 ${St.liveStreak(k)} j</span></div>
    ${r.notes.length ? `<ul class="notes">${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    ${r.newBadges.map((b) => `<div class="badge-new"><span>${b.icon}</span><div><b>Nouveau badge : ${esc(b.name)}</b><small>${esc(b.desc)}</small></div></div>`).join('')}
    ${levelBar(k)}
    ${mistakes.length ? `<details class="card"><summary>Revoir mes erreurs (${mistakes.length})</summary>${mistakes.map((q) => `<div class="mist"><b>${esc(q.q)}</b><p>✔️ ${esc(q.ch ? q.ch[q.a] : q.a[0])}</p><small>${esc(q.e)}</small></div>`).join('')}</details>` : ''}
    <button class="btn wide" onclick="location.hash='#/k/${k.id}/quiz/${mode}${sub ? '/' + sub : ''}'">Rejouer ↻</button>
    <button class="btn ghost wide" onclick="location.hash='#/k/${k.id}'">Retour à l’accueil</button></div>`;
  if (r.newBadges.length) setTimeout(confetti, 600);
}

// ======================= Parcours IA =======================
function iaHub(id) {
  const k = needKid(id); if (!k) return; const tier = TIER_BY_LEVEL[k.level];
  const items = [
    ['lessons', '📚', 'Comprendre l’IA', `${k.ia.lessons.length}/${LESSONS[tier].length} leçons`],
    ['quiz', '❓', 'Quiz IA', 'Teste tes connaissances'],
    ['detective', '🕵️', 'Détective IA', `${k.ia.detective} erreur(s) démasquée(s)`],
    ['lab', '🪄', 'Labo de prompts', 'Apprends à bien parler à une IA'],
    ['box', '🧰', 'Boîte à prompts', 'Des prompts de révision prêts à l’emploi'],
    ['charter', '🛡️', 'Ma charte IA', k.ia.charter ? 'Signée ✅' : 'À signer'],
  ];
  $app.innerHTML = `${header('🤖 IA & moi', '#/k/' + id)}<div class="page">
    <div class="card intro"><p>${tier === 'junior' ? 'Découvre ce qu’est une IA, comment lui parler et comment rester prudent.' : tier === 'ado' ? 'L’IA sera partout dans ta vie. Apprends à t’en servir comme un pro : pour apprendre plus vite, sans te faire piéger.' : 'Compétence clé pour tes études et ton futur métier : piloter une IA, vérifier, rester éthique.'}</p></div>
    <div class="list">${items.map(([r, ic, t, s]) => `<button class="row-item" onclick="location.hash='${r === 'quiz' ? `#/k/${id}/quiz/ia` : `#/k/${id}/ia/${r}`}'"><span class="ic">${ic}</span><div><b>${t}</b><small>${s}</small></div><span>›</span></button>`).join('')}</div></div>`;
}
function iaLessons(id) {
  const k = needKid(id); if (!k) return; const L = LESSONS[TIER_BY_LEVEL[k.level]];
  $app.innerHTML = `${header('📚 Comprendre l’IA', `#/k/${id}/ia`)}<div class="page">${L.map((l, i) => { const done = k.ia.lessons.includes(i); return `<div class="card lesson ${done ? 'done' : ''}"><h3>${i + 1}. ${esc(l.t)}</h3><p>${esc(l.b)}</p>${done ? '<small>✅ Compris</small>' : `<button class="btn sm" data-i="${i}">J’ai compris (+15 XP)</button>`}</div>`; }).join('')}</div>`;
  document.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => { const i = +b.dataset.i; if (!k.ia.lessons.includes(i)) { k.ia.lessons.push(i); const r = St.markIaActivity(k, 15); toast('+15 XP 📚'); r.newBadges.forEach((x) => toast(`Badge : ${x.icon} ${x.name}`)); } render(); }; });
}
function iaDetective(id) {
  const k = needKid(id); if (!k) return; const list = DETECTIVE[TIER_BY_LEVEL[k.level]];
  const sc = list[Math.floor(Math.random() * list.length)];
  $app.innerHTML = `${header('🕵️ Détective IA', `#/k/${id}/ia`)}<div class="page">
    <p class="muted">Une IA a répondu à une question sur <b>${esc(sc.topic)}</b>. Elle a glissé <b>une erreur</b>. Trouve-la !</p>
    <div class="ai-bubble"><div class="ai-h">🤖 Réponse de l’IA</div>${sc.lines.map((l, i) => `<button class="ai-line" data-i="${i}">${esc(l)}</button>`).join('')}</div>
    <div id="fb"></div></div>`;
  document.querySelectorAll('.ai-line').forEach((b) => { b.onclick = () => {
    const i = +b.dataset.i; const ok = i === sc.bad;
    document.querySelectorAll('.ai-line').forEach((x) => { x.disabled = true; if (+x.dataset.i === sc.bad) x.classList.add('bad'); });
    if (ok) { k.ia.detective++; const r = St.markIaActivity(k, 20); r.newBadges.forEach((x) => toast(`Badge : ${x.icon} ${x.name}`)); confetti(); } else St.markIaActivity(k, 5);
    document.getElementById('fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'ko'}"><b>${ok ? '✅ Bien vu, détective ! +20 XP' : '❌ Raté ! L’erreur était en rouge. +5 XP pour l’effort'}</b><p>💡 ${esc(sc.e)}</p><p class="muted">Leçon : une IA peut se tromper avec beaucoup d’assurance. Vérifie toujours !</p><button class="btn wide" onclick="dispatchEvent(new HashChangeEvent('hashchange'))">Autre enquête 🔍</button></div>`;
  }; });
}
function iaLab(id) {
  const k = needKid(id); if (!k) return; const tier = TIER_BY_LEVEL[k.level]; const list = PROMPT_CHALLENGES[tier];
  let ci = +(sessionStorage.getItem('labi') || 0) % list.length; const ch = list[ci];
  $app.innerHTML = `${header('🪄 Labo de prompts', `#/k/${id}/ia`)}<div class="page">
    <div class="card"><small class="muted">Défi ${ci + 1}/${list.length} · meilleur score : ${'★'.repeat(k.ia.prompts[ci] || 0)}${'☆'.repeat(5 - (k.ia.prompts[ci] || 0))}</small><h3>🎯 ${esc(ch.goal)}</h3>
    <p class="muted">${tier === 'junior' ? 'Écris ta demande comme si tu parlais à l’IA. Dis qui tu es, ce que tu veux, et comment.' : 'Utilise la méthode R-C-T-F : Rôle, Contexte, Tâche, Format… et reste acteur de ton apprentissage !'}</p>
    <textarea id="pr" rows="6" placeholder="Écris ton prompt ici…"></textarea>
    <button class="btn wide" id="ev">Évaluer mon prompt</button></div><div id="res"></div>
    <div class="row"><button class="btn ghost" id="nx">Défi suivant →</button></div></div>`;
  document.getElementById('nx').onclick = () => { sessionStorage.setItem('labi', ci + 1); render(); };
  document.getElementById('ev').onclick = () => {
    const txt = document.getElementById('pr').value; if (txt.trim().length < 3) return toast('Écris d’abord ton prompt ✍️');
    const r = evaluatePrompt(txt, tier); const prev = k.ia.prompts[ci] || 0; let gain = 0;
    if (r.stars > prev) { gain = (r.stars - prev) * 10; k.ia.prompts[ci] = r.stars; }
    const res = St.markIaActivity(k, gain + 5); res.newBadges.forEach((x) => toast(`Badge : ${x.icon} ${x.name}`));
    if (r.stars >= 5) confetti();
    document.getElementById('res').innerHTML = `<div class="card"><div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div><h3>${r.verdict}</h3><small class="muted">+${gain + 5} XP</small>
      ${r.dangers.map((d) => `<p class="danger">⚠️ ${esc(d)}</p>`).join('')}
      <ul class="checks">${r.criteria.map((c) => `<li class="${c.ok ? 'ok' : ''}">${c.ok ? '✅' : '⬜'} ${c.label}</li>`).join('')}</ul>
      ${r.tips.length ? `<h4>Pour faire encore mieux :</h4><ul>${r.tips.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <details><summary>Voir un exemple de prompt réussi</summary><p class="example">${esc(ch.example)}</p></details></div>`;
  };
}
function iaBox(id) {
  const k = needKid(id); if (!k) return; const tier = TIER_BY_LEVEL[k.level]; const B = PROMPT_BOX[tier];
  $app.innerHTML = `${header('🧰 Boîte à prompts', `#/k/${id}/ia`)}<div class="page">
    <div class="card warn">${tier === 'junior' ? '👨‍👩‍👧 À utiliser uniquement <b>avec papa ou maman</b>, sur leur appareil.' : '👨‍👩‍👧 Utilise ces prompts dans une IA <b>avec l’accord de tes parents</b> et en respectant l’âge minimum du service. Remplace les [crochets] par ton sujet.'}</div>
    ${B.map((b, i) => `<div class="card"><h3>${esc(b.t)}</h3><p class="example">${esc(b.p)}</p><button class="btn sm" data-i="${i}">📋 Copier</button></div>`).join('')}</div>`;
  document.querySelectorAll('[data-i]').forEach((b) => { b.onclick = async () => { try { await navigator.clipboard.writeText(B[+b.dataset.i].p); toast('Prompt copié 📋'); } catch (e) { toast('Copie impossible, sélectionne le texte'); } }; });
}
function iaCharter(id) {
  const k = needKid(id); if (!k) return; const C = CHARTER[TIER_BY_LEVEL[k.level]];
  $app.innerHTML = `${header('🛡️ Ma charte IA', `#/k/${id}/ia`)}<div class="page"><div class="card charter"><h3>Je m’engage à :</h3><ol>${C.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>
    ${k.ia.charter ? `<p class="ok-txt">✅ Signée par ${esc(k.name)} le ${frDate(k.ia.charterDate)}</p>` : `<button class="btn wide" id="sign">✍️ Je signe ma charte (+50 XP)</button>`}</div></div>`;
  const b = document.getElementById('sign'); if (b) b.onclick = () => { k.ia.charter = true; k.ia.charterDate = St.today(); const r = St.markIaActivity(k, 50); confetti(); r.newBadges.forEach((x) => toast(`Badge : ${x.icon} ${x.name}`)); render(); };
}

// ======================= Récompenses / Badges / Progrès =======================
function rewards(id) {
  const k = needKid(id); if (!k) return;
  $app.innerHTML = `${header('🎁 Récompenses', '#/k/' + id)}<div class="page">
    <div class="card center"><div class="big-num">💎 ${St.points(k)}</div><small class="muted">points disponibles (1 XP gagné = 1 point)</small></div>
    ${S().rewards.map((r) => `<div class="reward"><span class="ic">${r.icon}</span><div><b>${esc(r.name)}</b><small>${r.cost} 💎</small></div><button class="btn sm" data-r="${r.id}" ${St.points(k) < r.cost ? 'disabled' : ''}>Demander</button></div>`).join('')}
    ${k.requests.length ? `<h2>Mes demandes</h2>${k.requests.slice(0, 10).map((q) => `<div class="reward ${q.st}"><span class="ic">${q.icon}</span><div><b>${esc(q.name)}</b><small>${frDate(q.d)} · ${q.st === 'attente' ? '⏳ en attente' : q.st === 'ok' ? '✅ validée' : '❌ refusée (points rendus)'}</small></div>${q.st === 'attente' ? `<button class="btn sm ghost" data-v="${q.id}">Parent : valider</button>` : ''}</div>`).join('')}` : ''}</div>`;
  document.querySelectorAll('[data-r]').forEach((b) => { b.onclick = () => { const r = S().rewards.find((x) => x.id === b.dataset.r); if (St.requestReward(k, r)) { toast('Demande envoyée ! Montre-la à ton parent 🙌'); render(); } }; });
  document.querySelectorAll('[data-v]').forEach((b) => { b.onclick = async () => { if (await pinPrompt('Valider la récompense')) { St.settleRequest(k, b.dataset.v, true); confetti(); render(); } }; });
}
function badges(id) {
  const k = needKid(id); if (!k) return;
  $app.innerHTML = `${header('🏅 Mes badges', '#/k/' + id)}<div class="page"><div class="badges">${St.BADGES.map((b) => `<div class="badge ${k.badges[b.id] ? 'got' : ''}"><span>${b.icon}</span><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`).join('')}</div></div>`;
}
function kidProgress(id) {
  const k = needKid(id); if (!k) return;
  $app.innerHTML = `${header('📈 Mes progrès', '#/k/' + id)}<div class="page">${progressBlocks(k, true)}</div>`;
}
function activityChart(k, nDays = 14) {
  const days = []; for (let i = nDays - 1; i >= 0; i--) { const d = St.addDays(St.today(), -i); days.push([d, k.days[d] || { ms: 0, n: 0, ok: 0 }]); }
  const max = Math.max(k.goalMin, ...days.map(([, x]) => x.ms / 60000));
  const W = 320, H = 120, bw = W / nDays;
  const goalY = H - 18 - (k.goalMin / max) * (H - 30);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${days.map(([d, x], i) => { const h = (x.ms / 60000 / max) * (H - 30); const ok = x.ms / 60000 >= k.goalMin; return `<rect x="${i * bw + 3}" y="${H - 18 - h}" width="${bw - 6}" height="${Math.max(h, 1)}" rx="3" class="${ok ? 'g' : ''}"><title>${d} : ${Math.round(x.ms / 60000)} min, ${x.ok}/${x.n}</title></rect><text x="${i * bw + bw / 2}" y="${H - 4}">${new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'narrow' })}</text>`; }).join('')}
    <line x1="0" x2="${W}" y1="${goalY}" y2="${goalY}" class="goal"/></svg><small class="muted">Minutes par jour (ligne = objectif de ${k.goalMin} min)</small>`;
}
function progressBlocks(k, kidView) {
  const w = St.rangeStats(k, 7), m = St.rangeStats(k, 30);
  const ss = St.subjectStats(k);
  const ch = St.chapterStats(k).filter((c) => c.n >= 2);
  const weak = St.weakChapters(k, 2).slice(0, 5);
  const strong = ch.filter((c) => c.rate >= 0.85 && c.n >= 4).sort((a, b) => b.n - a.n).slice(0, 5);
  return `<div class="stats4"><div><b>${w.min}</b><small>min / 7 j</small></div><div><b>${w.active}/7</b><small>jours actifs</small></div><div><b>${w.n ? pct(w.rate) : '—'}</b><small>réussite 7 j</small></div><div><b>${m.n}</b><small>questions / 30 j</small></div></div>
    <div class="card">${activityChart(k)}</div>
    <div class="card"><h3>Par matière</h3>${St.subjects(k).map((s) => { const x = ss[s.key]; const r = x ? x.ok / x.n : 0; return `<div class="hbar"><span>${s.icon} ${esc(s.name)}</span><div class="bar"><i style="width:${r * 100}%;background:${s.color}"></i></div><b>${x ? pct(r) : '—'}</b><small>${x ? x.n + ' q.' : ''}</small></div>`; }).join('')}</div>
    <div class="card"><h3>${kidView ? '💪 À renforcer' : '⚠️ Points à renforcer'}</h3>${weak.length ? weak.map((c) => `<div class="hbar"><span>${subOf(k, c.m).icon} ${esc(c.c)}</span><div class="bar"><i class="red" style="width:${c.rate * 100}%"></i></div><b>${pct(c.rate)}</b></div>`).join('') : '<p class="muted">Rien de particulier pour l’instant 👏</p>'}
      ${kidView && weak.length ? `<button class="btn wide" onclick="location.hash='#/k/${k.id}/quiz/review'">S’entraîner dessus</button>` : ''}</div>
    <div class="card"><h3>⭐ Points forts</h3>${strong.length ? strong.map((c) => `<span class="chip">${subOf(k, c.m).icon} ${esc(c.c)} · ${pct(c.rate)}</span>`).join('') : '<p class="muted">Encore un peu d’entraînement pour les révéler !</p>'}</div>`;
}

// ======================= Espace parent =======================
async function parentGate() {
  if (parentUnlocked) return true;
  if (!S().pin) return true;
  const ok = await pinPrompt('Espace parent'); if (ok) parentUnlocked = true; else go('#/');
  return ok;
}
function insights(k) {
  const w = St.rangeStats(k, 7), prev = (() => { let n = 0, ok = 0, ms = 0; for (let i = 7; i < 14; i++) { const d = k.days[St.addDays(St.today(), -i)]; if (d) { n += d.n; ok += d.ok; ms += d.ms; } } return { n, ok, ms, rate: n ? ok / n : 0 }; })();
  const out = [];
  if (!k.sessions.length) return ['🕐 Pas encore d’activité. Installe l’app sur son téléphone via « Lien d’installation ».'];
  if (w.active >= 5) out.push(`🏆 Très régulier·e : ${w.active} jours actifs sur 7. Pensez à le/la féliciter !`);
  else if (w.active <= 2) out.push(`📅 Régularité à travailler : ${w.active} jour(s) actif(s) cette semaine. Fixez un créneau fixe (ex : 15 min après le goûter).`);
  if (prev.n && w.n) { const d = Math.round((w.rate - prev.rate) * 100); if (d >= 5) out.push(`📈 Réussite en hausse de ${d} points vs la semaine dernière.`); else if (d <= -5) out.push(`📉 Réussite en baisse de ${-d} points : des notions plus difficiles ou de la fatigue ?`); }
  if (prev.ms && w.ms) { const d = Math.round(((w.ms - prev.ms) / prev.ms) * 100); if (Math.abs(d) >= 25) out.push(`${d > 0 ? '⏫' : '⏬'} Temps de travail ${d > 0 ? '+' : ''}${d} % vs semaine précédente.`); }
  const weak = St.weakChapters(k).slice(0, 3);
  if (weak.length) out.push(`🎯 À renforcer en priorité : ${weak.map((c) => `${c.c} (${pct(c.rate)})`).join(', ')}. L’app les propose automatiquement en révision.`);
  const ia = k.ia; if (!ia.charter) out.push('🤖 La charte IA n’est pas encore signée : à faire ensemble, c’est un bon moment d’échange.');
  else if (ia.detective < 3) out.push('🕵️ Encouragez le « Détective IA » : il développe l’esprit critique face aux réponses des IA.');
  const pend = k.requests.filter((r) => r.st === 'attente'); if (pend.length) out.push(`🎁 ${pend.length} récompense(s) en attente de validation.`);
  return out;
}
async function parentHome() {
  if (!(await parentGate())) return;
  const kids = S().kids;
  $app.innerHTML = `${header('👨‍👩‍👧‍👦 Espace parent', '#/')}<div class="page">
    ${kids.map((k) => { const w = St.rangeStats(k, 7); const d = k.days[St.today()] || { ms: 0 }; const pend = k.requests.filter((r) => r.st === 'attente').length; return `<button class="pcard" onclick="location.hash='#/parent/k/${k.id}'">
      <div class="pc-h"><span class="av sm">${k.avatar}</span><div><b>${esc(k.name)}</b><small>${St.LEVELS[k.level].label} · Niv. ${St.levelInfo(k.xp).lvl} ${k.remote ? `· 📡 bilan du ${new Date(k.reportAt || k.updated).toLocaleDateString('fr-FR')}` : ''}</small></div>${pend ? `<span class="pill gem">🎁 ${pend}</span>` : ''}</div>
      <div class="stats4 mini"><div><b>${k.remote ? '—' : fmtMin(d.ms)}</b><small>aujourd’hui</small></div><div><b>${w.min} min</b><small>7 jours</small></div><div><b>${w.n ? pct(w.rate) : '—'}</b><small>réussite</small></div><div><b>🔥 ${St.liveStreak(k)}</b><small>série</small></div></div>
      <p class="insight">${esc(insights(k)[0] || '')}</p></button>`; }).join('')}
    <div class="card"><h3>📲 Comment ça marche ?</h3><ol class="howto"><li>Pour chaque enfant : <b>Détail → Lien d’installation</b>, envoyé par WhatsApp/SMS sur son téléphone.</li><li>Il ouvre le lien, puis « Ajouter à l’écran d’accueil ».</li><li>Chaque semaine, il t’envoie son <b>bilan</b> (bouton dans son app) : tu l’ouvres, ton tableau de bord se met à jour.</li><li>Si vous partagez une tablette, tout est déjà à jour ici.</li></ol></div>
    <div class="row"><button class="btn ghost" onclick="location.hash='#/parent/settings'">⚙️ Réglages & récompenses</button><button class="btn ghost" id="add">➕ Ajouter un enfant</button></div></div>`;
  document.getElementById('add').onclick = () => kidEditor();
}
async function parentKid(id) {
  if (!(await parentGate())) return;
  const k = St.kidById(id); if (!k) return go('#/parent');
  const pend = k.requests.filter((r) => r.st === 'attente');
  $app.innerHTML = `${header(`${k.avatar} ${esc(k.name)}`, '#/parent')}<div class="page">
    <div class="card"><div class="pc-h"><div><b>${St.LEVELS[k.level].long}</b><small>Niveau ${St.levelInfo(k.xp).lvl} · ${k.xp} XP · série record ${k.best} j · objectif ${k.goalMin} min/j</small></div></div>
      ${k.remote ? `<p class="muted">📡 Données issues du dernier bilan reçu (${new Date(k.reportAt || k.updated).toLocaleString('fr-FR')}).</p>` : ''}</div>
    <div class="card insights"><h3>🧭 Analyse & conseils</h3>${insights(k).map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    ${progressBlocks(k, false)}
    ${pend.length ? `<div class="card"><h3>🎁 Demandes en attente</h3>${pend.map((q) => `<div class="reward"><span class="ic">${q.icon}</span><div><b>${esc(q.name)}</b><small>${q.cost} 💎 · ${frDate(q.d)}</small></div>${k.remote ? '<small>à valider sur son appareil</small>' : `<button class="btn sm" data-ok="${q.id}">✔</button><button class="btn sm ghost" data-no="${q.id}">✕</button>`}</div>`).join('')}</div>` : ''}
    <div class="card"><h3>🤖 Compétences IA</h3><div class="stats4 mini"><div><b>${k.ia.lessons.length}</b><small>leçons</small></div><div><b>${k.ia.detective}</b><small>erreurs d’IA trouvées</small></div><div><b>${Math.max(0, ...Object.values(k.ia.prompts))}/5</b><small>meilleur prompt</small></div><div><b>${k.ia.charter ? '✅' : '—'}</b><small>charte</small></div></div></div>
    <div class="card"><h3>🕒 Dernières séances</h3>${k.sessions.slice(0, 8).map((s) => `<div class="sess"><span>${frDate(s.d)}</span><span>${s.sub === 'mix' || !s.sub ? (s.mode === 'review' ? '🔁 Révision' : '⚡ Défi') : subOf(k, s.sub).icon + ' ' + esc(subOf(k, s.sub).name)}</span><b>${s.ok}/${s.n}</b><small>${fmtMin(s.ms)}</small></div>`).join('') || '<p class="muted">Aucune séance.</p>'}</div>
    <div class="card"><h3>🏅 Badges (${Object.keys(k.badges).length}/${St.BADGES.length})</h3>${St.BADGES.filter((b) => k.badges[b.id]).map((b) => `<span class="chip">${b.icon} ${esc(b.name)}</span>`).join('') || '<p class="muted">Pas encore de badge.</p>'}</div>
    <button class="btn wide" id="setup">📲 Envoyer le lien d’installation</button>
    <div class="row"><button class="btn ghost" id="edit">✏️ Modifier</button>${!k.remote ? `<button class="btn ghost" onclick="location.hash='#/k/${k.id}'">👀 Voir son app</button>` : ''}</div></div>`;
  document.getElementById('setup').onclick = async () => share(`Mon École — ${k.name}`, `${k.avatar} ${k.name}, voici ton application de révisions ! Ouvre ce lien puis ajoute-la à ton écran d’accueil :`, await St.setupLink(k));
  document.getElementById('edit').onclick = () => kidEditor(k);
  document.querySelectorAll('[data-ok]').forEach((b) => { b.onclick = () => { St.settleRequest(k, b.dataset.ok, true); render(); }; });
  document.querySelectorAll('[data-no]').forEach((b) => { b.onclick = () => { St.settleRequest(k, b.dataset.no, false); render(); }; });
}
function kidEditor(k) {
  const isNew = !k; k = k || { name: '', level: '3e', avatar: '🦊', goalMin: 20 };
  const m = modal(`<h3>${isNew ? 'Nouvel enfant' : 'Modifier ' + esc(k.name)}</h3>
    <label>Prénom<input id="e-n" value="${esc(k.name)}"></label>
    <label>Classe<select id="e-l">${Object.entries(St.LEVELS).map(([key, v]) => `<option value="${key}" ${key === k.level ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
    <label>Avatar<select id="e-a">${St.AVATARS.map((a) => `<option ${a === k.avatar ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
    <label>Objectif quotidien (minutes)<input id="e-g" type="number" min="5" max="120" value="${k.goalMin}"></label>
    <div class="row">${!isNew ? '<button class="btn ghost danger" id="e-del">Supprimer</button>' : ''}<button class="btn ghost" data-close>Annuler</button><button class="btn" id="e-ok">Enregistrer</button></div>`);
  m.querySelector('#e-ok').onclick = () => {
    const name = m.querySelector('#e-n').value.trim(); if (!name) return toast('Prénom requis');
    const vals = { name, level: m.querySelector('#e-l').value, avatar: m.querySelector('#e-a').value, goalMin: Math.max(5, +m.querySelector('#e-g').value || 15) };
    if (isNew) S().kids.push(St.newKid(vals.name, vals.level, vals.avatar)); else Object.assign(k, vals);
    if (isNew) Object.assign(S().kids[S().kids.length - 1], { goalMin: vals.goalMin });
    St.save(); m.remove(); toast('Enregistré ✅'); render();
  };
  const del = m.querySelector('#e-del'); if (del) del.onclick = () => { if (confirm(`Supprimer définitivement le profil de ${k.name} sur cet appareil ?`)) { S().kids = S().kids.filter((x) => x.id !== k.id); St.save(); m.remove(); go('#/parent'); } };
}
async function parentSettings() {
  if (!(await parentGate())) return;
  $app.innerHTML = `${header('⚙️ Réglages', '#/parent')}<div class="page">
    <div class="card"><h3>🎁 Récompenses</h3><p class="muted">1 bonne réponse ≈ 10 à 20 points. Une séance ≈ 100 à 200 points.</p>
      <div id="rw">${S().rewards.map((r, i) => `<div class="rw-edit"><input value="${esc(r.icon)}" data-f="icon" data-i="${i}" class="emo"><input value="${esc(r.name)}" data-f="name" data-i="${i}"><input type="number" value="${r.cost}" data-f="cost" data-i="${i}" class="num"><button class="icon" data-del="${i}">🗑️</button></div>`).join('')}</div>
      <div class="row"><button class="btn ghost" id="rw-add">➕ Ajouter</button><button class="btn" id="rw-save">Enregistrer</button></div>
      <p class="muted">Après modification, renvoie le lien d’installation aux enfants pour mettre à jour leurs récompenses (leur progression est conservée).</p></div>
    <div class="card"><h3>🔒 Code parent</h3><input id="newpin" type="password" inputmode="numeric" maxlength="6" placeholder="Nouveau code"><button class="btn" id="pin-save">Changer le code</button></div>
    <div class="card"><h3>💾 Sauvegarde</h3><p class="muted">Les données sont stockées sur cet appareil. Fais une sauvegarde de temps en temps.</p>
      <div class="row"><button class="btn ghost" id="exp">⬇️ Exporter</button><label class="btn ghost">⬆️ Importer<input type="file" id="imp" accept=".json" hidden></label></div></div>
    <div class="card"><h3>ℹ️ Version</h3><p class="muted">L’application se met à jour automatiquement à chaque ouverture quand une nouvelle version est publiée. Version : <span id="ver"></span></p>
      <button class="btn ghost danger" id="reset">Tout réinitialiser sur cet appareil</button></div></div>`;
  document.getElementById('ver').textContent = window.APP_VERSION || '';
  const collect = () => { document.querySelectorAll('#rw [data-f]').forEach((inp) => { const r = S().rewards[+inp.dataset.i]; r[inp.dataset.f] = inp.dataset.f === 'cost' ? Math.max(1, +inp.value || 1) : inp.value; }); };
  document.getElementById('rw-add').onclick = () => { collect(); S().rewards.push({ id: 'r' + Date.now().toString(36), name: 'Nouvelle récompense', icon: '🎁', cost: 300 }); St.save(); render(); };
  document.getElementById('rw-save').onclick = () => { collect(); St.save(); toast('Récompenses enregistrées ✅'); };
  document.querySelectorAll('[data-del]').forEach((b) => { b.onclick = () => { collect(); S().rewards.splice(+b.dataset.del, 1); St.save(); render(); }; });
  document.getElementById('pin-save').onclick = () => { const p = document.getElementById('newpin').value; if (!/^\d{4,6}$/.test(p)) return toast('4 à 6 chiffres'); S().pin = St.hashPin(p); St.save(); toast('Code modifié ✅'); };
  document.getElementById('exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S())], { type: 'application/json' })); a.download = `mon-ecole-sauvegarde-${St.today()}.json`; a.click(); };
  document.getElementById('imp').onchange = async (e) => { try { const o = JSON.parse(await e.target.files[0].text()); if (!o.v || !Array.isArray(o.kids)) throw 0; if (confirm('Remplacer les données de cet appareil par la sauvegarde ?')) { St.replaceState(o); toast('Sauvegarde restaurée ✅'); go('#/parent'); } } catch (x) { toast('Fichier invalide'); } };
  document.getElementById('reset').onclick = () => { if (confirm('Effacer TOUTES les données sur cet appareil ?') && confirm('Vraiment sûr ?')) { St.resetAll(); parentUnlocked = false; go('#/'); } };
}

// ======================= Démarrage =======================
if (!location.hash && S().lastKid && St.kidById(S().lastKid) && !St.kidById(S().lastKid).remote) location.hash = '#/k/' + S().lastKid;
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.update();
    reg.addEventListener('updatefound', () => { const nw = reg.installing; nw && nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) toast('✨ Nouvelle version installée', 2500); }); });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return; reloaded = true;
    if (!location.hash.includes('/quiz/')) location.reload();
  });
}
