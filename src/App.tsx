import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { Subscription } from 'expo-modules-core';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { RootSiblingParent } from 'react-native-root-siblings';
import i18n from 'i18n-js';

import { Tabs } from './util';
import Home from './Home';
import Map from './Map';
import Aux from './Aux';
import Settings from './Settings';
import { GeoJSONFeature } from './server';
import { config } from './config';

import IconHome from '../icons/bookmark.svg';
import IconMap from '../icons/map.svg';
import IconProfile from '../icons/table.svg';
import IconEmagram from '../icons/chart.svg';
import IconSettings from '../icons/settings.svg';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	})
});

async function registerForPushNotificationsAsync() {
	let token;
	if (Device.isDevice) {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== 'granted') {
			alert('Failed to get push token for push notification!');
			return;
		}
		token = (await Notifications.getDevicePushTokenAsync()).data;
		console.debug('Obtained push notification token', token);

		await Notifications.topicSubscribeAsync('modelruns');
	} else {
		alert('Must use physical device for Push Notifications');
	}

	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		});
	}

	return token;
}

function tabOptions(title: string, Icon: typeof IconHome): BottomTabNavigationOptions {
	return {
		headerShown: false,
		tabBarLabel: title,
		tabBarIcon: ({ focused, size, color }) =>
			Platform.OS !== 'web' ? <Icon fill={focused ? color : 'black'} width={size} height={size} /> : undefined
	};
}

export default function App() {
	const [selected, setSelected] = React.useState<GeoJSONFeature | null>(null);
	const [dummy, setDummy] = React.useState<{}>({});

	const [expoPushToken, setExpoPushToken] = React.useState<string | undefined>();
	const notificationListener = React.useRef<Subscription>();
	const responseListener = React.useRef<Subscription>();

	// Push notifications are available only on Android as only Android
	// supports mass notifications to a topic
	if (Platform.OS === 'android') {
		React.useEffect(() => {
			registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

			notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
				console.debug('received notification', notification);
			});

			responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
				console.debug('user clicked notification', response);
			});

			return () => {
				if (notificationListener.current)
					Notifications.removeNotificationSubscription(notificationListener.current);
				if (responseListener.current)
					Notifications.removeNotificationSubscription(responseListener.current);
			};
		}, []);
	}

	return (
		<RootSiblingParent>
			<NavigationContainer>
				<Tabs.Navigator initialRouteName='Home' backBehavior='initialRoute'>
					<Tabs.Screen name='Home' options={tabOptions(i18n.t('Home'), IconHome)}>
						{() => <Home selected={selected} setSelected={setSelected} mode={config.mode} />}
					</Tabs.Screen>
					<Tabs.Screen name='Map' options={tabOptions(i18n.t('Map'), IconMap)}>
						{() => <Map selected={selected} setSelected={setSelected} mode={config.mode} height={config.height} />}
					</Tabs.Screen>
					{
						selected !== null ?
							<React.Fragment>
								<Tabs.Screen name='Profile' options={tabOptions(i18n.t('Profile'), IconProfile)}>
									{() => <Aux selected={selected} page='profile' />}
								</Tabs.Screen>
								<Tabs.Screen name='Emagram' options={tabOptions(i18n.t('Emagram'), IconEmagram)}>
									{() => <Aux selected={selected} page='emagram' />}
								</Tabs.Screen>
							</React.Fragment>
							: null
					}
					<Tabs.Screen name='Settings' options={tabOptions(i18n.t('Settings'), IconSettings)}>
						{() => <Settings config={config} update={() => setDummy({})} />}
					</Tabs.Screen>
				</Tabs.Navigator>
			</NavigationContainer>
		</RootSiblingParent>
	);
}
