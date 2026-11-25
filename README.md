# 🎓 Mon École — suivi scolaire, entraînement & compétences IA

Application familiale installable sur téléphone (PWA), gratuite, sans compte, qui marche **hors-ligne**.
Pensée pour 3 niveaux : **CE2**, **3e (brevet)** et **1re ST2S (bac)**.

👉 **Adresse de l'app :** `https://<compte>.github.io/<dépôt>/` (visible dans Settings → Pages)

## Ce que fait l'app

| Pour les enfants | Pour le parent |
|---|---|
| ⚡ Défi du jour (10 questions toutes matières) | 📊 Tableau de bord par enfant : temps, régularité, réussite |
| 📚 Entraînement par matière, adapté au niveau | 🧭 Analyse automatique et conseils (progrès, baisse, points faibles) |
| 🔁 Révision des erreurs (répétition espacée) | ⚠️ Chapitres à renforcer / ⭐ points forts |
| ♾️ Exercices générés à l'infini (maths, sciences) | 🎁 Récompenses que tu définis (écran, dessert, sortie…) |
| 🔥 Séries, XP, niveaux, 17 badges, missions du jour | 🔒 Espace protégé par code parent |
| 🤖 Parcours « IA & moi » | 💾 Sauvegarde / restauration |

### Le parcours « IA & moi » (adapté à chaque âge)
- **Comprendre l'IA** : leçons courtes (hallucinations, données perso, biais, deepfakes, éthique en santé…)
- **Détective IA** : repérer l'erreur glissée dans une réponse d'IA → esprit critique
- **Labo de prompts** : l'enfant écrit une demande, l'app la note sur 5 (Rôle, Contexte, Tâche, Format, « je reste acteur ») et donne des conseils
- **Boîte à prompts** : prompts de révision prêts à copier (à utiliser avec l'accord des parents, en respectant l'âge minimum de chaque service)
- **Charte IA** signée par l'enfant

## Mise en route (5 minutes)
1. Ouvre l'adresse de l'app sur **ton** téléphone → « Configurer la famille » → code parent + prénoms.
2. Espace parent → touche un enfant → **📲 Envoyer le lien d'installation** (WhatsApp/SMS).
3. Sur le téléphone de l'enfant : ouvrir le lien, puis **« Ajouter à l'écran d'accueil »** (Safari : bouton Partager ; Chrome : menu ⋮).
4. Chaque semaine, l'app rappelle à l'enfant d'envoyer son **bilan** : tu ouvres le lien reçu → ton tableau de bord se met à jour.

> Les données restent sur les téléphones (aucun serveur, rien n'est envoyé ailleurs). Si vous partagez une tablette, tout est visible directement.

## Mises à jour automatiques
- Chaque modification poussée sur `main` est testée puis publiée automatiquement (GitHub Actions → GitHub Pages).
- Les téléphones récupèrent la nouvelle version tout seuls à l'ouverture suivante.
- Côté contenu, les séances changent chaque jour : missions du jour, révisions programmées, générateurs d'exercices, et ciblage automatique des points faibles.

## Ajouter des questions
Les contenus sont dans `js/data/` (`ce2.js`, `3e.js`, `1st2s.js`, `ia.js`). Une question :
```js
{ id: '3e-hg-99', m: 'hg', c: 'Chapitre', q: 'La question ?', ch: ['choix A', 'choix B'], a: 0, e: 'Explication' }
// ou réponse à taper : a: ['réponse', 'variante acceptée']
```
`node tests/check.mjs` vérifie tout avant publication.

## Technique
HTML/CSS/JS sans dépendance · Service worker (hors-ligne) · localStorage · répétition espacée Leitner · liens de bilan compressés (deflate + base64url).
