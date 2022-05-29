import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import * as GeoLocation from 'expo-location';

import Toast from 'react-native-root-toast';
import i18n from 'i18n-js';

import ServerAPI, { GeoJSONFeature, GeoJSONProperties } from './server';
import { Config } from './config';

export type veliMode = 'P' | 'H' | 'S';
export type veliHeight = 'G' | 'S';

export type StackParamList = {
    Home: {
        selected: GeoJSONFeature | null;
        setSelected: React.Dispatch<React.SetStateAction<GeoJSONFeature | null>>;
        mode: veliMode;
    },
    Map: {
        selected: GeoJSONFeature | null;
        setSelected: React.Dispatch<React.SetStateAction<GeoJSONFeature | null>>;
        mode: veliMode;
        height: veliHeight;
    },
    Profile: {
        selected: GeoJSONFeature;
    };
    Emagram: {
        selected: GeoJSONFeature;
    };
    Settings: {
        config: Config;
        update: () => void;
    };
};
export const Tabs = createBottomTabNavigator<StackParamList>();

export function errorToast(err: Error): void {
    Toast.show(err.message, { duration: Toast.durations.LONG });
    console.error(err);
}

export async function createFeature({ lng, lat }: { lng: number, lat: number; }): Promise<GeoJSONFeature> {
    let props: GeoJSONProperties | undefined;

    props = await ServerAPI.geoResolve('launch', lng, lat).catch(() => undefined);
    if (!props)
        props = await ServerAPI.geoResolve('place', lng, lat).catch(() => undefined);
    if (!props)
        props = { n: 'Unknown' };

    return {
        type: 'Feature',
        properties: {
            n: props.n as string,
            s: props.s as string,
            t: props.t as string,
            o: props.o as string
        },
        geometry: {
            type: 'Point',
            coordinates: [lng, lat]
        }
    };
}

export async function Location(): Promise<GeoJSONFeature> {
    const { status } = await GeoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        throw new Error(i18n.t('Permission denied'));
    }

    Toast.show(i18n.t('Locating'), { duration: Toast.durations.LONG });

    const location = await GeoLocation.getCurrentPositionAsync({});

    return await createFeature({ lng: location.coords.longitude, lat: location.coords.latitude });
}
