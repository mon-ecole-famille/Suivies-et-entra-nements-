// État, persistance, progression, répétition espacée, badges, rapports.
import * as CE2 from './data/ce2.js';
import * as TROIS from './data/3e.js';
import * as ST2S from './data/1st2s.js';
import { IA_QUESTIONS, TIER_BY_LEVEL } from './data/ia.js';
import { GENERATORS_BY_LEVEL, generate } from './generators.js';

export const LEVELS = {
  ce2: { label: 'CE2', long: 'CE2 — primaire', data: CE2 },
  '3e': { label: '3e', long: '3e — objectif brevet', data: TROIS },
  '1st2s': { label: '1re ST2S', long: '1re ST2S — objectif bac', data: ST2S },
};

const KEY = 'suivi-scolaire.v1';
const DAY = 86400000;
export const today = (d = new Date()) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
export const addDays = (iso, n) => today(new Date(new Date(iso + 'T12:00:00').getTime() + n * DAY));
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------- Persistance ----------------
const blank = () => ({ v: 1, pin: null, kids: [], rewards: defaultRewards(), lastKid: null });
export function defaultRewards() {
  return [
    { id: 'r1', name: '30 min d’écran en plus', icon: '📱', cost: 300 },
    { id: 'r2', name: 'Choisir le dessert', icon: '🍰', cost: 200 },
    { id: 'r3', name: 'Choisir le film du week-end', icon: '🎬', cost: 500 },
    { id: 'r4', name: 'Sortie au choix', icon: '🎡', cost: 1500 },
  ];
}
export let S = load();
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v) return s; } catch (e) { /* ignore */ }
  return blank();
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn(e); } }
export function resetAll() { S = blank(); save(); }
export function replaceState(obj) { S = obj; save(); }

// Hash simple pour le code parent (verrou familial, pas un coffre-fort)
export function hashPin(pin) { let h = 5381; for (const c of String(pin) + '|ecole') h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return h.toString(36); }
export const checkPin = (pin) => S.pin && hashPin(pin) === S.pin;

// ---------------- Profils ----------------
export const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🦄', '🐬', '🦉', '🐙', '🚀', '⚽', '🎮', '🎨', '🎧', '🌸', '🐱'];
export function newKid(name, level, avatar, id) {
  return {
    id: id || uid(), name, level, avatar: avatar || '🦊', goalMin: level === 'ce2' ? 10 : level === '3e' ? 20 : 25,
    xp: 0, spent: 0, streak: 0, best: 0, lastDay: null, freeze: 1,
    days: {}, stats: {}, leitner: {}, badges: {}, sessions: [], requests: [],
    ia: { lessons: [], detective: 0, prompts: {}, charter: false }, lastReport: null, updated: Date.now(),
  };
}
export const kidById = (id) => S.kids.find((k) => k.id === id);

// ---------------- Niveaux & XP ----------------
const TITLES = ['Débutant', 'Apprenti', 'Explorateur', 'Aventurier', 'Stratège', 'Expert', 'Champion', 'Maître', 'Légende', 'Génie'];
export function levelInfo(xp) {
  let lvl = 1, need = 100, acc = 0;
  while (xp >= acc + need) { acc += need; lvl++; need = 100 + (lvl - 1) * 60; }
  return { lvl, cur: xp - acc, need, title: TITLES[Math.min(TITLES.length - 1, Math.floor((lvl - 1) / 2))] };
}
export const points = (k) => k.xp - k.spent;

// ---------------- Contenus ----------------
export function pool(kid) {
  const lv = LEVELS[kid.level];
  return [...lv.data.QUESTIONS, ...IA_QUESTIONS[TIER_BY_LEVEL[kid.level]]];
}
export const subjects = (kid) => LEVELS[kid.level].data.SUBJECTS;
const genMeta = {};
function gensFor(level) {
  if (!genMeta[level]) genMeta[level] = GENERATORS_BY_LEVEL[level].map((k) => { const q = generate(k); return { k, m: q.m, c: q.c }; });
  return genMeta[level];
}

// ---------------- Répétition espacée (Leitner) ----------------
const INTERVALS = [0, 1, 2, 4, 8, 16, 32];
function leitnerUpdate(kid, qid, ok) {
  const L = kid.leitner[qid] || { b: 0, due: today() };
  L.b = ok ? Math.min(6, L.b + 1) : 1;
  L.due = addDays(today(), ok ? INTERVALS[L.b] : 1);
  kid.leitner[qid] = L;
}
export function dueCount(kid) {
  const t = today(); const ids = new Set(pool(kid).map((q) => q.id));
  return Object.entries(kid.leitner).filter(([id, L]) => ids.has(id) && L.due <= t && L.b < 6).length;
}

