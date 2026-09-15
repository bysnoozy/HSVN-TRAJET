# Serveur de notifications — HSVN Trajet

Petit serveur Node/Express qui vérifie périodiquement les horaires temps réel
(SNCF/IDFM) des trajets enregistrés par l'app, et envoie une **vraie
notification push** (via le service Expo) dès qu'un passage est retardé ou
supprimé — même si l'app est complètement fermée et le téléphone verrouillé.

Ce n'est **pas obligatoire** pour utiliser l'app : sans ce serveur, tout le
reste (recherche, horaires, Mon trajet) fonctionne normalement. Il ne sert
qu'à la fonctionnalité "Notifications de perturbation" (écran Réglages).

## Comment ça marche

```
App (téléphone)                 Ton serveur                    APIs SNCF / IDFM
     │  POST /register               │                                │
     │  { token push, trajet } ────► │                                │
     │                                │                                │
     │                    cron externe (toutes les 2-5 min)            │
     │                                │ ── POST /tick ──► vérifie      │
     │                                │     chaque étape ────────────► │
     │                                │ ◄── horaires temps réel ────── │
     │                                │                                │
     │  ◄── notification push ────── │  (si retard/suppression détecté)
```

Le serveur ne contacte les API SNCF/IDFM que pour les arrêts que tu as
ajoutés à "Mon trajet" dans l'app — pas de scan large, juste tes étapes.

## Déployer (exemple avec Render.com, gratuit)

1. Crée un compte sur [render.com](https://render.com), connecte ton dépôt
   GitHub `bysnoozy/HSVN-TRAJET`.
2. Nouveau **Web Service** :
   - Répertoire racine (Root Directory) : `server`
   - Build Command : `npm install`
   - Start Command : `npm start`
   - Plan : Free
3. Dans l'onglet **Environment**, ajoute les variables (voir `.env.example`) :
   - `SNCF_API_KEY` — ta clé SNCF (même clé que dans l'app)
   - `IDFM_API_KEY` — ta clé IDFM
   - `TICK_SECRET` — une valeur aléatoire (ex: génère avec `openssl rand -hex 24`)
   - `DISRUPTION_DELAY_THRESHOLD_MIN` — `5` par défaut
4. Une fois déployé, note l'URL publique (ex: `https://hsvn-trajet-server.onrender.com`).
5. **Le plan gratuit de Render met le service en veille après 15 min
   d'inactivité** : il faut donc un cron *externe* qui le réveille et lance
   une vérification. Va sur [cron-job.org](https://cron-job.org) (gratuit),
   crée une tâche :
   - URL : `https://TON-SERVICE.onrender.com/tick`
   - Méthode : `POST`
   - Header : `x-tick-secret: <la même valeur que TICK_SECRET>`
   - Intervalle : toutes les 5 minutes
6. Dans l'app, écran Réglages → colle `https://TON-SERVICE.onrender.com` dans
   "URL du serveur de notifications" → active le switch.

### Alternative : hébergeur qui reste actif en continu (Railway, Fly.io, VPS)

Si tu héberges sur une machine qui ne se met pas en veille, tu peux te passer
du cron externe : mets `AUTO_TICK_MINUTES=5` dans les variables
d'environnement, le serveur se réveille lui-même toutes les 5 minutes.

## Développement local

```bash
cd server
cp .env.example .env   # puis remplis SNCF_API_KEY / IDFM_API_KEY / TICK_SECRET
npm install
npm start
```

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/tick -H "x-tick-secret: <ta valeur>"
```

## Limites connues

- Stockage des appareils enregistrés dans un simple fichier JSON
  (`server/data/devices.json`) — largement suffisant pour un usage personnel
  (quelques appareils), mais pas conçu pour beaucoup d'utilisateurs
  simultanés. Sur un hébergeur au disque éphémère (ex: Render), ce fichier
  est perdu à chaque redéploiement : il suffit de rouvrir l'app pour que le
  téléphone se réenregistre automatiquement (l'app garde son token en local).
- Une seule paire de clés SNCF/IDFM pour tout le serveur (variables
  d'environnement) — adapté à un usage perso, pas à un serveur multi-utilisateurs
  avec des clés différentes par personne.
