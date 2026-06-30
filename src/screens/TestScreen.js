import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import SettingsModal from '../components/SettingsModal';
import PaywallModal from '../components/PaywallModal';
import TurboCleanModal from '../components/TurboCleanModal';
import WebAudioPlayer from '../components/WebAudioPlayer';
import { useLanguage } from '../contexts/LanguageContext';
import { usePro } from '../contexts/ProContext';

const { width } = Dimensions.get('window');

// Web Audio API context for web platform
let webCtx = null;
let webOsc = null;

function playWebTone(freq, vol) {
  stopWebTone();
  if (typeof window !== 'undefined' && window.AudioContext) {
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
}

function stopWebTone() {
  try { if (webCtx) { webCtx.close(); webCtx = null; webOsc = null; } } catch (e) {}
}

const DAYS = [1, 2, 3, 4, 5, 6, 7];

const getTestModes = (t) => [
  {
    id: 'basic',
    title: t('BasicTesting'),
    subtitle: t('BasicSubtitle'),
    color: ['#2196F3', '#00BFFF'],
  },
  {
    id: 'water',
    title: t('WaterEject'),
    subtitle: t('WaterSubtitle'),
    color: ['#00BFFF', '#0077CC'],
  },
  {
    id: 'deep',
    title: t('DeepClean'),
    subtitle: t('DeepSubtitle'),
    color: ['#0077CC', '#003d80'],
  },
];

function PhoneMockup() {
  return (
    <View style={styles.phoneMockup}>
      <View style={styles.phoneSpeakerLeft} />
      <View style={styles.phoneChargePort} />
      <View style={styles.phoneSpeakerRight} />
    </View>
  );
}

export default function TestScreen() {
  const { t } = useLanguage();
  const { isPro } = usePro();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [turboVisible, setTurboVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMode, setSelectedMode] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const TEST_MODES = getTestModes(t);

  const sendAudio = (data) => {
    if (Platform.OS === 'web') {
      if (data.action === 'start') playWebTone(data.freq, data.vol);
      else stopWebTone();
    } else {
      audioRef.current?.send(data);
    }
  };

  useEffect(() => () => { sendAudio({ action: 'stop' }); }, []);

  const startTest = () => {
    if (selectedMode === 2 && !isPro) {
      setPaywallVisible(true);
      return;
    }
    
    setIsRunning(true);
    setProgress(0);
    progressAnim.setValue(0);
    const duration = selectedMode === 0 ? 29 : selectedMode === 1 ? 45 : 60;
    const freq = selectedMode === 0 ? 300 : selectedMode === 1 ? 165 : 500;
    
    sendAudio({ action: 'start', freq, vol: 0.8 });

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        stopTest();
      }
    });
  };

  const stopTest = () => {
    setIsRunning(false);
    sendAudio({ action: 'stop' });
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const currentMode = TEST_MODES[selectedMode];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {Platform.OS !== 'web' && <WebAudioPlayer ref={audioRef} />}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('SpeakerTest')}</Text>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconBtn} onPress={() => setPaywallVisible(true)}>
              <Text style={styles.iconEmoji}>🎁</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => setSettingsVisible(true)}>
              <View style={styles.gearBtn}>
                <Text style={styles.gearIcon}>⚙️</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 7 Day Plan Card */}
        <LinearGradient colors={['#2196F3', '#00BFFF']} style={styles.planCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.planCardHeader}>
            <View style={styles.calendarIcon}>
              <Text style={styles.calendarEmoji}>📅</Text>
            </View>
            <View style={styles.planCardTextBlock}>
              <Text style={styles.planCardTitle}>{t('SevenDayPlan')}</Text>
              <Text style={styles.planCardSub}>{t('CompleteScheduleDaily')}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Day Selector */}
          <View style={styles.dayRow}>
            {DAYS.map((day) => (
              <Pressable
                key={day}
                style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
                onPress={() => setSelectedDay(day)}
              >
                {day === 1 && selectedDay === 1 ? (
                  <Text style={styles.checkMark}>✓</Text>
                ) : (
                  <Text style={[styles.dayNum, selectedDay === day && styles.dayNumActive]}>{day}</Text>
                )}
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Mode Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll}>
            {TEST_MODES.map((mode, i) => (
              <Pressable
                key={mode.id}
                style={[styles.modeTab, selectedMode === i && styles.modeTabActive]}
                onPress={() => setSelectedMode(i)}
              >
                <Text style={[styles.modeTabText, selectedMode === i && styles.modeTabTextActive]}>{mode.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Active Mode Display */}
          <View style={styles.activeModeRow}>
            <View style={styles.activeModeLeft}>
              <Text style={styles.activeModeTitle}>{currentMode.title}</Text>
              <Text style={styles.activeModeSubtitle}>{currentMode.subtitle}</Text>
            </View>
            <PhoneMockup />
          </View>

          {/* Progress bar */}
          {isRunning && (
            <View style={styles.progressBarContainer}>
              <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>
          )}

          <Pressable
            style={styles.startBtn}
            onPress={isRunning ? stopTest : startTest}
          >
            <Text style={styles.startBtnText}>{isRunning ? t('StopTesting') : t('StartTesting')}</Text>
          </Pressable>
        </LinearGradient>

        {/* Turbo Clear Wave Card */}
        <View style={styles.turboCard}>
          <View style={styles.turboLeft}>
            <View style={styles.turboIconBox}>
              <Text style={styles.turboIcon}>⚡</Text>
            </View>
            <View>
              <Text style={styles.turboTitle}>{t('TurboClearWave')}</Text>
              <Text style={styles.turboSub}>{t('MoreEfficientMethod')}</Text>
            </View>
          </View>
          <Pressable style={styles.nextBtn} onPress={() => {
            if (!isPro) setPaywallVisible(true);
            else setTurboVisible(true);
          }}>
            <Text style={styles.nextBtnText}>{t('Next')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
      <TurboCleanModal visible={turboVisible} onClose={() => setTurboVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5FF',
  },
  scroll: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconBtn: {
    padding: 2,
  },
  iconEmoji: { fontSize: 26 },
  gearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: { fontSize: 18 },
  planCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  calendarIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarEmoji: { fontSize: 28 },
  planCardTextBlock: { flex: 1 },
  planCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planCardSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  dayRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dayBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dayBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  dayNum: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  dayNumActive: {
    color: '#2196F3',
  },
  checkMark: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 14,
  },
  modeScroll: {
    marginBottom: 14,
  },
  modeTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
  },
  modeTabText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  modeTabTextActive: {
    color: '#2196F3',
    fontWeight: '700',
  },
  activeModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  activeModeLeft: {},
  activeModeTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeModeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  phoneMockup: {
    width: 110,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 8,
    gap: 6,
  },
  phoneSpeakerLeft: {
    width: 26,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 3,
  },
  phoneChargePort: {
    width: 16,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 3,
  },
  phoneSpeakerRight: {
    width: 26,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 3,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  startBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  startBtnText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '700',
  },
  turboCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  turboLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  turboIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  turboIcon: { fontSize: 20 },
  turboTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  turboSub: {
    fontSize: 12,
    color: '#888',
    maxWidth: 180,
    marginTop: 2,
  },
  nextBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    zIndex: 10,
  },
  nextBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