// ---------------- Statistiques ----------------
const skey = (q) => `${q.m}|${q.c}`;
export function chapterStats(kid) {
  return Object.entries(kid.stats).map(([k, v]) => { const [m, c] = k.split('|'); return { m, c, n: v.n, ok: v.ok, rate: v.n ? v.ok / v.n : 0, last: v.last }; });
}
export function weakChapters(kid, min = 3) {
  return chapterStats(kid).filter((s) => s.n >= min && s.rate < 0.75).sort((a, b) => a.rate - b.rate);
}
export function subjectStats(kid) {
  const out = {};
  for (const s of chapterStats(kid)) { out[s.m] = out[s.m] || { n: 0, ok: 0 }; out[s.m].n += s.n; out[s.m].ok += s.ok; }
  return out;
}
export function rangeStats(kid, nDays) {
  let n = 0, ok = 0, ms = 0, active = 0;
  for (let i = 0; i < nDays; i++) { const d = kid.days[addDays(today(), -i)]; if (d) { n += d.n; ok += d.ok; ms += d.ms; if (d.n) active++; } }
  return { n, ok, ms, min: Math.round(ms / 60000), rate: n ? ok / n : 0, active };
}

// ---------------- Construction des séances ----------------
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function buildSession(kid, { subject = null, mode = 'train', n = 10 } = {}) {
  const t = today();
  let P = pool(kid).filter((q) => !subject || q.m === subject);
  let gens = gensFor(kid.level).filter((g) => !subject || g.m === subject);
  if (mode === 'ia') { P = pool(kid).filter((q) => q.m === 'ia'); gens = []; }
  const due = shuffle(P.filter((q) => kid.leitner[q.id] && kid.leitner[q.id].due <= t && kid.leitner[q.id].b < 6)).sort((a, b) => kid.leitner[a.id].b - kid.leitner[b.id].b);
  const fresh = shuffle(P.filter((q) => !kid.leitner[q.id]));
  const weak = weakChapters(kid, 2).filter((w) => !subject || w.m === subject);
  const weakKeys = new Set(weak.map((w) => `${w.m}|${w.c}`));
  const weakQs = shuffle(P.filter((q) => weakKeys.has(skey(q))));
  const weakGens = gens.filter((g) => weakKeys.has(`${g.m}|${g.c}`));
  const out = []; const used = new Set();
  const push = (q) => { if (q && out.length < n && !used.has(q.id)) { out.push(q); used.add(q.id); return true; } return false; };
  const pushGen = (g) => { if (out.length < n) out.push(generate(g.k)); };

  if (mode === 'review') {
    due.forEach(push);
    weakQs.forEach(push);
    while (out.length < n && weakGens.length) pushGen(weakGens[Math.floor(Math.random() * weakGens.length)]);
  } else {
    const nDue = Math.round(n * 0.3), nWeak = Math.round(n * 0.2);
    due.slice(0, nDue).forEach(push);
    weakQs.slice(0, nWeak).forEach(push);
    for (let i = 0; i < 2 && weakGens.length; i++) pushGen(weakGens[Math.floor(Math.random() * weakGens.length)]);
    // équilibre : moitié banque nouvelle, moitié générateurs (si dispo)
    let fi = 0;
    while (out.length < n) {
      const useGen = gens.length && (fi >= fresh.length || Math.random() < (subject === 'maths' ? 0.65 : 0.3));
      if (useGen) pushGen(gens[Math.floor(Math.random() * gens.length)]);
      else if (fi < fresh.length) push(fresh[fi++]);
      else { const rest = shuffle(P.filter((q) => !used.has(q.id))); if (!rest.length) break; push(rest[0]); }
    }
  }
  if (!out.length && P.length) shuffle(P).slice(0, n).forEach(push);
  return shuffle(out).map((q) => (q.ch && !q.gen ? shuffleChoices(q) : q));
}
function shuffleChoices(q) {
  const idx = shuffle(q.ch.map((_, i) => i));
  return { ...q, ch: idx.map((i) => q.ch[i]), a: idx.indexOf(q.a) };
}

