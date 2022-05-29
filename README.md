# Mobile Application for meteo.guru

# Application Mobile pour velivole.fr

![License](https://img.shields.io/github/license/mmomtchev/velivole-mobile)

**Icons by IconMark from NounProject.com**

# Quickstart

To run the development version in debug mode on Android phone on Linux:
(You will need to install Expo Go from the Play Store)

_Pour lancer la version de développement en mode de debug sur Android sous Linux:_
_(Vous devez installer Expo Go du Play Store)_

```bash
git clone https://github.com/mmomtchev/velivole-mobile.git
cd velivole-mobile
yarn install
# Push notifications from Firebase Cloud Messaging require a crypto key and won't work in your version
# Les notifications à distance de Firebase Cloud Messaging nécessitent une clé et ne vont pas marcher
touch assets/google-services.json
# Connect your phone by USB
# Brancher votre téléphone en USB
expo start
# Press 'a'
# Appuyer sur 'a'
```
