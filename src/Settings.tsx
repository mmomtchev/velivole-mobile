import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import ReactNativeSettings, { SettingsElement } from '@mmomtchev/react-native-settings';
import i18n from 'i18n-js';

import { Config } from './config';
import { veliHeight, veliMode } from './util';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        maxHeight: Dimensions.get('window').height,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: '1.5%'
    }
});

const modeLabel = () => ({ 'P': i18n.t('Paragliding'), 'H': i18n.t('Hang-gliding'), S: i18n.t('Sailplane') }) as Record<veliMode, string>;
const heightLabel: Record<veliHeight, string> = { 'G': 'AGL', 'S': 'AMSL' };

const translateSettings = (config: Config, update: () => void) => [
    {
        label: i18n.t('Mode'), type: 'enum', values: ['P', 'H', 'S'], display: (v: string) => modeLabel()[v as veliMode],
        get: config.get.bind(config, '@mode', () => 'P'), set: (v) => {
            update();
            return config.setMode(v as veliMode);
        }
    },
    {
        label: i18n.t('Height'), type: 'enum', values: ['G', 'S'], display: (v: string) => heightLabel[v as veliHeight],
        get: config.get.bind(config, '@height', () => 'S'), set: (v) => {
            update();
            return config.setHeight(v as veliHeight);
        }
    },
    {
        label: i18n.t('Notifications'), type: 'section', elements: [
            {
                label: 'AROME', type: 'boolean',
                get: async () => await config.get('@nAROME', () => 'true') === 'true',
                set: (v) => config.set('@nAROME', v.toString())
            },
            {
                label: 'ARPEGE', type: 'boolean',
                get: async () => await config.get('@nARPEGE', () => 'false') === 'true',
                set: (v) => config.set('@nARPEGE', v.toString())
            },
            {
                label: 'ICON-D2', type: 'boolean',
                get: async () => await config.get('@nICON-D2', () => 'false') === 'true',
                set: (v) => config.set('@nICON-D2', v.toString())
            },
            {
                label: 'ICON-EU', type: 'boolean',
                get: async () => await config.get('@nICON-EU', () => 'false') === 'true',
                set: (v) => config.set('@nICON-EU', v.toString())
            },
            {
                label: 'GFS', type: 'boolean',
                get: async () => await config.get('@nGFS', () => 'false') === 'true',
                set: (v) => config.set('@nGFS', v.toString())
            }
        ]
    }
] as SettingsElement[];

export default function Settings(props: {
    config: Config;
    update: () => void;
}) {
    const settings = React.useMemo(() => translateSettings(props.config, props.update), [props.config.lang]);
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='#007bff' style="dark" hidden={false} />
            <View style={{ height: getStatusBarHeight() }} />
            <ReactNativeSettings settings={settings} />
        </View>
    );
}
