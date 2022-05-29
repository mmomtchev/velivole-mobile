import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { siteName } from './GeoDB';

import { GeoJSONFeature } from './server';

const styles = StyleSheet.create({
    Item: {
        padding: 0,
        margin: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
        overflow: 'hidden'
    },
    Title: {
        fontSize: 18,
        fontWeight: '900',
        color: '#606060',
        overflow: 'hidden'
    },
    Coords: {
        fontSize: 12
    }
});

export function GeoItem(props: { item: GeoJSONFeature | null; }) {
    return (
        <View style={styles.Item}>
            <Text numberOfLines={1} style={styles.Title} ellipsizeMode={'clip'}>
                {props.item ? siteName(props.item) : <Text>&nbsp;</Text>}
            </Text>
            <Text style={styles.Coords}>
                {props.item ?
                    `${props.item.geometry.coordinates[1]}° : ${props.item.geometry.coordinates[0]}°`
                    :
                    <Text>&nbsp;</Text>
                }
            </Text>
        </View >
    );
}
