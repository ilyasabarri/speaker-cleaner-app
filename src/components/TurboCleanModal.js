import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

// A simple hook to play a sound on web
let webCtx = null;
let webOsc = null;

function playTurboTone() {
  if (typeof window !== 'undefined' && window.AudioContext) {
    webCtx = new (window.AudioContext || window.webkitAudioContext)();
    webOsc = webCtx.createOscillator();
    const gain = webCtx.createGain();
    
    // Sweep from low to high frequency for "turbo" feel
    webOsc.type = 'sawtooth';
    webOsc.frequency.setValueAtTime(150, webCtx.currentTime);
    webOsc.frequency.exponentialRampToValueAtTime(800, webCtx.currentTime + 3);
    
    gain.gain.setValueAtTime(0, webCtx.currentTime);
    gain.gain.linearRampToValueAtTime(1, webCtx.currentTime + 0.5);
    
    webOsc.connect(gain);
    gain.connect(webCtx.destination);
    webOsc.start();
  }
}

function stopTurboTone() {
  try { if (webCtx) { webCtx.close(); webCtx = null; webOsc = null; } } catch (e) {}
}

export default function TurboCleanModal({ visible, onClose }) {
  const { t } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      stop();
    }
  }, [visible]);

  const start = () => {
    setIsRunning(true);
    setProgress(0);
    progressAnim.setValue(0);
    playTurboTone();

    // Spin animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();

    // 15 seconds turbo clean
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 15000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) stop();
    });
  };

  const stop = () => {
    setIsRunning(false);
    stopTurboTone();
    spinAnim.stopAnimation(); spinAnim.setValue(0);
    pulseAnim.stopAnimation(); pulseAnim.setValue(1);
    progressAnim.stopAnimation(); progressAnim.setValue(0);
  };

  const closeAndStop = () => {
    stop();
    onClose();
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={closeAndStop}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('TurboClearWave')}</Text>
            <Pressable style={styles.closeBtn} onPress={closeAndStop}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.animationArea}>
              {isRunning && (
                <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
              )}
              
              <Animated.View style={[styles.fanContainer, { transform: [{ rotate: spinInterpolate }] }]}>
                <Svg width={140} height={140} viewBox="0 0 140 140">
                  <Circle cx="70" cy="70" r="60" fill="none" stroke={isRunning ? "#00CFFF" : "#E2E8F0"} strokeWidth="10" strokeDasharray="40 20" />
                  <Circle cx="70" cy="70" r="40" fill={isRunning ? "#2196F3" : "#CBD5E1"} />
                  {isRunning && <Path d="M70 20 L80 40 L60 40 Z" fill="#FFF" />}
                  {isRunning && <Path d="M70 120 L60 100 L80 100 Z" fill="#FFF" />}
                  {isRunning && <Path d="M20 70 L40 60 L40 80 Z" fill="#FFF" />}
                  {isRunning && <Path d="M120 70 L100 80 L100 60 Z" fill="#FFF" />}
                </Svg>
              </Animated.View>
            </View>

            <Text style={styles.statusTitle}>
              {isRunning ? t('CleaningInProgress') : t('ReadyToStart')}
            </Text>
            <Text style={styles.statusSub}>
              {isRunning ? t('DoNotCloseApp') : t('HighIntensitySound')}
            </Text>

            {/* Progress bar */}
            {isRunning && (
              <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
              </View>
            )}

            <View style={{ flex: 1 }} />

            <Pressable style={styles.startBtn} onPress={isRunning ? stop : start}>
              <LinearGradient colors={['#FF007A', '#7928CA']} style={styles.startGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.startBtnText}>{isRunning ? t('StopTurbo') : t('StartTurboClean')}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#F0F5FF',
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { fontSize: 16, fontWeight: '700', color: '#555' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  animationArea: {
    width: 250, height: 250,
    alignItems: 'center', justifyContent: 'center',
    marginVertical: 40,
  },
  pulseCircle: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
  },
  fanContainer: { alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 8, textAlign: 'center' },
  statusSub: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  progressBarContainer: {
    width: '100%', height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#2196F3', borderRadius: 4 },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 20 },
  startGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
