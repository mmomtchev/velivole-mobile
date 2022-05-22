import React from 'react';

import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

import AsyncStorage from '@react-native-async-storage/async-storage';

import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

import fr from '../build/fr.json';
import en from '../build/en.json';

i18n.translations = { fr, en };
i18n.fallbacks = false;

export class Config {
    lang: 'en' | 'fr';
    terminal: string;
    mode: 'P' | 'H' | 'S';
    height: 'S' | 'G';

    constructor() {
        const locale = Localization.locale.split('-')[0];
        this.lang = 'en';
        if (['en', 'fr'].includes(locale))
            this.lang = locale as 'fr';
        this.terminal = 'pending_init';
        this.mode = 'P';
        this.height = 'S';
        if (__DEV__) // for debug
            this.lang = 'fr';
        i18n.locale = this.lang;
        console.debug('language is', this.lang);
        this.load();
    }

    get(key: string, def: () => string): Promise<string> {
        return AsyncStorage.getItem(key).then((v) => {
            if (v === null) throw new Error('value not found');
            return v;
        }).catch(() => {
            const v = def();
            return v;
        });
    }

    set(key: string, value: string): Promise<void>  {
        return AsyncStorage.setItem(key, value).catch((e) => {
            console.error(e);
        });
    }

    async setMode(mode: 'P' | 'H' | 'S'): Promise<void> {
        config.mode = mode;
        return this.set('@mode', mode);
    }

    async setHeight(mode: 'G' | 'S'): Promise<void> {
        config.height = mode;
        return this.set('@height', mode);
    }

    async load() {
        this.terminal = await this.get('@terminal', () => {
            const id = uuid();
            console.debug('Generating unique UUID', id);
            this.set('@terminal', id);
            return id;
        });
        this.mode = await this.get('@mode', () => 'P') as 'P';
        this.height = await this.get('@height', () => 'S') as 'S';
        console.debug(this);
        if (__DEV__)
            console.log('DEBUG MODE');
    }
};

export const config = new Config();
