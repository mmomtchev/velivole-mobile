import React from 'react';
import { Platform, View, Text, StyleSheet, FlatList } from 'react-native';

import { Subscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';

import ServerAPI from './server';

const styles = StyleSheet.create({
    LastRuns: {
        flex: 1,
        margin: 5
    },
    LastRun: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 10,
        marginRight: 0,
        width: '50%'
    }
});

function LastRun(props: { name: string, run: number | undefined; }) {
    return (
        <Text style={styles.LastRun}>
            {props.name}: {props.run !== undefined ? props.run.toString().padStart(2, '0') + 'Z' : 'N/A'}
        </Text>
    );
}

const runs = ['AROME', 'ARPEGE', 'ICON-D2', 'ICON-EU', 'GFS'];

export default function LastRuns() {
    const [lastRuns, setLastRuns] = React.useState<{ name: string, run: number; }[]>([]);
    const responseListener = React.useRef<Subscription>();

    const update = React.useCallback(() => {
        ServerAPI.get('meteo/run/list')
            .then((list) => {
                const runs = Object.keys(list).map((model) => ({
                    name: model,
                    run: (new Date(Object.keys(list[model] as Record<string, unknown>)[0])).getUTCHours()
                })).filter((run) => !isNaN(run.run));
                setLastRuns(runs);
            });
    }, []);

    React.useEffect(update, []);

    if (Platform.OS === 'android') {
        React.useEffect(() => {
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.debug('user clicked notification', response);
                update();
            });

            return () => {
                if (responseListener.current)
                    Notifications.removeNotificationSubscription(responseListener.current);
            };
        }, []);
    }

    setInterval(update, 1000 * 60 * 15);

    return (
        <View style={styles.LastRuns}>
            <FlatList
                data={runs}
                renderItem={(item) => (<LastRun name={item.item} run={(lastRuns.find((m) => m.name === item.item) || {}).run} />)}
                numColumns={2}
                columnWrapperStyle={{ alignSelf: 'flex-start', width: '100%' }}
            />
        </View>
    );
}