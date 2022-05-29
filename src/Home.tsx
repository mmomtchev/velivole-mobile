import React from 'react';
import { Dimensions, FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import i18n from 'i18n-js';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { Location as GeoLocation, errorToast, veliMode } from './util';
import Ad from './Ad';
import Favorites from './Favorites';
import LastRun from './LastRun';
import Location from './Location';
import Search from './Search';
import { GeoJSONFeature } from './server';
import { IGeoDB, init as geoInit } from './GeoDB';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        maxHeight: Dimensions.get('window').height,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: '1.5%'
    },
    mainButton: {
        width: '48%',
        height: 40,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignContent: 'center'
    },
    mainButtonDisabled: {
        width: '48%',
        height: 40,
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignContent: 'center'
    },
    mainButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '900',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    includeTowns: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    includeTownsText: {
        fontSize: 12
    }
});

const dbAirNames: Record<veliMode, string> = {
    'P': 'launch_sites',
    'H': 'launch_sites',
    'S': 'airport_sites'
};

export default function Home(props: {
    selected: GeoJSONFeature | null;
    setSelected: React.Dispatch<React.SetStateAction<GeoJSONFeature | null>>;
    mode: veliMode;
}) {
    const [dbAir] = React.useState<IGeoDB>(() => geoInit(dbAirNames[props.mode]));
    const [dbFavs] = React.useState<IGeoDB>(() => geoInit('favorites'));
    const [dbTowns] = React.useState<IGeoDB>(() => geoInit('places'));
    const [includeTowns, setIncludeTowns] = React.useState<boolean>(false);
    const [selected, setSelected] = [props.selected, props.setSelected];
    const [dummy, setDummy] = React.useState<{}>({});

    const buttons = React.useMemo(() => [
        {
            title: i18n.t('My Location'), onPress: () => {
                GeoLocation().then((loc) => setSelected(loc));
            }
        },
        {
            title: i18n.t('Add to Favorites'), onPress: () => {
                if (selected) {
                    dbFavs.add(selected);
                    setDummy({});
                }
            },
            disabled: selected === null
        }
    ], [dbAir, selected]);

    React.useEffect(() => { dbAir.load(dbAirNames[props.mode]).catch(errorToast); }, [props.mode]);
    React.useEffect(() => { dbTowns.load('places').catch(errorToast); }, []);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='#007bff' style="dark" hidden={false} />
            <View style={{ height: getStatusBarHeight() }} />
            <Ad />
            <Favorites
                dummy={dummy} db={dbFavs} onSelect={setSelected}
                onDelete={React.useCallback((item: GeoJSONFeature) => {
                    dbFavs.delete(item);
                    setDummy({});
                }, [dbFavs])}
            />
            <Location item={selected} />
            <Search
                db={dbAir} dbPlus={includeTowns ? dbTowns : undefined}
                onChange={(site) => setSelected(site)}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LastRun />
                <View style={styles.includeTowns}>
                    <Text numberOfLines={3} style={styles.includeTownsText}>
                        {i18n.t('Include Towns')}
                    </Text>
                    <Switch
                        value={includeTowns}
                        onValueChange={(v) => setIncludeTowns(v)}
                    />
                </View>
            </View>
            <View>
                <FlatList
                    data={buttons}
                    renderItem={(item) => (
                        <TouchableOpacity
                            disabled={item.item.disabled}
                            style={item.item.disabled ? styles.mainButtonDisabled : styles.mainButton}
                            onPress={item.item.onPress}
                        >
                            <Text style={styles.mainButtonText}>{item.item.title}</Text>
                        </TouchableOpacity>
                    )}
                    numColumns={3}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginTop: 5 }}
                />
            </View>
        </View>
    );
}