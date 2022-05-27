import * as fs from 'fs';
import { execSync } from 'child_process';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const buildGitHash = process.env.EAS_BUILD_GIT_COMMIT_HASH !== undefined
    ? process.env.EAS_BUILD_GIT_COMMIT_HASH.substring(0, 8)
    : execSync('git rev-parse --short HEAD').toString().trimEnd();

const buildDate = execSync('date -u +"%Y-%m-%d"').toString().trimEnd();

export default {
    expo: {
        name: 'velivole.fr - meteo.guru',
        slug: 'velivole',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './icons/velivole.png',
        userInterfaceStyle: 'light',
        splash: {
            image: './icons/velivole.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
        },
        updates: {
            fallbackToCacheTimeout: 0
        },
        assetBundlePatterns: [
            '**/*'
        ],
        ios: {
            bundleIdentifier: 'fr.velivole.reactnative',
            supportsTablet: true
        },
        android: {
            package: 'fr.velivole.reactnative',
            googleServicesFile: './assets/google-services.json',
            adaptiveIcon: {
                foregroundImage: './icons/velivole.png',
                backgroundColor: '#FFFFFF'
            }
        },
        web: {
            favicon: './icons/favicon.png'
        },
        extra: {
            VERSION: packageJson.version,
            BUILD_HASH: buildGitHash,
            BUILD_DATE: buildDate
        }
    }
};