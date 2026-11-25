// Parcours « IA & moi » : comprendre, bien utiliser et garder l'esprit critique.
// 3 niveaux : junior (CE2), ado (3e), lycee (1re ST2S)
export const TIER_BY_LEVEL = { ce2: 'junior', '3e': 'ado', '1st2s': 'lycee' };

// ---------- Leçons courtes (cartes) ----------
export const LESSONS = {
  junior: [
    { t: 'C’est quoi, une IA ?', b: 'Une intelligence artificielle est un programme d’ordinateur. Elle a lu énormément de textes et d’images, et elle apprend à reconnaître des choses et à répondre. Mais elle ne pense pas comme toi et elle n’a pas de sentiments.' },
    { t: 'L’IA peut se tromper', b: 'Parfois, l’IA invente des réponses qui ont l’air vraies mais qui sont fausses. C’est pour ça qu’on vérifie toujours avec un livre, un adulte ou la maîtresse.' },
    { t: 'Mes secrets restent à moi', b: 'Je ne donne JAMAIS à une IA (ni à personne sur Internet) : mon nom complet, mon adresse, mon école, mes photos, mes mots de passe.' },
    { t: 'Toujours avec un adulte', b: 'Je n’utilise une IA qu’avec papa ou maman à côté de moi. C’est comme traverser la rue : on apprend ensemble d’abord.' },
    { t: 'Bien demander', b: 'Pour qu’une IA t’aide bien, il faut lui parler clairement : dire QUI tu es (« je suis en CE2 »), CE QUE tu veux (« explique-moi… »), et COMMENT (« avec un exemple »).' },
    { t: 'L’IA m’aide, elle ne fait pas à ma place', b: 'Si l’IA fait mon exercice, c’est elle qui apprend… pas moi ! Je lui demande plutôt de m’expliquer ou de me poser des questions.' },
  ],
  ado: [
    { t: 'Comment marche une IA générative', b: 'Un modèle de langage (comme ChatGPT, Claude, Gemini, Le Chat de Mistral) prédit le mot suivant le plus probable, à partir de milliards de textes. Il est très fort pour rédiger et expliquer, mais il ne « sait » pas si ce qu’il dit est vrai.' },
    { t: 'Les hallucinations', b: 'Une IA peut inventer une date, une citation, une source ou un calcul, avec un ton très sûr. Règle d’or : tout chiffre, date ou citation se vérifie dans une source fiable (manuel, site officiel, encyclopédie).' },
    { t: 'La méthode R-C-T-F', b: 'Un bon prompt contient : un RÔLE (« Tu es un prof de maths patient »), un CONTEXTE (« Je suis en 3e, je révise le brevet »), une TÂCHE précise (« Pose-moi 5 questions sur Pythagore »), un FORMAT (« une question à la fois, corrige-moi après chaque réponse »).' },
    { t: 'Apprendre AVEC l’IA, pas copier', b: 'Copier une réponse d’IA, c’est de la triche… et ça ne sert à rien le jour du brevet. Utilise-la comme un coach : quiz, explications avec d’autres mots, correction de TA rédaction avec des pistes, pas avec la solution.' },
    { t: 'Données personnelles', b: 'Ce que tu écris peut être stocké et réutilisé. Ne donne jamais d’informations personnelles, de photos de toi ou d’amis, ni de mots de passe. Respecte l’âge minimum de chaque service et demande l’accord de tes parents.' },
    { t: 'Deepfakes et fausses infos', b: 'L’IA peut fabriquer de fausses photos, vidéos ou voix très réalistes. Avant de partager : qui l’a publié ? Est-ce repris par des médias fiables ? Il y a des détails bizarres (mains, texte, ombres) ?' },
    { t: 'Les biais', b: 'L’IA apprend sur des textes écrits par des humains, avec leurs préjugés. Elle peut donc reproduire des stéréotypes. Garde ton esprit critique.' },
  ],
  lycee: [
    { t: 'IA générative : ce qu’il faut vraiment comprendre', b: 'Les grands modèles de langage génèrent du texte statistiquement plausible. Ils peuvent raisonner de façon impressionnante, mais ils peuvent aussi produire des erreurs avec assurance. Ton rôle : piloter, vérifier, décider.' },
    { t: 'Prompt de niveau pro', b: 'R-C-T-F + contraintes + exemple. Ex : « Tu es professeur de STSS. Je suis en 1re ST2S. Explique la différence entre prévalence et incidence en 5 lignes max, puis donne-moi 1 exemple chiffré et 2 questions pour vérifier que j’ai compris. Ne donne les réponses que quand je te les demande. »' },
    { t: 'Itérer', b: 'Un premier résultat moyen ? On ne recommence pas de zéro : on affine. « Plus simple », « avec un exemple du secteur social », « sous forme de tableau », « qu’est-ce que j’ai oublié ? ». Savoir itérer est LA compétence clé.' },
    { t: 'Vérifier les sources', b: 'Demande toujours « Sur quelles sources t’appuies-tu ? », puis VÉRIFIE-les toi-même : les IA peuvent inventer des références. Sources fiables en santé : sites officiels (Santé publique France, HAS, OMS, ameli, INSEE, DREES).' },
    { t: 'IA et santé : éthique', b: 'En santé et dans le social, l’IA aide au diagnostic, à l’imagerie, à l’organisation. Mais : secret médical, consentement, RGPD, responsabilité humaine. Jamais de données de patients ou d’usagers dans une IA grand public.' },
    { t: 'IA et Parcoursup / orientation', b: 'L’IA peut t’aider à explorer des métiers (infirmier·e, éducateur·rice, assistant·e de service social…) et à structurer ton projet motivé. Mais ta lettre doit rester TA voix, avec TES expériences : les formations cherchent ta personnalité.' },
    { t: 'Impact environnemental', b: 'Chaque requête consomme de l’énergie et de l’eau dans les data centers. Utilise l’IA quand elle apporte vraiment quelque chose, avec des prompts précis plutôt que des dizaines d’essais au hasard.' },
  ],
};

