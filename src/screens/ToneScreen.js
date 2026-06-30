import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import SettingsModal from '../components/SettingsModal';
import PaywallModal from '../components/PaywallModal';
import WebAudioPlayer from '../components/WebAudioPlayer';
import { useLanguage } from '../contexts/LanguageContext';
import { usePro } from '../contexts/ProContext';

const { width } = Dimensions.get('window');

const PRESETS = [100, 165, 200, 300, 440, 528, 1000, 2000, 5000, 10000, 15000, 20000];

// Web Audio API context for web platform
let webCtx = null;
let webOsc = null;

function playWebTone(freq, vol) {
  stopWebTone();
  webCtx = new (window.AudioContext || window.webkitAudioContext)();
  webOsc = webCtx.createOscillator();
  const gain = webCtx.createGain();
  webOsc.type = 'sine';
  webOsc.frequency.value = freq;
  gain.gain.value = vol;
  webOsc.connect(gain);
  gain.connect(webCtx.destination);
  webOsc.start();
}

function stopWebTone() {
  try { if (webCtx) { webCtx.close(); webCtx = null; webOsc = null; } } catch (e) {}
}

export default function ToneScreen() {
  const { t } = useLanguage();
  const { isPro } = usePro();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = useRef(null);
  const pulseOuter = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const sendAudio = (data) => {
    if (Platform.OS === 'web') {
      if (data.action === 'start') playWebTone(data.freq, data.vol);
      else stopWebTone();
    } else {
      audioRef.current?.send(data);
    }
  };

  const startTone = () => {
    if (!isPro) {
      setPaywallVisible(true);
      return;
    }
    setIsRunning(true);
    sendAudio({ action: 'start', freq: frequency, vol: 0.7 });
    
    // Animate button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOuter, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseOuter, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    
    // Start wave animation (translates horizontally)
    waveAnim.setValue(0);
    Animated.loop(
      Animated.timing(waveAnim, { toValue: 1, duration: 800, useNativeDriver: true })
    ).start();
  };

  const stopTone = () => {
    setIsRunning(false);
    sendAudio({ action: 'stop' });
    pulseOuter.stopAnimation(); pulseOuter.setValue(1);
    waveAnim.stopAnimation(); waveAnim.setValue(0);
  };

  const changeFrequency = (delta) => {
    setFrequency((prev) => {
      let next = Math.max(20, Math.min(20000, prev + delta));
      if (!isPro && (next > 5000 || next < 100)) {
        setPaywallVisible(true);
        next = prev; // Revert change
        if (isRunning) stopTone(); // Stop if we hit paywall
      }
      if (isRunning && next !== prev) sendAudio({ action: 'start', freq: next, vol: 0.7 });
      return next;
    });
  };

  const selectPreset = (freq) => {
    if (!isPro && (freq > 5000 || freq < 100)) {
      setPaywallVisible(true);
      if (isRunning) stopTone();
      return;
    }
    setFrequency(freq);
    if (isRunning) sendAudio({ action: 'start', freq, vol: 0.7 });
  };

  useEffect(() => () => { sendAudio({ action: 'stop' }); }, []);

  const formatFreq = (f) => f >= 1000 ? `${(f / 1000).toFixed(f % 1000 === 0 ? 0 : 1)}k` : `${f}`;

  // We draw 3 periods of the sine wave so we can slide it left endlessly
  const waveWidth = width - 40;
  const pd = waveWidth / 2; // one period width
  // A path spanning 3 periods:
  const activeWavePath = `M0,30 
    C${pd*0.25},5 ${pd*0.75},55 ${pd},30 
    C${pd*1.25},5 ${pd*1.75},55 ${pd*2},30 
    C${pd*2.25},5 ${pd*2.75},55 ${pd*3},30
    C${pd*3.25},5 ${pd*3.75},55 ${pd*4},30`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Native audio engine (hidden) */}
      {Platform.OS !== 'web' && <WebAudioPlayer ref={audioRef} />}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('ToneGenerator')}</Text>
        <Pressable style={styles.gearBtn} onPress={() => setSettingsVisible(true)}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.separator} />

      {/* Waveform display */}
      <View style={styles.waveMask}>
        <Animated.View style={[
          styles.waveContainer,
          {
            transform: [{
              translateX: isRunning ? waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -pd] // translate left by 1 period
              }) : 0
            }]
          }
        ]}>
          <Svg width={waveWidth * 2} height={60} viewBox={`0 0 ${waveWidth * 2} 60`}>
            {isRunning ? (
              <Path
                d={activeWavePath}
                stroke="#2196F3" strokeWidth="2.5" fill="none"
              />
            ) : (
              <Path d={`M0,30 L${waveWidth*2},30`} stroke="#CCDDEE" strokeWidth="2" fill="none" />
            )}
          </Svg>
        </Animated.View>
      </View>

      {/* Frequency display */}
      <View style={styles.freqRow}>
        <Pressable style={styles.arrowBtn} onPress={() => changeFrequency(-1)}>
          <Text style={styles.arrow}>◀</Text>
        </Pressable>
        <Text style={styles.freqDisplay}>
          {frequency}<Text style={styles.hzUnit}>Hz</Text>
        </Text>
        <Pressable style={styles.arrowBtn} onPress={() => changeFrequency(1)}>
          <Text style={styles.arrow}>▶</Text>
        </Pressable>
      </View>

      {/* Preset buttons */}
      <View style={styles.presetGrid}>
        {PRESETS.map((p) => (
          <Pressable
            key={p}
            style={[styles.presetBtn, frequency === p && styles.presetBtnActive]}
            onPress={() => selectPreset(p)}
          >
            <Text style={[styles.presetText, frequency === p && styles.presetTextActive]}>
              {formatFreq(p)}Hz
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Start button with ripple */}
      <View style={styles.buttonArea}>
        <Animated.View style={[styles.rippleOuter, { transform: [{ scale: pulseOuter }] }]}>
          <View style={styles.rippleInner}>
            <Pressable
              style={styles.startBtn}
              onPress={isRunning ? stopTone : startTone}
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 10, paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  gearBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E0EEFF', alignItems: 'center', justifyContent: 'center',
  },
  separator: { height: 2, backgroundColor: '#2196F3', marginHorizontal: 22, borderRadius: 1 },
  waveMask: {
    marginTop: 20,
    marginHorizontal: 20,
    height: 60,
    overflow: 'hidden',
  },
  waveContainer: { 
    height: 60,
    flexDirection: 'row',
  },
  freqRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 30, gap: 30,
  },
  arrowBtn: { padding: 12, zIndex: 10 },
  arrow: { fontSize: 22, color: '#2196F3' },
  freqDisplay: {
    fontSize: 58, fontWeight: '800', color: '#2196F3',
    minWidth: 180, textAlign: 'center',
  },
  hzUnit: { fontSize: 24, fontWeight: '400', color: '#2196F3' },
  presetGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: 20, marginTop: 24, gap: 8, justifyContent: 'center',
  },
  presetBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#E8F0FF', borderWidth: 1, borderColor: '#C0D8FF',
    zIndex: 10,
  },
  presetBtnActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  presetText: { fontSize: 13, color: '#2196F3', fontWeight: '500' },
  presetTextActive: { color: '#FFF', fontWeight: '700' },
  buttonArea: { alignItems: 'center', marginTop: 30 },
  rippleOuter: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(33,150,243,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  rippleInner: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(33,150,243,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  startBtn: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2196F3', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
    zIndex: 10,
  },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
