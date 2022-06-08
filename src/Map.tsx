import React from 'react';
import { View } from 'react-native';

import { WebView } from 'react-native-webview';

import { GeoJSONFeature } from './server';
import { config, rootUrl } from './config';
import { createFeature, veliHeight, veliMode } from './util';

export interface MapProps {
    selected: GeoJSONFeature | null;
    setSelected: React.Dispatch<React.SetStateAction<GeoJSONFeature | null>>;
    mode: veliMode;
    height: veliHeight;
}

// This code handles the interaction between the mobile application and the main
// site JavaScript webpage. It inherits from the old Android Java<->JavaScript bridge
// that was implemented for the first Android-only application.
//
// It consists of three parts
//
export default class Map extends React.PureComponent<MapProps> {
    webref: WebView | null;
    sessionCode: string;

    constructor(props: Readonly<MapProps>) {
        super(props);
        this.webref = null;

        // 1) Injecting the session information from the mobile application
        // which happens here
        this.sessionCode = `
            window.velivoleReactNative = {
                terminal: '${config.terminal}',
                ${this.props.selected ? `selectedLng: ${this.props.selected.geometry.coordinates[0]},` : ''}
                ${this.props.selected ? `selectedLat: ${this.props.selected.geometry.coordinates[1]},` : ''}
                ${this.props.selected ? `centerLng: ${this.props.selected.geometry.coordinates[0]},` : ''}
                ${this.props.selected ? `centerLat: ${this.props.selected.geometry.coordinates[1]},` : ''}
                modeAlt: ${this.props.height === 'S' ? 'true' : 'false'},
                mode: '${this.props.mode}',
                locale: '${config.lang}'
            };
            true;
            `;
    }

    componentDidUpdate() {
        // 2) Injecting status updates from the mobile application
        if (this.webref) {
            if (this.props.selected) {
                this.webref.injectJavaScript(`window.velivole.updatePoint([${this.props.selected.geometry.coordinates.join(',')}], true)`);
            }
        }
    }

    render() {
        const params = {} as Record<string, unknown>;
        params.mode = this.props.mode;
        params.height = this.props.height;

        const url = rootUrl + '?' + Object.keys(params).map((q) => `${q}=${params[q]}`).join('&');

        return (
            <View style={{ flex: 1, paddingTop: 5 }} >
                <WebView
                    ref={(r) => (this.webref = r)}
                    cache={__DEV__ ? false : true}
                    source={{ uri: url }}
                    originWhitelist={['*']}
                    injectedJavaScriptBeforeContentLoaded={this.sessionCode}
                    pullToRefreshEnabled={true}
                    // 3) Receiving session updates from the web application which happens here
                    onMessage={(event) => {
                        try {
                            const msg = JSON.parse(event.nativeEvent.data);
                            console.debug('received from web', msg);
                            if (msg.message === 'set') {
                                // This is how the selected point from the web map becomes a feature
                                // that can be added to the bookmarks
                                if (msg.lonlat) {
                                    createFeature({ lng: msg.lonlat[0], lat: msg.lonlat[1] }).then((feature) => this.props.setSelected(feature));
                                }
                                if (msg.height) {
                                    config.setHeight(msg.height);
                                }
                                if (msg.mode) {
                                    config.setMode(msg.mode);
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                />
            </View>
        );
    }
}