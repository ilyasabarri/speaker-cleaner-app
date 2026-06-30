import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import TestScreen from '../screens/TestScreen';
import DbMeterScreen from '../screens/DbMeterScreen';
import ToneScreen from '../screens/ToneScreen';
import ThermalScreen from '../screens/ThermalScreen';
import { useLanguage } from '../contexts/LanguageContext';

const Tab = createBottomTabNavigator();

function DropIcon({ color }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" fill={color} />
    </Svg>
  );
}

function GaugeIcon({ color }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12C2 15.54 3.73 18.68 6.38 20.64L7.86 19.16C5.61 17.57 4 15.46 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 15.46 18.39 17.57 16.14 19.16L17.62 20.64C20.27 18.68 22 15.54 22 12C22 6.48 17.52 2 12 2Z" fill={color} />
      <Path d="M12 6L9 14H12V18L15 10H12V6Z" fill={color} />
    </Svg>
  );
}

function WaveIcon({ color }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M2 12C2 12 5 6 8 6C11 6 11 18 14 18C17 18 22 12 22 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function PersonIcon({ color }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="6" r="3" fill={color} />
      <Path d="M12 10C8 10 6 13 6 15H18C18 13 16 10 12 10Z" fill={color} />
      <Path d="M9 15L7 22M15 15L17 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6 11L2 8M18 11L22 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export default function MainTabs() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#8899AA',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Test"
        component={TestScreen}
        options={{
          tabBarLabel: t('Test'),
          tabBarIcon: ({ color }) => <DropIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="dB Meter"
        component={DbMeterScreen}
        options={{
          tabBarLabel: t('DbMeter'),
          tabBarIcon: ({ color }) => <GaugeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Tone"
        component={ToneScreen}
        options={{
          tabBarLabel: t('Tone'),
          tabBarIcon: ({ color }) => <WaveIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Thermal"
        component={ThermalScreen}
        options={{
          tabBarLabel: t('Thermal'),
          tabBarIcon: ({ color }) => <PersonIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    height: 70,
    paddingBottom: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
