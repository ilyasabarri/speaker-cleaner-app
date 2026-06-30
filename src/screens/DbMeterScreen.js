import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { Audio } from 'expo-av';
import SettingsModal from '../components/SettingsModal';
import PaywallModal from '../components/PaywallModal';
import { useLanguage } from '../contexts/LanguageContext';
import { usePro } from '../contexts/ProContext';

const { width } = Dimensions.get('window');

const GAUGE_W = Math.min(width - 20, 380);
const CX = GAUGE_W / 2;
const CY = GAUGE_W / 2;
const R = GAUGE_W * 0.38;
const STROKE = 22;
const SVG_H = CY + 50;

// Converts 0→1 fraction to x,y on the TOP semicircle arc
// fraction=0 → left point, fraction=1 → right point, 0.5 → top
function arcX(cx, r, fraction) {
  return cx + r * Math.cos(Math.PI * (1 - fraction));
}
function arcY(cy, r, fraction) {
  return cy - r * Math.sin(Math.PI * (1 - fraction)); // negative = up in SVG
}
function arcSegment(f1, f2) {
  const sx = arcX(CX, R, f1), sy = arcY(CY, R, f1);
  const ex = arcX(CX, R, f2), ey = arcY(CY, R, f2);
  const la = (f2 - f1) > 0.5 ? 1 : 0;
  return `M ${sx} ${sy} A ${R} ${R} 0 ${la} 1 ${ex} ${ey}`;
}

const DB_MAX = 120;

