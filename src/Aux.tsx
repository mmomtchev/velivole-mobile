import React from 'react';
import { View } from 'react-native';

import { WebView } from 'react-native-webview';

import { rootUrl, refreshTimer } from './config';
import { GeoJSONFeature } from './server';

export default function Aux(props: {
    selected: GeoJSONFeature;
    page: 'profile' | 'emagram';
}) {
    const ref = React.useRef<WebView>(null);
    const page = props.page;
    const coords = props.selected.geometry.coordinates;
    const uri = React.useMemo(() => `${rootUrl}/${page}` +
        `?long=${coords[0]}&lat=${coords[1]}`, [page, coords]);

    React.useEffect(() => {
        const refreshHandler = window.setInterval(() => {
            if (ref.current)
                ref.current.reload();
        }, refreshTimer);
        return () => window.clearInterval(refreshHandler);
    });

    return (
        <View style={{ flex: 1, paddingTop: 5 }} >
            <WebView
                ref={ref}
                source={{ uri }}
                originWhitelist={['*']}
                pullToRefreshEnabled={true}
                minimumFontSize={1}
            />
        </View>
    );
}
