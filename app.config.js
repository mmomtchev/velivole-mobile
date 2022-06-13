import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import withAndroidLocalizedName from '@mmomtchev/expo-android-localized-app-name';

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

const buildGitHash = process.env.EAS_BUILD_GIT_COMMIT_HASH !== undefined
    ? process.env.EAS_BUILD_GIT_COMMIT_HASH.substring(0, 8)
    : execSync('git rev-parse --short HEAD').toString().trimEnd();

const buildDate = execSync('date -u +"%Y-%m-%d"').toString().trimEnd();

let appName = 'meteo.guru';
let pkgName = 'fr.velivole.reactnative';
switch (process.env.EAS_PROFILE) {
    case 'preview':
    case 'production':
        break;
    default:
        process.env.EAS_PROFILE = 'development';
    case 'development':
        appName = 'velivole.fr DEV';
        pkgName += '.dev';
        break;
}

const config = {
    name: appName,
    slug: 'velivole',
    version: packageJson.version,
    orientation: 'portrait',
    scheme: 'velivole',
    icon: './icons/velivole.png',
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
    locales: {
        fr: './lang/fr.json'
    },
    ios: {
        bundleIdentifier: pkgName,
        buildNumber: packageJson.version,
        supportsTablet: true,
        associatedDomains: [
            'applinks:www.velivole.fr',
            'applinks:velivole.fr',
            'applinks:www.meteo.guru',
            'applinks:megeo.guru'
        ],
        infoPlist: {
            CFBundleAllowMixedLocalizations: true
        }
    },
    android: {
        package: pkgName,
        versionCode: packageJson.version.split('.').reduce((a, x) => a * 100 + +x, 0),
        googleServicesFile: './assets/google-services.json',
        adaptiveIcon: {
            foregroundImage: './icons/velivole-adaptive.png',
            backgroundColor: '#FFFFFF'
        },
        intentFilters: [
            {
                action: 'VIEW',
                data: [
                    {
                        scheme: 'https',
                        host: '*.velivole.fr',
                        pathPrefix: '*'
                    },
                    {
                        scheme: 'https',
                        host: 'velivole.fr',
                        pathPrefix: '*'
                    },
                    {
                        scheme: 'https',
                        host: '*.meteo.guru',
                        pathPrefix: '*'
                    },
                    {
                        scheme: 'https',
                        host: 'meteo.guru',
                        pathPrefix: '*'
                    },
                    {
                        scheme: 'geo'
                    },
                ],
                category: [
                    'BROWSABLE',
                    'DEFAULT'
                ]
            }
        ]
    },
    notification: {
        icon: './icons/velivole.png'
    },
    web: {
        favicon: './icons/favicon.png'
    },
    plugins: [
        withAndroidLocalizedName
    ],
    extra: {
        VERSION: packageJson.version,
        BUILD_HASH: buildGitHash,
        BUILD_DATE: buildDate,
        ROOT_URL: process.env.VELIVOLE_ROOT_URL,
        PROFILE: process.env.EAS_PROFILE
    }
};

export default config;