// ---------- Quiz IA (format standard, matière 'ia') ----------
export const IA_QUESTIONS = {
  junior: [
    { id: 'ia-j-1', m: 'ia', c: 'Comprendre l’IA', q: 'Une IA, c’est :', ch: ['un programme d’ordinateur', 'une vraie personne cachée', 'un robot magique qui sait tout'], a: 0, e: 'C’est un programme créé par des humains.' },
    { id: 'ia-j-2', m: 'ia', c: 'Esprit critique', q: 'L’IA dit que les vaches pondent des œufs. Que fais-tu ?', ch: ['Je la crois', 'Je vérifie avec un adulte ou un livre', 'Je le répète à tout le monde'], a: 1, e: 'L’IA peut se tromper. On vérifie !' },
    { id: 'ia-j-3', m: 'ia', c: 'Sécurité', q: 'L’IA te demande ton adresse. Tu :', ch: ['la donnes', 'ne la donnes pas et préviens un adulte', 'donnes celle de ton copain'], a: 1, e: 'On ne donne jamais d’informations personnelles.' },
    { id: 'ia-j-4', m: 'ia', c: 'Bien demander', q: 'Quelle demande est la meilleure ?', ch: ['« Maths »', '« Je suis en CE2, explique-moi la table de 7 avec un jeu »', '« Fais tout »'], a: 1, e: 'On dit qui on est, ce qu’on veut, et comment.' },
    { id: 'ia-j-5', m: 'ia', c: 'Apprendre', q: 'Pour tes devoirs, l’IA doit :', ch: ['faire l’exercice à ta place', 't’expliquer pour que TU comprennes', 'écrire ta poésie'], a: 1, e: 'C’est toi qui dois apprendre !' },
    { id: 'ia-j-6', m: 'ia', c: 'Comprendre l’IA', q: 'Une IA a-t-elle des sentiments ?', ch: ['Oui, comme moi', 'Non, elle imite seulement le langage', 'Seulement le dimanche'], a: 1, e: 'Elle peut écrire « je suis content », mais elle ne ressent pas les choses comme toi.' },
  ],
  ado: [
    { id: 'ia-a-1', m: 'ia', c: 'Comprendre l’IA', q: 'Un modèle de langage génère sa réponse en :', ch: ['cherchant la vérité dans une base de données parfaite', 'prédisant des suites de mots probables', 'demandant à un humain'], a: 1, e: 'Il prédit le texte le plus plausible, ce qui n’est pas toujours le plus vrai.' },
    { id: 'ia-a-2', m: 'ia', c: 'Esprit critique', q: 'Une « hallucination » d’IA, c’est :', ch: ['un bug d’écran', 'une information inventée présentée comme vraie', 'une image floue'], a: 1, e: 'Dates, citations, sources : toujours vérifier.' },
    { id: 'ia-a-3', m: 'ia', c: 'Prompt', q: 'Que signifie le « R » de R-C-T-F ?', ch: ['Résultat', 'Rôle', 'Rapidité', 'Règle'], a: 1, e: 'Rôle – Contexte – Tâche – Format.' },
    { id: 'ia-a-4', m: 'ia', c: 'Prompt', q: 'Quel prompt est le plus efficace pour réviser ?', ch: ['« Pythagore »', '« Fais mon DM »', '« Tu es prof de maths. Je suis en 3e. Pose-moi 5 questions de difficulté croissante sur Pythagore, une par une, et corrige-moi sans donner la réponse d’abord. »'], a: 2, e: 'Rôle, contexte, tâche, format et contrainte : tout y est.' },
    { id: 'ia-a-5', m: 'ia', c: 'Éthique', q: 'Rendre un devoir entièrement écrit par une IA, c’est :', ch: ['malin', 'de la triche, et tu n’apprends rien', 'autorisé partout'], a: 1, e: 'Sauf consigne contraire du prof, c’est de la fraude. Et au brevet, pas d’IA !' },
    { id: 'ia-a-6', m: 'ia', c: 'Fausses infos', q: 'Une vidéo choquante d’une célébrité circule. Premier réflexe :', ch: ['la partager vite', 'vérifier la source et si des médias fiables en parlent', 'la commenter'], a: 1, e: 'Ça peut être un deepfake.' },
    { id: 'ia-a-7', m: 'ia', c: 'Données', q: 'Laquelle de ces infos peux-tu donner à une IA sans risque ?', ch: ['Ton adresse', 'Ton mot de passe', 'Ton niveau scolaire (« je suis en 3e »)', 'Une photo de ta carte d’identité'], a: 2, e: 'Le niveau scolaire aide l’IA à s’adapter et ne t’identifie pas.' },
    { id: 'ia-a-8', m: 'ia', c: 'Biais', q: 'Une IA décrit toujours les infirmiers comme des femmes. C’est :', ch: ['un biais appris dans ses données', 'forcément la vérité', 'un virus'], a: 0, e: 'Les IA reproduisent les stéréotypes présents dans leurs données.' },
  ],
  lycee: [
    { id: 'ia-l-1', m: 'ia', c: 'Prompt', q: 'La meilleure stratégie quand la réponse de l’IA est moyenne :', ch: ['abandonner', 'itérer en précisant ce qui ne va pas', 'copier quand même'], a: 1, e: 'L’itération est la compétence clé du travail avec l’IA.' },
    { id: 'ia-l-2', m: 'ia', c: 'Sources', q: 'Une IA cite un article scientifique. Tu :', ch: ['le cites directement', 'vérifies qu’il existe et qu’il dit bien ça', 'ajoutes d’autres références au hasard'], a: 1, e: 'Les IA peuvent inventer des références crédibles.' },
    { id: 'ia-l-3', m: 'ia', c: 'Éthique santé', q: 'En stage, peux-tu coller le dossier d’un patient dans une IA grand public ?', ch: ['Oui si c’est pour aider', 'Non : secret professionnel et RGPD', 'Oui sans le nom'], a: 1, e: 'Même anonymisé « à la main », le risque de ré-identification existe. Jamais de données d’usagers.' },
    { id: 'ia-l-4', m: 'ia', c: 'Sources', q: 'Source la plus fiable pour un chiffre de santé publique en France :', ch: ['un réseau social', 'Santé publique France / DREES / INSEE', 'un forum'], a: 1, e: 'Sources institutionnelles et officielles.' },
    { id: 'ia-l-5', m: 'ia', c: 'Orientation', q: 'Pour ton projet de formation motivé (Parcoursup), l’IA peut :', ch: ['l’écrire entièrement', 't’aider à structurer tes idées et relire, mais le contenu doit venir de toi', 'inventer des stages'], a: 1, e: 'Les jurys cherchent ton authenticité et tes expériences réelles.' },
    { id: 'ia-l-6', m: 'ia', c: 'Comprendre l’IA', q: 'Quelle tâche une IA générative fait-elle le MOINS bien sans vérification ?', ch: ['reformuler un texte', 'donner des faits précis et récents', 'proposer un plan'], a: 1, e: 'Les faits précis et récents sont la zone à risque.' },
    { id: 'ia-l-7', m: 'ia', c: 'Prompt', q: 'Ajouter « Ne me donne pas la réponse, guide-moi par des questions » permet :', ch: ['un apprentissage actif', 'une réponse plus rapide', 'rien'], a: 0, e: 'C’est la méthode socratique : tu construis la réponse toi-même, donc tu retiens.' },
  ],
};

