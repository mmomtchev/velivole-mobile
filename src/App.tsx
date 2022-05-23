import React from 'react';
import { Dimensions, StyleSheet, View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

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
