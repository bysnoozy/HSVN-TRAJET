# HSVN Trajet

Application **web + iOS** (Expo / React Native, un seul code TypeScript) qui affiche les horaires
**temps réel** des trains SNCF et du métro / RER / bus / tram en Île-de-France (IDFM).

## Fonctionnalités

- Recherche d'une gare ou d'une station (SNCF et/ou IDFM).
- Tableau des prochains passages en temps réel : ligne, destination, heure, retard, voie/quai.
- Actualisation automatique toutes les 30 secondes.
- Favoris persistés sur l'appareil.
- **Mode démo** intégré : sans clé API, l'app fonctionne immédiatement avec des horaires factices
  sur quelques gares/stations d'exemple, pour développer/tester l'UI sans attendre l'obtention des
  clés.

## Stack technique

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (navigation
  par fichiers) — un seul code source pour le web (PWA) et les apps iOS/Android natives.
- TypeScript strict.
- Stockage local : `expo-secure-store` (Keychain/Keystore) pour les clés API, `AsyncStorage` pour
  les favoris.

## Démarrer

Prérequis : [Node.js](https://nodejs.org) 20+, et l'app [Expo Go](https://expo.dev/go) sur votre
téléphone pour tester rapidement sans Xcode.

```bash
npm install

# Web (navigateur, avec rechargement à chaud)
npm run web

# iOS (simulateur Xcode, ou scan du QR code avec Expo Go sur un iPhone)
npm run ios

# Démarre le bundler et affiche un QR code pour tous les usages ci-dessus
npm start
```

Au premier lancement, l'app est en **mode démo** (bandeau jaune sur l'écran de recherche). Pour les
vraies données temps réel, allez dans l'onglet **Réglages** et renseignez vos clés API (gratuites) :

| Réseau | Où obtenir la clé | Couverture |
|---|---|---|
| SNCF (Navitia) | <https://numerique.sncf.com/startup/api/> | TGV, Intercités, TER, Transilien |
| IDFM / PRIM (SIRI) | <https://prim.iledefrance-mobilites.fr/> | Métro, RER, bus, tram en Île-de-France |

Les clés sont stockées **uniquement sur l'appareil** (Keychain/Keystore natif en mobile, stockage
local sur le web) et ne sont envoyées qu'aux API SNCF / IDFM elles-mêmes.

## Structure du projet

```
app/                          Écrans (Expo Router, navigation par fichiers)
  (tabs)/
    index.tsx                 Recherche de gares/stations
    favorites.tsx              Favoris
    settings.tsx                Réglages (clés API)
  departures/[provider]/[id].tsx  Tableau des prochains passages d'une station
src/
  api/
    types.ts                  Types partagés
    sncf.ts                   Client API SNCF (Navitia)
    idfm.ts                   Client API IDFM / PRIM (SIRI Lite)
    demoData.ts                Données factices du mode démo
    search.ts                  Recherche unifiée SNCF + IDFM, avec repli démo
  hooks/
    useApiKeys.ts               Lecture/écriture des clés API (stockage sécurisé)
    useFavorites.ts              Gestion des favoris (AsyncStorage)
    useDepartures.ts              Polling des prochains passages (30 s)
  components/                  Composants UI (liste de stations, ligne de passage, etc.)
  constants/theme.ts            Couleurs par mode de transport / statut
  utils/                       Formatage de dates, stockage bas niveau
```

## Notes sur les API

- **SNCF** : API basée sur [Navitia](https://doc.navitia.io/), authentification HTTP Basic (clé API
  en identifiant, mot de passe vide). Recherche de gares via `/places`, prochains passages via
  `/stop_areas/{id}/departures`.
- **IDFM (PRIM)** : API SIRI Lite, authentification par header `apikey`. Prochains passages via
  `/stop-monitoring?MonitoringRef=...`, recherche de stations via `/stops-discovery`.

⚠️ Ces API publiques évoluent : si un appel échoue (403/404), vérifiez le chemin exact et le format
de réponse actuels dans la documentation officielle liée ci-dessus avant de déboguer le code.

## Publier l'app iOS

Le build et la publication sur l'App Store se font via [EAS Build](https://docs.expo.dev/build/introduction/)
(nécessite un compte Expo et un compte Apple Developer) :

```bash
npm install -g eas-cli
eas build --platform ios
eas submit --platform ios
```

## Déployer le web

```bash
npx expo export --platform web
```

Le dossier `dist/` généré peut être déployé sur n'importe quel hébergeur statique (Vercel, Netlify,
GitHub Pages, etc.).