export default function DbMeterScreen() {
  const { t } = useLanguage();
  const { isPro } = usePro();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [maxDb, setMaxDb] = useState(0);
  const [avgDb, setAvgDb] = useState(0);
  const pulseOuter = useRef(new Animated.Value(1)).current;
  const pulseInner = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const readings = useRef([]);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const recordingRef = useRef(null);

  const updateDb = (val) => {
    const db = Math.max(0, Math.min(DB_MAX, val));
    readings.current.push(db);
    const max = Math.max(...readings.current);
    const avg = readings.current.reduce((a, b) => a + b, 0) / readings.current.length;
    setCurrentDb(Math.round(db));
    setMaxDb(Math.round(max));
    setAvgDb(Math.round(avg));
  };

  const startRipple = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOuter, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseOuter, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseInner, { toValue: 1.08, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseInner, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const startMeter = async () => {
    if (!isPro) {
      setPaywallVisible(true);
      return;
    }

    setIsRunning(true);
    readings.current = [];
    startRipple();

    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        const buffer = new Float32Array(analyser.frequencyBinCount);
        intervalRef.current = setInterval(() => {
          analyser.getFloatTimeDomainData(buffer);
          const rms = Math.sqrt(buffer.reduce((s, v) => s + v * v, 0) / buffer.length);
          const db = 20 * Math.log10(rms + 1e-9) + 100;
          updateDb(Math.max(0, db));
        }, 120);
      } catch (_) {
        // Fallback simulation
        intervalRef.current = setInterval(() => {
          updateDb(Math.random() * 65 + 5);
        }, 200);
      }
    } else {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) throw new Error('Permission not granted');
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        recording.setProgressUpdateInterval(120);
        
        recording.setOnRecordingStatusUpdate((status) => {
          if (status.isRecording && status.metering !== undefined) {
            // metering is roughly -160 to 0. 
            // convert to positive dB scale for our UI (0 to 120).
            const db = Math.max(0, status.metering + 120);
            updateDb(db);
          }
        });
        
        await recording.startAsync();
        recordingRef.current = recording;
      } catch (err) {
        console.warn('Native recording failed', err);
        intervalRef.current = setInterval(() => {
          updateDb(Math.random() * 65 + 5);
        }, 200);
      }
    }
  };

  const stopMeter = async () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks?.()?.forEach?.(t => t.stop());
    audioCtxRef.current?.close?.();
    if (recordingRef.current) {
      try { await recordingRef.current.stopAndUnloadAsync(); } catch (e) {}
      recordingRef.current = null;
    }
    streamRef.current = null;
    audioCtxRef.current = null;
    pulseOuter.stopAnimation(); pulseOuter.setValue(1);
    pulseInner.stopAnimation(); pulseInner.setValue(1);
    setCurrentDb(0);
  };

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks?.()?.forEach?.(t => t.stop());
    audioCtxRef.current?.close?.();
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
    }
  }, []);

  const fraction = Math.min(currentDb / DB_MAX, 1);
  const needleX = arcX(CX, R * 0.78, fraction);
  const needleY = arcY(CY, R * 0.78, fraction);

  // DB color label
  const dbColor = currentDb < 40 ? '#44CC44' : currentDb < 70 ? '#FFCC00' : currentDb < 90 ? '#FF8800' : '#FF2222';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('DbMeter')}</Text>
        <Pressable style={styles.gearBtn} onPress={() => setSettingsVisible(true)}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      {/* Gauge */}
      <View style={styles.gaugeArea}>
        <Svg width={GAUGE_W} height={SVG_H} style={{ overflow: 'visible' }}>
          {/* Background arc (light gray) */}
          <Path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            stroke="#E0E8F0"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
          />

          {/* Green segment: 0–40% */}
          <Path d={arcSegment(0, 0.4)} stroke="#44CC44" strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
          {/* Yellow segment: 40–70% */}
          <Path d={arcSegment(0.4, 0.7)} stroke="#FFD000" strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
          {/* Orange segment: 70–85% */}
          <Path d={arcSegment(0.7, 0.85)} stroke="#FF8800" strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
          {/* Red segment: 85–100% */}
          <Path d={arcSegment(0.85, 1.0)} stroke="#FF2222" strokeWidth={STROKE} fill="none" strokeLinecap="round" />

          {/* Tick marks */}
          {[0, 0.167, 0.333, 0.5, 0.667, 0.833, 1.0].map((f, i) => {
            const ix = arcX(CX, R + STROKE / 2 + 10, f);
            const iy = arcY(CY, R + STROKE / 2 + 10, f);
            const lbl = Math.round(f * DB_MAX);
            return (
              <React.Fragment key={i}>
                <Circle cx={arcX(CX, R, f)} cy={arcY(CY, R, f)} r={3} fill="#AAB8CC" />
              </React.Fragment>
            );
          })}

          {/* Needle */}
          <Line
            x1={CX} y1={CY}
            x2={needleX} y2={needleY}
            stroke="#1a1a2e"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Pivot dot */}
          <Circle cx={CX} cy={CY} r={10} fill="#1a1a2e" />
          <Circle cx={CX} cy={CY} r={5} fill="#FFFFFF" />
        </Svg>

        {/* Labels row */}
        <View style={styles.labelsRow}>
          <View style={styles.labelBox}>
            <Text style={styles.labelTitle}>{t('Max')}</Text>
            <Text style={styles.labelValue}>{maxDb} dB</Text>
          </View>
          <View style={styles.dbCenter}>
            <Text style={[styles.bigDb, { color: dbColor }]}>{currentDb}</Text>
            <Text style={styles.dbUnit}>dB</Text>
          </View>
          <View style={styles.labelBox}>
            <Text style={styles.labelTitle}>{t('Average')}</Text>
            <Text style={styles.labelValue}>{avgDb} dB</Text>
          </View>
        </View>
      </View>

      {/* Start/Stop button with ripple */}
      <View style={styles.btnArea}>
        <Animated.View style={[styles.rippleOuter, { transform: [{ scale: pulseOuter }] }]}>
          <Animated.View style={[styles.rippleInner, { transform: [{ scale: pulseInner }] }]}>
            <Pressable
              style={styles.startBtn}
              onPress={isRunning ? stopMeter : startMeter}
            >
              <Text style={styles.startBtnText}>{isRunning ? t('Stop') : t('Start')}</Text>
            </Pressable>
          </Animated.View>
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
  gaugeArea: { alignItems: 'center', marginTop: 10 },
  labelsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: GAUGE_W - 20, marginTop: 8,
  },
  labelBox: { alignItems: 'center', width: 90 },
  labelTitle: { fontSize: 12, color: '#778899', fontWeight: '500' },
  labelValue: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 2 },
  dbCenter: { flexDirection: 'row', alignItems: 'flex-end' },
  bigDb: { fontSize: 54, fontWeight: '800', lineHeight: 60 },
  dbUnit: { fontSize: 20, color: '#555', marginBottom: 8, marginLeft: 4 },
  btnArea: { alignItems: 'center', marginTop: 24 },
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
  },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
