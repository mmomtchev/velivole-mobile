import React from 'react';
import { Dimensions, StyleSheet, View, Text, Platform } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

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

const translateSettings = (config: Config, update: () => void) => {
    const settings = [
        {
            label: i18n.t('Mode'), type: 'enum', values: ['P', 'H', 'S'], display: (v: string) => modeLabel()[v as veliMode],
            get: config.get.bind(config, '@mode', () => 'P'), set: (v) => {
                update();
                return config.setMode(v as veliMode);
            }, title: i18n.t('Mode')
        },
        {
            label: i18n.t('Height'), type: 'enum', values: ['G', 'S'], display: (v: string) => heightLabel[v as veliHeight],
            get: config.get.bind(config, '@height', () => 'S'), set: (v) => {
                update();
                return config.setHeight(v as veliHeight);
            }, title: i18n.t('Height')
        }
    ] as SettingsElement[];

    if (Platform.OS === 'android') {
        settings.push(
            {
                label: i18n.t('Notifications'), type: 'section', elements: [
                    {
                        label: 'AROME', type: 'boolean',
                        get: config.getNotificationsStatus.bind(config, 'AROME'),
                        set: config.setNotificationsStatus.bind(config, 'AROME')
                    },
                    {
                        label: 'ARPEGE', type: 'boolean',
                        get: config.getNotificationsStatus.bind(config, 'ARPEGE'),
                        set: config.setNotificationsStatus.bind(config, 'ARPEGE')
                    },
                    {
                        label: 'ICON-D2', type: 'boolean',
                        get: config.getNotificationsStatus.bind(config, 'ICON-D2'),
                        set: config.setNotificationsStatus.bind(config, 'ICON-D2')
                    },
                    {
                        label: 'ICON-EU', type: 'boolean',
                        get: config.getNotificationsStatus.bind(config, 'ICON-EU'),
                        set: config.setNotificationsStatus.bind(config, 'ICON-EU')
                    },
                    {
                        label: 'GFS', type: 'boolean',
                        get: config.getNotificationsStatus.bind(config, 'GFS'),
                        set: config.setNotificationsStatus.bind(config, 'GFS')
                    }
                ]
            });
    }

    settings.push({
        label: (
            <Text
                style={{
                    fontSize: 10,
                    fontStyle: 'italic',
                    marginTop: 10,
                    textAlign: 'right',
                    marginEnd: 20
                }}
            >
                {Constants.manifest?.extra?.VERSION}: build {Constants.manifest?.extra?.BUILD_HASH} from {Constants.manifest?.extra?.BUILD_DATE}
            </Text>
        ),
        type: 'section',
        elements: []
    });

    return settings;
};

export default function Settings(props: {
    config: Config;
    update: () => void;
}) {
    const settings = React.useMemo(() => translateSettings(props.config, props.update), [props.config, props.update]);
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='#007bff' style="dark" hidden={false} />
            <View style={{ height: getStatusBarHeight() }} />
            <ReactNativeSettings settings={settings} />
        </View>
    );
}