// ---------- Détective IA : repère l'erreur dans la réponse d'une IA ----------
// lines : phrases de la "réponse IA" ; bad : index de la phrase fausse ; e : explication
export const DETECTIVE = {
  junior: [
    { topic: 'Les animaux', lines: ['Le chat est un mammifère.', 'Les araignées ont 6 pattes.', 'Les poissons respirent avec des branchies.'], bad: 1, e: 'Les araignées ont 8 pattes (ce sont les insectes qui en ont 6).' },
    { topic: 'Le calendrier', lines: ['Une semaine a 7 jours.', 'Le mois de février a souvent 28 jours.', 'Une année a 10 mois.'], bad: 2, e: 'Une année a 12 mois.' },
    { topic: 'L’eau', lines: ['L’eau gèle à 0 °C.', 'La glace flotte sur l’eau.', 'L’eau bout à 30 °C.'], bad: 2, e: 'L’eau bout à 100 °C.' },
    { topic: 'Les calculs', lines: ['5 × 2 = 10', '7 × 8 = 54', '9 + 6 = 15'], bad: 1, e: '7 × 8 = 56. Même une IA peut se tromper en calcul !' },
  ],
  ado: [
    { topic: 'La 2de Guerre mondiale', lines: ['La guerre commence en 1939 avec l’invasion de la Pologne.', 'Le débarquement de Normandie a lieu le 6 juin 1944.', 'L’armistice du 11 novembre 1945 met fin à la guerre.'], bad: 2, e: 'Le 11 novembre, c’est 1918 (1re Guerre mondiale). En Europe, la 2de se termine le 8 mai 1945.' },
    { topic: 'Pythagore', lines: ['Le théorème s’applique aux triangles rectangles.', 'L’hypoténuse est le côté opposé à l’angle droit.', 'Si les côtés de l’angle droit mesurent 3 et 4, l’hypoténuse mesure 7.'], bad: 2, e: '√(9 + 16) = √25 = 5, pas 7. On n’additionne pas les longueurs !' },
    { topic: 'Les vaccins', lines: ['Un vaccin stimule le système immunitaire.', 'Il permet de créer une mémoire immunitaire.', 'Les antibiotiques soignent la grippe.'], bad: 2, e: 'La grippe est un virus : les antibiotiques n’agissent que sur les bactéries.' },
    { topic: 'La Ve République', lines: ['La Ve République est fondée en 1958.', 'Le président est élu au suffrage universel direct depuis 1962.', 'Le mandat présidentiel est de 9 ans.'], bad: 2, e: 'Le mandat est de 5 ans (quinquennat) depuis 2000. Il était de 7 ans avant.' },
    { topic: 'Citation', lines: ['Victor Hugo est un écrivain du XIXe siècle.', 'Il a écrit Les Misérables.', 'Il a dit « Je pense donc je suis ».'], bad: 2, e: '« Je pense donc je suis » est de Descartes (XVIIe). Les IA attribuent souvent mal les citations !' },
  ],
  lycee: [
    { topic: 'Prévalence / incidence', lines: ['L’incidence mesure les nouveaux cas sur une période.', 'La prévalence mesure les cas existants à un moment donné.', 'Une maladie chronique a forcément une prévalence plus faible que son incidence annuelle.'], bad: 2, e: 'C’est l’inverse : une maladie chronique dure, les cas s’accumulent → prévalence souvent bien supérieure à l’incidence annuelle.' },
    { topic: 'La circulation sanguine', lines: ['Le ventricule gauche éjecte le sang dans l’aorte.', 'Les veines pulmonaires ramènent du sang riche en O₂ au cœur.', 'L’artère pulmonaire transporte du sang riche en oxygène.'], bad: 2, e: 'L’artère pulmonaire transporte du sang pauvre en O₂ vers les poumons.' },
    { topic: 'Protection sociale', lines: ['La Sécurité sociale a été créée en 1945.', 'La CAF verse les prestations familiales.', 'L’ARS rembourse directement les consultations médicales.'], bad: 2, e: 'C’est l’Assurance maladie (CPAM) qui rembourse. L’ARS pilote la politique de santé régionale.' },
    { topic: 'Glycémie', lines: ['L’insuline est produite par le pancréas.', 'L’insuline fait baisser la glycémie.', 'Le glucagon fait aussi baisser la glycémie.'], bad: 2, e: 'Le glucagon est hyperglycémiant : il fait MONTER la glycémie.' },
    { topic: 'Source inventée', lines: ['Selon l’OMS, la santé est un état de complet bien-être physique, mental et social.', 'Cette définition date de 1946.', 'Elle a été modifiée en 2019 pour ajouter le bien-être numérique.'], bad: 2, e: 'Inventé ! La définition n’a pas été modifiée. Typique d’une hallucination « crédible ».' },
  ],
};

