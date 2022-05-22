import React from 'react';
import { View, StyleSheet } from 'react-native';

import { GeoItem } from './GeoItem';
import { GeoJSONFeature } from './server';

const styles = StyleSheet.create({
    Selection: {
        maxWidth: '98%',
        margin: 5
    }
});

export default function Location(props: { item: GeoJSONFeature | null }) {
    return (
        <View style={styles.Selection}>
            <GeoItem item={props.item} />
        </View>
    );
}