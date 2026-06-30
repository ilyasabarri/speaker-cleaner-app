import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import SettingsModal from '../components/SettingsModal';
import PaywallModal from '../components/PaywallModal';
import { useLanguage } from '../contexts/LanguageContext';
import { usePro } from '../contexts/ProContext';

const { width } = Dimensions.get('window');

export default function ThermalScreen() {
  const { t } = useLanguage();
  const { isPro } = usePro();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const pulseOuter = useRef(new Animated.Value(1)).current;
  const heatAnim = useRef(new Animated.Value(0)).current;

  // Ask for permission when we try to start if we don't have it
  const start = async () => {
    if (!isPro) {
      setPaywallVisible(true);
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        alert("Camera permission is required for Thermal Vision mode.");
        return;
      }
    }

    setIsRunning(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOuter, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseOuter, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(heatAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(heatAnim, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  };

  const stop = () => {
    setIsRunning(false);
    pulseOuter.stopAnimation(); pulseOuter.setValue(1);
    heatAnim.stopAnimation(); heatAnim.setValue(0);
  };

  // We add a color matrix filter to simulate thermal vision if possible.
  // Since CameraView doesn't support custom shaders directly easily without gl-react,
  // we overlay a gradient and human shape to make it look "thermal" while blending with the camera.

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('ThermalVision')}</Text>
        <Pressable style={styles.gearBtn} onPress={() => setSettingsVisible(true)}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      {/* Main Camera / Figure Area */}
      <View style={styles.figureArea}>
        {isRunning && permission?.granted ? (
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} facing="back" />
            {/* Thermal overlay filter simulation */}
            <View style={styles.thermalOverlay} />
          </View>
        ) : (
          <View style={styles.placeholderContainer} />
        )}

        {/* Human figure with heat glow overlay */}
        <Animated.View style={[styles.heatGlow, { opacity: heatAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.85] }) }]} />
        <Svg width={200} height={300} viewBox="0 0 200 300" style={styles.humanSvg}>
          {/* Head */}
          <Circle cx="100" cy="40" r="28" fill="#2196F3" opacity={isRunning ? 0.4 : 1} />
          {/* Body */}
          <Path d="M65 75 L135 75 L130 180 L70 180 Z" fill="#1E88E5" opacity={isRunning ? 0.4 : 1} />
          {/* Left arm raised */}
          <Path d="M65 80 L20 30" stroke="#1565C0" strokeWidth="22" strokeLinecap="round" opacity={isRunning ? 0.4 : 1} />
          {/* Right arm down */}
          <Path d="M135 80 L170 140" stroke="#1565C0" strokeWidth="22" strokeLinecap="round" opacity={isRunning ? 0.4 : 1} />
          {/* Left leg */}
          <Path d="M78 178 L68 270" stroke="#1565C0" strokeWidth="22" strokeLinecap="round" opacity={isRunning ? 0.4 : 1} />
          {/* Right leg */}
          <Path d="M122 178 L132 270" stroke="#1565C0" strokeWidth="22" strokeLinecap="round" opacity={isRunning ? 0.4 : 1} />
        </Svg>
      </View>

      {/* Info text */}
      <Text style={styles.infoText}>
        {isRunning ? t('DetectingHeat') : t('TapToStartThermal')}
      </Text>

      {/* Start button with ripple */}
      <View style={styles.buttonArea}>
        <Animated.View style={[styles.rippleOuter, { transform: [{ scale: pulseOuter }] }]}>
          <View style={styles.rippleInner}>
            <Pressable
              style={styles.startBtn}
              onPress={isRunning ? stop : start}
            >
              <Text style={styles.startBtnText}>{isRunning ? t('Stop') : t('Start')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F5FF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  gearBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E0EEFF',
    alignItems: 'center', justifyContent: 'center',
  },
  figureArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#000', // Black background for thermal look when not running
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  thermalOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Overlay semi-transparent colors to mimic a thermal filter look
    backgroundColor: 'rgba(50, 0, 150, 0.4)',
    mixBlendMode: 'color-burn', // works on web
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A1128',
  },
  heatGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 80, 0, 0.5)',
    top: '20%',
    zIndex: 2,
    shadowColor: '#FF5000',
    shadowOpacity: 0.8,
    shadowRadius: 50,
  },
  humanSvg: {
    zIndex: 3,
  },
  infoText: {
    textAlign: 'center',
    color: '#778899',
    fontSize: 14,
    marginVertical: 14,
    paddingHorizontal: 40,
  },
  buttonArea: { alignItems: 'center', marginBottom: 30 },
  rippleOuter: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(33,150,243,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  rippleInner: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(33,150,243,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  startBtn: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#2196F3',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2196F3', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
    zIndex: 10,
  },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