// ---------- Défis « Labo de prompts » ----------
export const PROMPT_CHALLENGES = {
  junior: [
    { goal: 'Demande à une IA de t’aider à apprendre la table de 7 en jouant.', example: 'Je suis en CE2. Peux-tu m’aider à apprendre la table de 7 avec un petit jeu ? Pose-moi une question à la fois et dis-moi si j’ai juste.' },
    { goal: 'Demande à une IA de t’expliquer pourquoi le ciel est bleu.', example: 'J’ai 8 ans. Explique-moi pourquoi le ciel est bleu avec des mots simples et un exemple de la vie de tous les jours, en 4 phrases maximum. Ensuite, pose-moi une question pour vérifier que j’ai compris.' },
    { goal: 'Demande une histoire pour t’entraîner à lire.', example: 'Je suis en CE2. Écris une courte histoire de 10 lignes sur un dauphin à Toulon, puis pose-moi 3 questions pour vérifier que j’ai compris.' },
  ],
  ado: [
    { goal: 'Réviser Pythagore pour le brevet sans qu’on te donne les réponses.', example: 'Tu es un prof de maths patient. Je suis en 3e et je révise le brevet. Pose-moi 5 exercices sur Pythagore, du plus facile au plus dur, un par un. Attends ma réponse, corrige-moi et explique mon erreur sans donner la solution tout de suite.' },
    { goal: 'Faire corriger ta rédaction en apprenant de tes erreurs.', example: 'Tu es professeur de français. Je suis en 3e. Voici ma rédaction : [texte]. Ne la réécris pas. Liste mes 5 erreurs les plus importantes (orthographe, syntaxe, construction), explique la règle pour chacune, et donne-moi 2 conseils pour améliorer mon texte.' },
    { goal: 'Créer une fiche de révision sur la Guerre froide.', example: 'Tu es prof d’histoire. Je suis en 3e. Fais-moi une fiche de révision sur la Guerre froide : 8 dates clés dans un tableau, 5 notions définies en une ligne, puis pose-moi un quiz de 5 questions, une par une, et attends ma réponse avant de corriger. Signale-moi ce que je dois vérifier dans mon manuel.' },
    { goal: 'Préparer l’oral du brevet.', example: 'Tu es membre d’un jury d’oral du brevet. Je présente mon projet sur [sujet]. Pose-moi 6 questions que le jury pourrait poser, une par une, et donne-moi un retour sur chaque réponse (clarté, vocabulaire, argumentation).' },
  ],
  lycee: [
    { goal: 'Comprendre une notion de STSS (ex : déterminants de santé) et vérifier ta compréhension.', example: 'Tu es professeur de STSS en 1re ST2S. Explique-moi les déterminants de santé en 6 lignes, avec un exemple concret du secteur social. Puis pose-moi 3 questions de difficulté croissante, une par une. Ne donne la correction qu’après ma réponse.' },
    { goal: 'S’entraîner au commentaire du bac de français.', example: 'Tu es professeur de français, spécialiste du bac technologique. Voici un extrait : [texte]. Ne fais pas le commentaire à ma place. Aide-moi à trouver une problématique en me posant des questions, puis évalue mon plan en 2 parties et dis-moi ce qui manque.' },
    { goal: 'Préparer une étude de cas en BPH (pathologie).', example: 'Tu es professeur de biologie et physiopathologie humaines. Je suis en 1re ST2S. Crée une étude de cas courte sur un patient diabétique de type 2 (fictif), avec 5 questions type bac. Attends mes réponses avant de corriger. Indique les sources officielles (HAS, ameli) où je peux vérifier.' },
    { goal: 'Explorer les métiers du sanitaire et social pour Parcoursup.', example: 'Tu es conseiller d’orientation. Je suis en 1re ST2S et j’hésite entre infirmière, éducatrice spécialisée et assistante de service social. Fais un tableau comparatif (études, durée, missions, qualités requises), puis pose-moi 5 questions pour m’aider à réfléchir à ce qui me correspond. Rappelle-moi de vérifier sur Onisep.' },
  ],
};

