![License](https://img.shields.io/github/license/mmomtchev/velivole-mobile)

**Icons by IconMark from NounProject.com**

# Application Mobile pour velivole.fr

J'ai profité du temps que j'avais pour développer une nouvelle application mobile pour velivole.fr. Elle est pratiquement identique à l'application existante sauf pour deux points majeurs:

- Contrairement à la première application qui était en Java pour Android, celle-là est en TypeScript / React Native et elle supporte également iPhone / iOS
- L'application est entièrement open-source sous licence GPL3 et son code source est disponible ici: https://github.com/mmomtchev/velivole-mobile

Cependant, à différence du Play Store de Google, où la licence développeur est payé une seule fois et elle est valable à vie - la licence développeur d'App Store Apple est facturée 100€ TTC/an pour un développeur privé et 300€ HT/an pour une société. Ceux qui ont suivi l'évolution de ma situation savent que je suis actuellement en chômage longue durée suite à un chantage de la part des cabinets de recrutement à Paris lié à une affaire judiciaire, qui touche des magistrats de justice et la communauté de vol libre. Il ne m'est absolument pas possible de payer cette licence.

Actuellement l'application Android a été validée par Google et l'application iPhone ne pourra pas voir le jour à moins qu'une société du monde du vol libre ne paye cette licence - où sinon un autre développeur dans la communauté, qui lui a déjà cette licence, accepte de se charger de la soumettre à chaque nouvelle version.

Beta test de l'application Android: https://play.google.com/store/apps/details?id=fr.velivole.reactnative

# Mobile Application for meteo.guru

Given that I had some free time on my hands, I did develop a new mobile application for meteo.guru. Feature-wise, it is almost identical to the current one except for two major points:

- Unlike the first one, developed in Java for Android, this one uses TypeScript / React Native which means that it also supports iPhone / iOS
- The application is entirely open-sourced under a GPL3 licence with the source code being available here: https://github.com/mmomtchev/velivole-mobile

However, in contrast with the Google Play Store, where a developer account is payable once and it has lifetime validity, an Apple App Store developer account costs 100€ per year all taxes included for a personal account or 300€ without taxes for an enterprise account. If you have followed the development of my situation, I am currently living on social welfare since I am being extorted by the French IT recruitment companies for a judicial affair that involves French judiciary officials and also the paragliding community. I am absolutely unable to pay this developer account.

Currently the Android application has been reviewed by Google but the iPhone application will not see the light of the day unless there is a paragliding business is willing to sponsor this account - or at least another developer from the community who already has such an account and is willing to take care of submitting the application every time a new version is published.

Beta test of the Android application: https://play.google.com/store/apps/details?id=fr.velivole.reactnative

# Developer Quickstart

To run the development version in debug mode on Android phone on Linux:
(You will need to install Expo Go from the Play Store)

_Pour lancer la version de développement en mode de debug sur Android sous Linux:_
_(Vous devez installer Expo Go du Play Store)_

```bash
git clone https://github.com/mmomtchev/velivole-mobile.git
cd velivole-mobile
yarn install
expo install
# Push notifications from Firebase Cloud Messaging require an expo-notifications patch and won't work
# Les notifications à distance de Firebase Cloud Messaging nécessitent un patch pour expo-notifications et ne vont pas marcher
# Connect your phone by USB
# Brancher votre téléphone en USB
expo start
# Press 'a' for Android or 'i' for iPhone (macOS only)
# Appuyer sur 'a' pour Android ou 'i' pour iPhone (uniquement sur macOS)

# In order to create a full native build you will need an expo account
# Pour un build natif complet vous devrez avoir un compte expo
eas build --platform android --profile production
eas build --platform ios --profile production
```