// ---------------- Correction ----------------
export const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’`]/g, "'").replace(/−/g, '-').replace(/\s+/g, ' ').replace(/[.!]$/, '').trim().replace(/^(il|elle|on) /, '');
const numNorm = (s) => norm(s).replace(',', '.').replace(/\s/g, '').replace(/^\+/, '');
export function isCorrect(q, answer) {
  if (q.ch) return answer === q.a;
  const a = norm(answer); if (!a) return false;
  return q.a.some((g) => { const n = norm(g); if (n === a) return true; const x = parseFloat(numNorm(g)), y = parseFloat(numNorm(answer)); return !isNaN(x) && /^-?[\d.]+$/.test(numNorm(answer)) && Math.abs(x - y) < 1e-9; });
}

// ---------------- Enregistrement d'une réponse / séance ----------------
function dayRec(kid) { const t = today(); kid.days[t] = kid.days[t] || { n: 0, ok: 0, ms: 0, xp: 0, sessions: 0, missions: {} }; return kid.days[t]; }
export function recordAnswer(kid, q, ok, ms, combo) {
  const d = dayRec(kid);
  ms = Math.min(ms, 120000);
  d.n++; d.ms += ms; if (ok) d.ok++;
  const k = skey(q); const st = kid.stats[k] || { n: 0, ok: 0 }; st.n++; if (ok) st.ok++; st.last = today(); kid.stats[k] = st;
  if (!q.gen) leitnerUpdate(kid, q.id, ok);
  let xp = 0; if (ok) xp = 10 + (combo >= 3 ? 5 : 0) + (combo >= 6 ? 5 : 0);
  addXp(kid, xp);
  touchStreak(kid);
  kid.updated = Date.now();
  save();
  return xp;
}
export function addXp(kid, xp) { kid.xp += xp; dayRec(kid).xp += xp; }

function touchStreak(kid) {
  const t = today();
  if (kid.lastDay === t) return;
  const y = addDays(t, -1), y2 = addDays(t, -2);
  if (kid.lastDay === y) kid.streak++;
  else if (kid.lastDay === y2 && kid.freeze > 0) { kid.freeze--; kid.streak++; }
  else kid.streak = 1;
  kid.best = Math.max(kid.best, kid.streak);
  if (kid.streak % 7 === 0) kid.freeze = Math.min(3, kid.freeze + 1); // 1 joker gagné par semaine complète
  kid.lastDay = t;
}
export function liveStreak(kid) {
  if (!kid.lastDay) return 0;
  const t = today();
  if (kid.lastDay === t || kid.lastDay === addDays(t, -1) || (kid.lastDay === addDays(t, -2) && kid.freeze > 0)) return kid.streak;
  return 0;
}

export function endSession(kid, info) {
  const d = dayRec(kid);
  let bonus = 0; const notes = [];
  if (d.sessions === 0) { bonus += 20; notes.push('Première séance du jour +20'); }
  d.sessions++;
  if (info.n >= 8 && info.ok === info.n) { bonus += 30; notes.push('Sans faute ! +30'); }
  const goalMs = kid.goalMin * 60000;
  if (!d.goalDone && d.ms >= goalMs) { d.goalDone = true; bonus += 50; notes.push('Objectif du jour atteint +50'); }
  addXp(kid, bonus);
  kid.sessions.unshift({ d: today(), t: Date.now(), ...info, xp: info.xp + bonus });
  kid.sessions = kid.sessions.slice(0, 60);
  const missionsXp = checkMissions(kid, info);
  if (missionsXp.xp) notes.push(...missionsXp.notes);
  const newBadges = checkBadges(kid, info);
  save();
  return { bonus: bonus + missionsXp.xp, notes, newBadges };
}

// ---------------- Missions du jour ----------------
function seeded(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
export function missions(kid) {
  const rnd = seeded(kid.id + today());
  const subs = subjects(kid).filter((s) => s.key !== 'ia');
  const weak = weakChapters(kid)[0];
  const sub = weak ? subs.find((s) => s.key === weak.m) || subs[0] : subs[Math.floor(rnd() * subs.length)];
  const target = kid.level === 'ce2' ? 10 : 15;
  const all = [
    { id: 'correct', t: `Réponds juste à ${target} questions`, check: (d) => d.ok >= target, prog: (d) => [Math.min(d.ok, target), target] },
    { id: 'sub', t: `Fais une séance de ${sub.name} ${sub.icon}`, check: (d) => (d.subs || []).includes(sub.key), prog: (d) => [(d.subs || []).includes(sub.key) ? 1 : 0, 1] },
    { id: 'review', t: 'Fais une séance « Révise tes erreurs » 🔁', check: (d) => (d.modes || []).includes('review'), prog: (d) => [(d.modes || []).includes('review') ? 1 : 0, 1] },
    { id: 'ia', t: 'Relève un défi IA 🤖', check: (d) => d.iaDone, prog: (d) => [d.iaDone ? 1 : 0, 1] },
    { id: 'goal', t: `Atteins ton objectif de ${kid.goalMin} min ⏱️`, check: (d) => d.goalDone, prog: (d) => [Math.min(Math.round(d.ms / 60000), kid.goalMin), kid.goalMin] },
  ];
  const pickN = [all[0], all[1]];
  const rest = all.slice(2); pickN.push(rest[Math.floor(rnd() * rest.length)]);
  return pickN;
}
function checkMissions(kid, info) {
  const d = dayRec(kid);
  d.subs = d.subs || []; d.modes = d.modes || [];
  if (info.sub && !d.subs.includes(info.sub)) d.subs.push(info.sub);
  if (info.mode && !d.modes.includes(info.mode)) d.modes.push(info.mode);
  if (info.sub === 'ia' || info.mode === 'ia') d.iaDone = true;
  return claimMissions(kid);
}
export function claimMissions(kid) {
  const d = dayRec(kid); let xp = 0; const notes = [];
  for (const m of missions(kid)) if (!d.missions[m.id] && m.check(d)) { d.missions[m.id] = 1; xp += 30; notes.push(`Mission accomplie : ${m.t} +30`); }
  const allDone = missions(kid).every((m) => d.missions[m.id]);
  if (allDone && !d.missions.all) { d.missions.all = 1; xp += 50; notes.push('Toutes les missions du jour ! +50'); }
  addXp(kid, xp);
  return { xp, notes };
}
export function markIaActivity(kid, xp) { const d = dayRec(kid); d.iaDone = true; addXp(kid, xp); touchStreak(kid); const r = claimMissions(kid); const b = checkBadges(kid, {}); kid.updated = Date.now(); save(); return { ...r, newBadges: b }; }

// ---------------- Badges ----------------
export const BADGES = [
  { id: 'first', icon: '🌱', name: 'Premier pas', desc: 'Terminer sa première séance', test: (k) => k.sessions.length >= 1 },
  { id: 's3', icon: '🔥', name: 'En feu', desc: '3 jours de suite', test: (k) => k.best >= 3 },
  { id: 's7', icon: '⚡', name: 'Semaine parfaite', desc: '7 jours de suite', test: (k) => k.best >= 7 },
  { id: 's30', icon: '🏆', name: 'Inarrêtable', desc: '30 jours de suite', test: (k) => k.best >= 30 },
  { id: 'q100', icon: '💯', name: 'Centurion', desc: '100 bonnes réponses', test: (k) => totalOk(k) >= 100 },
  { id: 'q500', icon: '🧠', name: 'Cerveau d’acier', desc: '500 bonnes réponses', test: (k) => totalOk(k) >= 500 },
  { id: 'q2000', icon: '🚀', name: 'Fusée', desc: '2 000 bonnes réponses', test: (k) => totalOk(k) >= 2000 },
  { id: 'perfect', icon: '🎯', name: 'Sans faute', desc: 'Une séance de 10 sans erreur', test: (k, i) => i && i.n >= 10 && i.ok === i.n },
  { id: 'review', icon: '🔁', name: 'Revanche', desc: 'Faire 5 séances de révision des erreurs', test: (k) => k.sessions.filter((s) => s.mode === 'review').length >= 5 },
  { id: 'allsub', icon: '🌈', name: 'Touche-à-tout', desc: 'Pratiquer toutes les matières', test: (k) => subjects(k).every((s) => Object.keys(k.stats).some((x) => x.startsWith(s.key + '|'))) },
  { id: 'lvl5', icon: '⭐', name: 'Niveau 5', desc: 'Atteindre le niveau 5', test: (k) => levelInfo(k.xp).lvl >= 5 },
  { id: 'lvl10', icon: '🌟', name: 'Niveau 10', desc: 'Atteindre le niveau 10', test: (k) => levelInfo(k.xp).lvl >= 10 },
  { id: 'charter', icon: '🛡️', name: 'Citoyen numérique', desc: 'Signer la charte IA', test: (k) => k.ia.charter },
  { id: 'detect', icon: '🕵️', name: 'Détective IA', desc: 'Démasquer 5 erreurs d’IA', test: (k) => k.ia.detective >= 5 },
  { id: 'prompt', icon: '🪄', name: 'Maître du prompt', desc: 'Obtenir 5/5 au labo de prompts', test: (k) => Object.values(k.ia.prompts).some((v) => v >= 5) },
  { id: 'lessons', icon: '📚', name: 'Expert IA', desc: 'Lire toutes les leçons IA', test: (k) => k.ia.lessons.length >= 6 },
  { id: 'goal5', icon: '⏱️', name: 'Régulier', desc: 'Atteindre son objectif 5 jours', test: (k) => Object.values(k.days).filter((d) => d.goalDone).length >= 5 },
];
const totalOk = (k) => Object.values(k.days).reduce((a, d) => a + d.ok, 0);
function checkBadges(kid, info) {
  const out = [];
  for (const b of BADGES) if (!kid.badges[b.id] && b.test(kid, info)) { kid.badges[b.id] = today(); out.push(b); }
  return out;
}

// ---------------- Récompenses ----------------
export function requestReward(kid, rw) {
  if (points(kid) < rw.cost) return false;
  kid.spent += rw.cost;
  kid.requests.unshift({ id: uid(), rid: rw.id, name: rw.name, icon: rw.icon, cost: rw.cost, d: today(), st: 'attente' });
  save(); return true;
}
export function settleRequest(kid, reqId, accept) {
  const r = kid.requests.find((x) => x.id === reqId); if (!r || r.st !== 'attente') return;
  r.st = accept ? 'ok' : 'refus';
  if (!accept) kid.spent -= r.cost;
  save();
}

// ---------------- Rapports & liens ----------------
async function pack(obj) {
  const json = JSON.stringify(obj);
  if (typeof CompressionStream !== 'undefined') {
    const cs = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const buf = new Uint8Array(await new Response(cs).arrayBuffer());
    return 'z' + b64(buf);
  }
  return 'p' + b64(new TextEncoder().encode(json));
}
async function unpack(code) {
  const kind = code[0], bytes = unb64(code.slice(1));
  if (kind === 'z') {
    const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return JSON.parse(await new Response(ds).text());
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
function b64(u8) { let s = ''; u8.forEach((b) => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); return Uint8Array.from(bin, (c) => c.charCodeAt(0)); }
const base = () => location.origin + location.pathname;

export async function reportLink(kid) {
  const days = {}; for (let i = 0; i < 60; i++) { const d = addDays(today(), -i); if (kid.days[d]) { const x = kid.days[d]; days[d] = { n: x.n, ok: x.ok, ms: x.ms, xp: x.xp, goalDone: !!x.goalDone }; } }
  const snap = { k: 'rep', id: kid.id, name: kid.name, level: kid.level, avatar: kid.avatar, goalMin: kid.goalMin, xp: kid.xp, spent: kid.spent, streak: liveStreak(kid), best: kid.best, lastDay: kid.lastDay, days, stats: kid.stats, badges: kid.badges, sessions: kid.sessions.slice(0, 25), requests: kid.requests.slice(0, 10), ia: kid.ia, updated: kid.updated, at: Date.now() };
  kid.lastReport = today(); save();
  return base() + '#/import/' + await pack(snap);
}
export async function setupLink(kid) {
  const obj = { k: 'setup', kid: { id: kid.id, name: kid.name, level: kid.level, avatar: kid.avatar, goalMin: kid.goalMin }, rewards: S.rewards, pin: S.pin };
  return base() + '#/import/' + await pack(obj);
}
export async function importCode(code) {
  const o = await unpack(code);
  if (o.k === 'setup') {
    let k = kidById(o.kid.id);
    if (!k) { k = newKid(o.kid.name, o.kid.level, o.kid.avatar, o.kid.id); S.kids.push(k); }
    Object.assign(k, { name: o.kid.name, level: o.kid.level, avatar: o.kid.avatar, goalMin: o.kid.goalMin, remote: false });
    S.rewards = o.rewards || S.rewards; if (o.pin) S.pin = o.pin; S.lastKid = k.id; save();
    return { type: 'setup', kid: k };
  }
  if (o.k === 'rep') {
    let k = kidById(o.id);
    if (k && !k.remote && k.updated > o.updated) return { type: 'old', kid: k };
    if (!k) { k = newKid(o.name, o.level, o.avatar, o.id); S.kids.push(k); }
    const keep = k.leitner;
    Object.assign(k, { name: o.name, level: o.level, avatar: o.avatar, goalMin: o.goalMin, xp: o.xp, spent: o.spent, streak: o.streak, best: o.best, lastDay: o.lastDay, days: o.days, stats: o.stats, badges: o.badges, sessions: o.sessions, requests: o.requests, ia: o.ia, updated: o.updated, remote: true, reportAt: o.at });
    k.leitner = keep || {}; save();
    return { type: 'report', kid: k };
  }
  throw new Error('Lien non reconnu');
}
export function reportDue(kid) { return !kid.lastReport || kid.lastReport <= addDays(today(), -7) || (new Date().getDay() === 0 && kid.lastReport !== today()); }
