// Générateurs d'exercices : des milliers de variantes, jamais deux fois les mêmes.
// Chaque générateur renvoie une question au même format que les banques.
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fr = (n) => String(Math.round(n * 1000) / 1000).replace('.', ',');
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// QCM numérique : construit 4 choix plausibles autour de la bonne réponse
function numChoices(good, spread = 3, fmt = fr) {
  const set = new Set([good]);
  let guard = 0;
  while (set.size < 4 && guard++ < 50) {
    const d = R(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const v = good + d;
    if (v >= 0) set.add(v);
  }
  const ch = shuffle([...set]);
  return { ch: ch.map(fmt), a: ch.indexOf(good) };
}

const G = {
  // =================== CE2 ===================
  'ce2:tables': () => {
    const a = R(2, 9), b = R(2, 10);
    return { m: 'maths', c: 'Tables de multiplication', q: `${a} × ${b} = ?`, a: [String(a * b)], e: `${a} × ${b} = ${a * b}. Astuce : ${b} × ${a} donne le même résultat.` };
  },
  'ce2:addition': () => {
    const a = R(100, 699), b = R(20, 299);
    return { m: 'maths', c: 'Addition', q: `${a} + ${b} = ?`, a: [String(a + b)], e: `On pose : unités, puis dizaines, puis centaines, sans oublier les retenues. Résultat : ${a + b}.` };
  },
  'ce2:soustraction': () => {
    const a = R(200, 999), b = R(10, a - 50);
    return { m: 'maths', c: 'Soustraction', q: `${a} − ${b} = ?`, a: [String(a - b)], e: `${a} − ${b} = ${a - b}. Vérifie : ${a - b} + ${b} = ${a}.` };
  },
  'ce2:double': () => {
    const n = R(6, 60), dbl = Math.random() < 0.5;
    if (dbl) return { m: 'maths', c: 'Doubles et moitiés', q: `Le double de ${n} = ?`, a: [String(n * 2)], e: `Double = × 2 → ${n * 2}.` };
    const p = n * 2;
    return { m: 'maths', c: 'Doubles et moitiés', q: `La moitié de ${p} = ?`, a: [String(n)], e: `Moitié = partager en 2 → ${n}.` };
  },
  'ce2:fois10': () => {
    const n = R(3, 99), k = pick([10, 100]);
    return { m: 'maths', c: 'Multiplier par 10, 100', q: `${n} × ${k} = ?`, a: [String(n * k)], e: `× ${k} : on ajoute ${k === 10 ? 'un zéro' : 'deux zéros'} → ${n * k}.` };
  },
  'ce2:decompo': () => {
    const c = R(1, 9), d = R(0, 9), u = R(0, 9), n = c * 100 + d * 10 + u;
    return { m: 'maths', c: 'Numération', q: `Dans ${n}, quel est le chiffre des dizaines ?`, a: [String(d)], e: `${n} = ${c} centaines, ${d} dizaines, ${u} unités.` };
  },
  'ce2:comparer': () => {
    const a = R(100, 999); let b = R(100, 999); if (b === a) b++;
    const good = a > b ? '>' : '<';
    return { m: 'maths', c: 'Comparer les nombres', q: `${a} ? ${b}`, ch: ['<', '>', '='], a: ['<', '>', '='].indexOf(good), e: `On compare d’abord les centaines, puis les dizaines. ${a} ${good} ${b}.` };
  },
  'ce2:monnaie': () => {
    const prix = R(3, 19), paye = prix < 10 ? 10 : 20;
    return { m: 'maths', c: 'Monnaie', q: `Un jouet coûte ${prix} €. Tu paies avec un billet de ${paye} €. Combien te rend-on ?`, a: [String(paye - prix)], e: `${paye} − ${prix} = ${paye - prix} €.` };
  },

  // =================== 3e ===================
  '3e:equation': () => {
    const x = R(-9, 9), a = pick([2, 3, 4, 5, -2, -3, 6]), b = R(-12, 12), c = a * x + b;
    const sb = b >= 0 ? `+ ${b}` : `− ${-b}`;
    return { m: 'maths', c: 'Équations', q: `Résoudre : ${a}x ${sb} = ${c}. x = ?`, a: [String(x)], e: `${a}x = ${c} ${b >= 0 ? '−' : '+'} ${Math.abs(b)} = ${c - b}, donc x = ${c - b} ÷ ${a} = ${x}.` };
  },
  '3e:developper': () => {
    const k = R(2, 9), a = R(1, 9), b = R(1, 9);
    const good = `${k * a}x + ${k * b}`;
    const opts = [`${k * a}x + ${b}`, `${a + k}x + ${k * b}`, `${k * a}x + ${k + b}`, `${a}x + ${k * b}`, `${k * a}x + ${k * b + 1}`, `${k * a + 1}x + ${k * b}`];
    const ch = shuffle([good, ...[...new Set(opts)].filter((o) => o !== good).slice(0, 3)]);
    return { m: 'maths', c: 'Calcul littéral', q: `Développer : ${k}(${a}x + ${b})`, ch, a: ch.indexOf(good), e: `On distribue ${k} : ${k}×${a}x + ${k}×${b} = ${good}.` };
  },
  '3e:pythagore': () => {
    const [p, q, r] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15]]);
    const k = pick([1, 1, 2, 3]);
    return { m: 'maths', c: 'Pythagore', q: `Triangle rectangle : côtés de l’angle droit ${p * k} cm et ${q * k} cm. Longueur de l’hypoténuse (cm) ?`, a: [String(r * k)], e: `h² = ${p * k}² + ${q * k}² = ${(p * k) ** 2} + ${(q * k) ** 2} = ${(r * k) ** 2}, donc h = √${(r * k) ** 2} = ${r * k} cm.` };
  },
  '3e:puissances': () => {
    const a = R(-5, 8), b = R(-5, 8);
    return { m: 'maths', c: 'Puissances', q: `10^${a} × 10^${b} = 10^? (donne l’exposant)`, a: [String(a + b)], e: `10ⁿ × 10ᵐ = 10ⁿ⁺ᵐ → ${a} + ${b} = ${a + b}.` };
  },
  '3e:pourcentage': () => {
    const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 75]), n = pick([40, 60, 80, 120, 200, 240, 300, 400]);
    return { m: 'maths', c: 'Pourcentages', q: `${p} % de ${n} = ?`, a: [fr(n * p / 100)], e: `${n} × ${p} / 100 = ${fr(n * p / 100)}.` };
  },
  '3e:fonction': () => {
    const a = R(-5, 5) || 2, b = R(-9, 9), x = R(-5, 5);
    const sb = b >= 0 ? `+ ${b}` : `− ${-b}`;
    return { m: 'maths', c: 'Fonctions', q: `f(x) = ${a}x ${sb}. Calcule f(${x}).`, a: [String(a * x + b)], e: `f(${x}) = ${a} × (${x}) ${sb} = ${a * x} ${sb} = ${a * x + b}.` };
  },
  '3e:proba': () => {
    const n = pick([6, 8, 10, 12]), k = R(1, n - 1);
    return { m: 'maths', c: 'Probabilités', q: `Un sac contient ${n} boules dont ${k} rouges. Probabilité de tirer une rouge ? (fraction a/b)`, a: [`${k}/${n}`, simp(k, n)], e: `Nombre de cas favorables / nombre de cas possibles = ${k}/${n}${simp(k, n) !== `${k}/${n}` ? ` = ${simp(k, n)}` : ''}.` };
  },
  '3e:fractions': () => {
    const d = pick([3, 4, 5, 6, 7, 8, 9]), a = R(1, d), b = R(1, d);
    return { m: 'maths', c: 'Fractions', q: `${a}/${d} + ${b}/${d} = ? (fraction a/b)`, a: [`${a + b}/${d}`, simp(a + b, d)], e: `Même dénominateur : on ajoute les numérateurs → ${a + b}/${d}.` };
  },
  '3e:vitesse': () => {
    const v = pick([40, 50, 60, 70, 80, 90, 110, 130]), t = pick([2, 3, 4, 1.5, 0.5]);
    return { m: 'sciences', c: 'Physique – Mouvement', q: `Un véhicule roule à ${v} km/h pendant ${fr(t)} h. Distance parcourue (km) ?`, a: [fr(v * t)], e: `d = v × t = ${v} × ${fr(t)} = ${fr(v * t)} km.` };
  },
  '3e:ohm': () => {
    const R_ = pick([10, 20, 47, 100, 220]), I = pick([0.1, 0.2, 0.05, 0.5]);
    return { m: 'sciences', c: 'Physique – Électricité', q: `R = ${R_} Ω, I = ${fr(I)} A. Tension U (en V) ?`, a: [fr(R_ * I)], e: `U = R × I = ${R_} × ${fr(I)} = ${fr(R_ * I)} V.` };
  },

  // =================== 1re ST2S ===================
  'st:taux': () => {
    const v0 = pick([200, 400, 500, 800, 1000, 1200]), t = pick([5, 10, 15, 20, 25, -5, -10, -20]);
    const v1 = v0 * (1 + t / 100);
    return { m: 'maths', c: 'Évolutions', q: `Une valeur passe de ${v0} à ${fr(v1)}. Taux d’évolution en % ? (ex : 12 ou -8)`, a: [String(t)], e: `t = (V₁ − V₀) / V₀ × 100 = (${fr(v1)} − ${v0}) / ${v0} × 100 = ${t} %.` };
  },
  'st:suite': () => {
    const u0 = R(-10, 50), r = pick([2, 3, 4, 5, -2, -3, 10]), n = R(3, 12);
    return { m: 'maths', c: 'Suites', q: `(uₙ) arithmétique : u₀ = ${u0}, r = ${r}. Calcule u${sub(n)}.`, a: [String(u0 + n * r)], e: `uₙ = u₀ + n × r = ${u0} + ${n} × (${r}) = ${u0 + n * r}.` };
  },
  'st:concentration': () => {
    const m = pick([1, 2, 4.5, 5, 9, 10, 18, 20]), V = pick([0.1, 0.25, 0.5, 1, 2]);
    return { m: 'pc', c: 'Solutions', q: `On dissout ${fr(m)} g de soluté dans ${fr(V)} L de solution. Concentration en masse (g/L) ?`, a: [fr(m / V)], e: `Cm = m / V = ${fr(m)} / ${fr(V)} = ${fr(m / V)} g/L.` };
  },
  'st:dilution': () => {
    const C1 = pick([1, 2, 5, 10]), f = pick([2, 4, 5, 10]), V2 = pick([50, 100, 200, 250]);
    const V1 = V2 / f;
    return { m: 'pc', c: 'Solutions', q: `On veut ${V2} mL de solution à ${fr(C1 / f)} g/L à partir d’une solution mère à ${C1} g/L. Volume à prélever (mL) ?`, a: [fr(V1)], e: `C₁V₁ = C₂V₂ → V₁ = C₂ × V₂ / C₁ = ${fr(C1 / f)} × ${V2} / ${C1} = ${fr(V1)} mL (facteur de dilution ${f}).` };
  },
  'st:mol': () => {
    const [name, M] = pick([['d’eau (M = 18 g/mol)', 18], ['de glucose (M = 180 g/mol)', 180], ['de NaCl (M = 58,5 g/mol)', 58.5], ['de CO₂ (M = 44 g/mol)', 44]]);
    const n = pick([0.1, 0.2, 0.5, 1, 2]);
    return { m: 'pc', c: 'Quantité de matière', q: `Quelle masse (g) de ${fr(n)} mol ${name} ?`, a: [fr(n * M)], e: `m = n × M = ${fr(n)} × ${fr(M)} = ${fr(n * M)} g.` };
  },
  'st:frequence': () => {
    const N = pick([20, 25, 40, 50, 200]), k = R(1, N - 1);
    return { m: 'maths', c: 'Statistiques', q: `Sur ${N} patients, ${k} présentent un symptôme. Fréquence en % ?`, a: [fr(k / N * 100)], e: `f = ${k} / ${N} × 100 = ${fr(k / N * 100)} %.` };
  },
  'st:prevalence': () => {
    const pop = pick([1000, 5000, 10000, 20000]), cas = pick([50, 100, 150, 200, 250]);
    return { m: 'stss', c: 'Indicateurs', q: `Population de ${pop} habitants, ${cas} personnes malades au 1er janvier. Prévalence pour 1 000 habitants ?`, a: [fr(cas / pop * 1000)], e: `Prévalence = ${cas} / ${pop} × 1 000 = ${fr(cas / pop * 1000)} ‰.` };
  },
};

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
function simp(a, b) { const g = gcd(a, b); return `${a / g}/${b / g}`; }
function sub(n) { return String(n).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[d]).join(''); }

