import React from 'react';
import { View } from 'react-native';

import { WebView } from 'react-native-webview';

import { rootUrl } from './config';
import { GeoJSONFeature } from './server';

export default function Aux(props: {
    selected: GeoJSONFeature;
    page: 'profile' | 'emagram';
}) {
    const page = props.page;
    const coords = props.selected.geometry.coordinates;
    const uri = React.useMemo(() => `${rootUrl}/${page}` +
        `?long=${coords[0]}&lat=${coords[1]}`, [page, coords]);

    return (
        <View style={{ flex: 1, paddingTop: 5 }} >
            <WebView
                source={{ uri }}
                originWhitelist={['*']}
                pullToRefreshEnabled={true}
                minimumFontSize={1}
            />
        </View>
    );
}
