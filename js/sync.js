// Synchro famille facultative via Supabase (projet « mes-applis »).
// Sans compte : une famille = un identifiant + un secret, transmis dans le lien famille / d'installation.
// L'app reste 100 % hors-ligne : la synchro n'est qu'un plus, relancée dès que le réseau revient.
import * as St from './store.js';

const SB_URL = 'https://xdxrbcgomzrqfuebgnnv.supabase.co';
const SB_KEY = 'sb_publishable_NqC4VFUK2CQgmuEE6QZbxg_htM5PQAk'; // clé publique (faite pour être dans l'app)
const CK = 'suivi-scolaire.sync';

let C = load();
let running = null, timer = null, onChange = () => {};

function load() { try { const c = JSON.parse(localStorage.getItem(CK)); if (c && c.fam) return c; } catch (e) { /* ignore */ } return null; }
function keep() { try { if (C) localStorage.setItem(CK, JSON.stringify(C)); else localStorage.removeItem(CK); } catch (e) { /* ignore */ } }

export const enabled = () => !!C;
export const role = () => (C ? C.role : null);
export const lastSync = () => (C ? C.last : null);
export const lastError = () => (C ? C.err : null);

async function rpc(name, body) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error((await r.text().catch(() => '')) || 'HTTP ' + r.status);
  return r.status === 204 ? null : r.json();
}
const auth = () => ({ p_famille: C.fam, p_secret: C.sec });

function randomSecret() {
  const u = crypto.getRandomValues(new Uint8Array(32)); let s = '';
  u.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function hash(obj) { const j = JSON.stringify(obj); let h = 5381; for (let i = 0; i < j.length; i++) h = ((h << 5) + h + j.charCodeAt(i)) >>> 0; return h.toString(36) + ':' + j.length; }

// Parent : crée la famille sur Supabase
export async function enableAsParent() {
  if (!navigator.onLine) throw new Error('Pas de réseau');
  const next = { fam: crypto.randomUUID(), sec: randomSecret(), role: 'parent', cursor: null, pushed: {}, outbox: [], last: null, err: null };
  await rpc('ecole_creer', { p_famille: next.fam, p_secret: next.sec });
  C = next; keep();
  return syncNow();
}
// Enfant : rejoint la famille grâce au lien reçu
function join(inv) {
  if (!inv || !inv.f || !inv.s) return;
  if (C && C.fam === inv.f) return;
  C = { fam: inv.f, sec: inv.s, role: 'enfant', cursor: null, pushed: {}, outbox: [], last: null, err: null };
  keep(); schedule(500);
}
export function disable() { C = null; keep(); }

// Le parent valide / refuse une demande de récompense à distance
export function queueDecision(kid, reqId, ok) {
  if (!C) return false;
  const r = kid.requests.find((x) => x.id === reqId); if (r) r.st = ok ? 'ok' : 'refus';
  C.outbox.push({ id: 'dec:' + reqId, type: 'dec', data: { kid: kid.id, req: reqId, ok }, v: Date.now() });
  keep(); St.save(); schedule(300);
  return true;
}

function collect() {
  const items = [], marks = {};
  for (const k of St.S.kids) {
    if (k.remote) continue;
    const snap = St.snapshot(k); const { at, ...stable } = snap; const h = hash(stable);
    if (C.pushed['rep:' + k.id] !== h) { items.push({ id: 'rep:' + k.id, type: 'rep', data: snap, v: k.updated || 0 }); marks['rep:' + k.id] = h; }
  }
  if (C.role === 'parent') {
    const fam = { rewards: St.S.rewards, pin: St.S.pin }; const h = hash(fam);
    if (C.pushed.fam !== h) { items.push({ id: 'fam', type: 'fam', data: fam, v: Date.now() }); marks.fam = h; }
  }
  return { items: [...C.outbox, ...items], marks };
}

function applyRow(row) {
  const d = row.data;
  if (row.type === 'rep') {
    if (C.role !== 'parent') return false;
    // On ne remplace une fiche que par une version plus récente (fiche créée ici puis utilisée sur le téléphone de l'enfant)
    const local = St.kidById(d.id); if (local && !(d.updated > local.updated)) return false;
    return St.applyObj({ ...d, k: 'rep' }).type === 'report';
  }
  if (row.type === 'fam') {
    const h = hash({ rewards: d.rewards, pin: d.pin }); if (C.pushed.fam === h) return false;
    if (d.pin) St.S.pin = d.pin; if (d.rewards) St.S.rewards = d.rewards;
    C.pushed.fam = h; St.save(); return true;
  }
  if (row.type === 'dec') {
    const k = St.kidById(d.kid); if (!k || k.remote) return false;
    const r = k.requests.find((x) => x.id === d.req); if (!r || r.st !== 'attente') return false;
    St.settleRequest(k, d.req, d.ok); return true;
  }
  return false;
}

export function syncNow() {
  if (!C || !navigator.onLine) return Promise.resolve({ changed: false });
  if (running) return running;
  running = (async () => {
    let changed = false;
    try {
      // 1) Envoyer
      const { items, marks } = collect();
      for (let i = 0; i < items.length; i += 50) await rpc('ecole_envoyer', { ...auth(), p_items: items.slice(i, i + 50) });
      Object.assign(C.pushed, marks); C.outbox = [];
      // 2) Recevoir (petit recouvrement de 5 s : réappliquer est sans effet)
      for (;;) {
        const since = C.cursor ? new Date(Date.parse(C.cursor) - 5000).toISOString() : null;
        const rows = await rpc('ecole_recevoir', { ...auth(), p_depuis: since });
        for (const row of rows) if (applyRow(row)) changed = true;
        if (rows.length) C.cursor = rows[rows.length - 1].updated_at;
        if (rows.length < 500) break;
      }
      C.last = Date.now(); C.err = null;
    } catch (e) {
      C.err = String(e.message || e).slice(0, 200); console.warn('synchro', e);
    } finally { keep(); running = null; }
    if (changed) onChange();
    return { changed };
  })();
  return running;
}

function schedule(ms = 4000) { if (!C) return; clearTimeout(timer); timer = setTimeout(syncNow, ms); }

export function init(cb) {
  onChange = cb || onChange;
  St.setSyncHooks({
    onSave: () => schedule(),
    linkExtra: () => (C ? { f: C.fam, s: C.sec } : null),
    onInvite: join,
  });
  addEventListener('online', () => schedule(200));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') schedule(300); else if (C) syncNow(); });
  setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 120000);
  schedule(800);
}