G['st:cm'] = () => {
  const y = pick([2, 5, 8, 10, 12, 15, 20, 25, 30, 40]);
  if (Math.random() < 0.5) return { m: 'maths', c: 'Évolutions', q: `Une hausse de ${y} % correspond à un coefficient multiplicateur de ?`, a: [fr(1 + y / 100)], e: `CM = 1 + ${y}/100 = ${fr(1 + y / 100)}.` };
  return { m: 'maths', c: 'Évolutions', q: `Une baisse de ${y} % correspond à un coefficient multiplicateur de ?`, a: [fr(1 - y / 100)], e: `CM = 1 − ${y}/100 = ${fr(1 - y / 100)}.` };
};

export const GENERATORS_BY_LEVEL = {
  ce2: ['ce2:tables', 'ce2:tables', 'ce2:addition', 'ce2:soustraction', 'ce2:double', 'ce2:fois10', 'ce2:decompo', 'ce2:comparer', 'ce2:monnaie'],
  '3e': ['3e:equation', '3e:developper', '3e:pythagore', '3e:puissances', '3e:pourcentage', '3e:fonction', '3e:proba', '3e:fractions', '3e:vitesse', '3e:ohm'],
  '1st2s': ['st:cm', 'st:taux', 'st:suite', 'st:concentration', 'st:dilution', 'st:mol', 'st:frequence', 'st:prevalence'],
};

export function generate(key) {
  const q = G[key]();
  q.id = 'gen:' + key;
  q.gen = true;
  return q;
}

export const _allKeys = Object.keys(G);
