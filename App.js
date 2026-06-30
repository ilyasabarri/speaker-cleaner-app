import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OnboardingPaywallScreen from './src/screens/OnboardingPaywallScreen';
import MainTabs from './src/navigation/MainTabs';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ProProvider } from './src/contexts/ProContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ProProvider>
      <LanguageProvider>
        <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="OnboardingPaywall" component={OnboardingPaywallScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </ProProvider>
  );
}
