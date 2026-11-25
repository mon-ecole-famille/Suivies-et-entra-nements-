// Évaluateur de prompts hors-ligne : apprend à structurer une demande à une IA.
import { norm } from './store.js';

const CRITERIA = [
  {
    id: 'role', label: 'Rôle', hint: 'Donne un rôle à l’IA : « Tu es un prof de maths patient… »',
    re: /\b(tu es|agis comme|joue le role|imagine que tu es|en tant que|comporte[- ]toi comme)\b/, juniorOptional: true,
  },
  {
    id: 'context', label: 'Contexte', hint: 'Dis qui tu es et pourquoi : « Je suis en 3e, je révise le brevet… »',
    re: /\b(je suis en|je suis au|je suis|j'ai \d+ ans|niveau|je revise|brevet|bac|st2s|ce2|3e|premiere|1re|college|lycee|classe|controle|evaluation|en cours)\b/,
  },
  {
    id: 'task', label: 'Tâche précise', hint: 'Utilise un verbe d’action clair : explique, pose-moi, crée, corrige, compare…',
    re: /\b(explique|expliquer|pose|poser|cree|creer|fais|faire|corrige|corriger|resume|resumer|aide|aider|donne|propose|liste|compare|genere|ecris|simule|verifie|guide|interroge|entraine|apprends)/,
  },
  {
    id: 'format', label: 'Format', hint: 'Précise la forme : « 5 questions », « un tableau », « une à la fois », « en 4 phrases max »…',
    re: /(\b\d+\b|\b(une|un|deux|trois|quatre|cinq|six|sept|huit|dix)\b) ?(questions?|lignes?|phrases?|points?|exemples?|mots|exercices?|dates|conseils|erreurs)|tableau|liste|fiche|etapes?|une par une|un par un|une a la fois|un a la fois|maximum|\bmax\b|\bplan\b|schema|bareme/,
  },
  {
    id: 'learn', label: 'Je reste acteur', hint: 'Demande à être guidé : « sans me donner la réponse », « attends ma réponse », « corrige-moi »…',
    re: /sans (me )?donner|ne (me )?donne pas|ne (la |le )?reecris pas|attends?|corrige[- ]moi|verifie que j'ai compris|explique mon erreur|guide[- ]moi|ne fais pas|dis[- ]moi si|pose[- ]moi|a ma place|par des questions|interroge[- ]moi/,
  },
];

const DANGER = [
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/, msg: 'Tu as écrit une adresse e-mail : ne la donne jamais à une IA.' },
  { re: /\b0[1-9]([ .-]?\d{2}){4}\b/, msg: 'Tu as écrit un numéro de téléphone : à supprimer !' },
  { re: /mot de passe|password/, msg: 'Jamais de mot de passe dans une IA.' },
  { re: /j'habite (au|a|rue|avenue|\d)|mon adresse|\d+ (rue|avenue|bd|boulevard|chemin)/, msg: 'Ne donne pas ton adresse.' },
];

export function evaluatePrompt(text, tier) {
  const t = norm(text);
  const words = t.split(/\s+/).filter(Boolean).length;
  const res = CRITERIA.map((c) => ({ ...c, ok: c.re.test(t) }));
  const counted = res.filter((c) => !(tier === 'junior' && c.juniorOptional && !c.ok));
  let score = counted.filter((c) => c.ok).length;
  const max = counted.length;
  const tips = res.filter((c) => !c.ok).map((c) => c.hint);
  if (words < 8) { tips.unshift('Ton prompt est très court : une IA a besoin de détails pour bien t’aider.'); score = Math.min(score, 2); }
  const dangers = DANGER.filter((d) => d.re.test(t)).map((d) => d.msg);
  if (dangers.length) score = Math.max(0, score - 2);
  const stars = Math.round((score / max) * 5);
  const verdict = stars >= 5 ? 'Prompt de pro ! 🪄' : stars >= 4 ? 'Très bon prompt 👍' : stars >= 3 ? 'Pas mal, encore un effort' : 'À améliorer';
  return { stars, score, max, criteria: res, tips, dangers, verdict, words };
}
