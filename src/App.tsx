import React from 'react';
import { Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { StatusBar } from 'expo-status-bar';
import { Subscription } from 'expo-modules-core';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

import { RootSiblingParent } from 'react-native-root-siblings';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import i18n from 'i18n-js';

import { createFeature, errorToast, Tabs } from './util';
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

const topicModelMessage = __DEV__ ? 'react-newrun-test' : 'react-newrun';

type notificationModelMessage = {
	channelId: string | null,
	remoteMessage: {
		data: {
			body: string;
			model: string;
			run: string;
			type: string;
			title: string;
		};
		from: string;
	};
};

Notifications.setNotificationHandler({
	handleNotification: async (notification) => {
		console.debug('received notification', notification);
		const remoteMessage = (notification.request.trigger as unknown as notificationModelMessage).remoteMessage;
		if (remoteMessage.from === `/topics/${topicModelMessage}`) {
			if (await config.getNotificationsStatus(remoteMessage.data.model)) {
				await Notifications.dismissAllNotificationsAsync();
				return {
					shouldShowAlert: true,
					shouldPlaySound: true,
					shouldSetBadge: true,
				};
			}
		}
		return {
			shouldShowAlert: false,
			shouldPlaySound: false,
			shouldSetBadge: false,
		};
	}
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

		await Notifications.topicSubscribeAsync(topicModelMessage)
			.catch(() => errorToast(new Error('Push notifications require an official build')));
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

async function decodeURL(url: string | null): Promise<GeoJSONFeature | null> {
	if (url === null) return null;

	const { hostname, path, queryParams } = Linking.parse(url);
	const lat = queryParams.selected_lat ?? queryParams.lat ?? queryParams.center_lat ?? (path ? path.split(',')[0] : undefined);
	const lng = queryParams.selected_long ?? queryParams.long ?? queryParams.center_long ?? (path ? path.split(',')[1] : undefined);
	console.debug('Link URL', hostname, path, lat, lng, queryParams);
	if (lng === undefined && lat === undefined)
		return null;
	return await createFeature({ lng, lat });
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
	const [dummy, setDummy] = React.useState<Record<string, never>>({});

	const [expoPushToken, setExpoPushToken] = React.useState<string | undefined>();
	const notificationListener = React.useRef<Subscription>();

	// Push notifications are available only on Android as only Android
	// supports mass notifications to a topic
	React.useEffect(() => {
		if (Platform.OS === 'android') {
			registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
		}
	}, []);

	// Did the user launch the application by opening a supported URL
	React.useEffect(() => {
		Linking.getInitialURL().then(decodeURL).then((f) => setSelected(f));
		Linking.addEventListener('url', (ev: Linking.EventType) => decodeURL(ev.url).then((f) => setSelected(f)));
	}, []);

	return (
		<RootSiblingParent>
			<NavigationContainer>
				<StatusBar backgroundColor='#007bff' style="dark" hidden={false} />
				<View style={{ height: getStatusBarHeight() }} />
				<Tabs.Navigator initialRouteName='Home' backBehavior='initialRoute'>
					<Tabs.Screen name='Home' options={tabOptions(i18n.t('Home'), IconHome)}>
						{({ navigation }) => <Home selected={selected} setSelected={setSelected} mode={config.mode} />}
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
