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
        version: packageJson.version,
        orientation: 'portrait',
        scheme: 'velivole',
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
            buildNumber: packageJson.version,
            supportsTablet: true,
            associatedDomains: [
                'applinks:www.velivole.fr',
                'applinks:velivole.fr',
                'applinks:www.meteo.guru',
                'applinks:megeo.guru'
            ]
        },
        android: {
            package: 'fr.velivole.reactnative',
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
        extra: {
            VERSION: packageJson.version,
            BUILD_HASH: buildGitHash,
            BUILD_DATE: buildDate
        }
    }
};