// ---------- Boîte à prompts : à copier-coller dans une IA (avec l'accord des parents) ----------
export const PROMPT_BOX = {
  junior: [
    { t: 'Quiz de tables', p: 'Je suis en CE2. Pose-moi 10 questions sur les tables de multiplication de 6, 7 et 8, une à la fois. Dis-moi bravo quand j’ai juste et explique-moi quand j’ai faux.' },
    { t: 'Dictée maison', p: 'Je suis en CE2. Donne à mon parent une petite dictée de 5 phrases avec les mots « a/à » et « et/est », pour qu’il me la lise.' },
  ],
  ado: [
    { t: 'Coach brevet du jour', p: 'Tu es mon coach de révision du brevet. Je suis en 3e. Aujourd’hui j’ai 20 minutes. Propose-moi un mini-programme : 5 min de cours flash sur [chapitre], puis 5 questions une par une, puis un bilan de mes points faibles.' },
    { t: 'Explique autrement', p: 'Je n’ai pas compris [notion] en cours. Explique-la-moi comme si j’avais 12 ans, avec une analogie de la vie quotidienne, puis vérifie que j’ai compris avec 2 questions.' },
    { t: 'Fiche brevet', p: 'Fais-moi une fiche de révision d’une page sur [chapitre] pour le brevet : définitions, dates/formules clés, un schéma en texte, et 3 pièges classiques.' },
    { t: 'Correction sans réécriture', p: 'Voici mon texte : [texte]. Ne le réécris pas. Souligne mes erreurs en les classant (orthographe, grammaire, style) et explique les règles.' },
  ],
  lycee: [
    { t: 'Méthode socratique', p: 'Tu es professeur de [matière] en 1re ST2S. Je veux comprendre [notion]. Ne me donne pas l’explication directement : guide-moi par des questions, une à la fois, jusqu’à ce que je la formule moi-même.' },
    { t: 'Entraînement bac', p: 'Crée un sujet d’entraînement type bac ST2S en [matière] sur [chapitre], avec un document, 4 questions et un barème. Attends que je réponde avant de corriger avec le barème.' },
    { t: 'Fiche de synthèse vérifiable', p: 'Fais une fiche de synthèse sur [notion] (définitions, chiffres clés, exemple). Pour chaque chiffre, indique quelle source officielle je dois consulter pour le vérifier (INSEE, DREES, Santé publique France, OMS…).' },
    { t: 'Oral : simulation de jury', p: 'Simule un jury d’oral du bac de français. Je présente l’explication linéaire de [texte]. Pose-moi les questions de l’entretien une à une et évalue mes réponses.' },
    { t: 'Planning de révisions', p: 'Je suis en 1re ST2S. Mes évaluations : [liste avec dates]. J’ai [x] minutes par jour. Fais-moi un planning réaliste avec répétition espacée, et des pauses.' },
  ],
};

// ---------- Charte d'utilisation (à accepter par l'enfant) ----------
export const CHARTER = {
  junior: ['J’utilise l’IA seulement avec un adulte.', 'Je ne donne jamais mes informations personnelles.', 'Je vérifie ce que dit l’IA.', 'L’IA m’aide à comprendre, elle ne fait pas mes devoirs.'],
  ado: ['Je respecte l’âge minimum des services et j’utilise l’IA avec l’accord de mes parents.', 'Je ne partage aucune donnée personnelle (ni la mienne, ni celle des autres).', 'Je vérifie dates, chiffres et citations dans une source fiable.', 'J’utilise l’IA pour apprendre (quiz, explications), jamais pour copier.', 'Je dis à mon prof quand j’ai utilisé une IA, si c’est autorisé.'],
  lycee: ['J’utilise l’IA comme un coach, jamais pour écrire à ma place.', 'Je vérifie chaque fait dans une source officielle.', 'Aucune donnée de patient, d’usager ou de stage dans une IA.', 'Je reste l’auteure de mes travaux et je cite l’usage de l’IA quand c’est demandé.', 'J’utilise l’IA de façon sobre et réfléchie.'],
};
