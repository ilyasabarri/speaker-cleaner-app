import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { usePro } from '../contexts/ProContext';

const { width, height } = Dimensions.get('window');

const features = [
  { icon: '💦', title: 'Speaker Test', sub: 'Apply a range of sound waves for deep testing' },
  { icon: '〰️', title: 'Tone Generator', sub: 'Customizable sound wave frequency' },
  { icon: '⏱️', title: 'Decibel Meter', sub: 'Real-time detection of environmental decibels' },
  { icon: '⚡', title: 'Turbo Clear Wave', sub: 'A more efficient method to test the speakers' },
  { icon: '🚫', title: 'No Ads', sub: 'Enjoy faster, distraction-free speaker testing' },
];

export default function OnboardingPaywallScreen({ navigation }) {
  const { language } = useLanguage();
  const { unlockPro } = usePro();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const getPrice = () => {
    switch (language) {
      case 'ja': return '¥300 per month';
      case 'fr':
      case 'es':
      case 'de': return '€1.99 per month';
      case 'en':
      default: return '$1.99 per month';
    }
  };

  const handleContinue = () => {
    if (currentIndex === 0) {
      setCurrentIndex(1);
      scrollRef.current?.scrollTo({ x: width, animated: true });
    } else {
      unlockPro();
      navigation.replace('Main');
    }
  };

  const handleClose = () => {
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'file:///C:/Users/AzComputer/.gemini/antigravity-ide/brain/6d068677-d21a-4ba6-8383-16a9141b131e/phone_speaker_water_1782843188112.png' }}
        style={styles.imageBg}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.gradientOverlay} />
      </ImageBackground>

      <View style={styles.contentArea}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(idx);
          }}
        >
          {/* Card 1: What will you get? */}
          <View style={styles.slide}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>What will you get?</Text>
              <View style={styles.featureList}>
                {features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <View style={styles.iconBox}>
                      <Text style={styles.icon}>{f.icon}</Text>
                    </View>
                    <View style={styles.featureText}>
                      <Text style={styles.fTitle}>{f.title}</Text>
                      <Text style={styles.fSub}>{f.sub}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Card 2: How your free trial works */}
          <View style={styles.slide}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How your free trial works</Text>
              
              <View style={styles.timeline}>
                {/* Step 1 */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineIconActive}>
                    <Text style={styles.check}>✓</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.tTitleActive}>Today: Start your trial</Text>
                    <Text style={styles.tSub}>Unlock all premium features.</Text>
                  </View>
                </View>
                <View style={styles.lineActive} />

                {/* Step 2 */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineIconInactive}>
                    <Text style={styles.clock}>⏰</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.tTitleActive}>Tomorrow: Reminder</Text>
                    <Text style={styles.tSub}>We encourage you to set a reminder for your trial's ending</Text>
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationText}>You will receive a notification</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.lineInactive} />

                {/* Step 3 */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineIconInactive}>
                    <Text style={styles.star}>★</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.tTitleActive}>Day 3: End of Trial</Text>
                    <Text style={styles.tSub}>You will be charged, but you can cancel anytime before</Text>
                  </View>
                </View>

              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.priceText}>
            3 days free, then <Text style={styles.priceBold}>{getPrice()}</Text>.
          </Text>
          
          <Pressable style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueText}>{currentIndex === 0 ? 'Continue' : 'Pay Now'}</Text>
          </Pressable>

          <View style={styles.legalLinks}>
            <Text style={styles.legalText}>Terms</Text>
            <Text style={styles.legalDot}>|</Text>
            <Text style={styles.legalText}>Privacy</Text>
            <Text style={styles.legalDot}>|</Text>
            <Text style={styles.legalText}>Restore</Text>
          </View>

          <View style={styles.securityBadge}>
            <Text style={styles.shield}>🛡️</Text>
            <Text style={styles.securityText}>No payment now</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  imageBg: { width, height: height * 0.45, position: 'absolute', top: 0 },
  safeArea: { paddingHorizontal: 20, paddingTop: 10 },
  closeBtn: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { color: 'rgba(255,255,255,0.5)', fontSize: 20 },
  gradientOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
    backgroundColor: '#000',
    opacity: 0.8,
  },
  contentArea: { flex: 1, marginTop: height * 0.25 },
  slide: { width, alignItems: 'center' },
  card: {
    width: width * 0.9,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    color: '#3B82F6',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Features List
  featureList: { gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  featureText: { flex: 1 },
  fTitle: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  fSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  
  // Timeline
  timeline: { paddingHorizontal: 10 },
  timelineRow: { flexDirection: 'row', gap: 16 },
  timelineIconActive: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
    zIndex: 2,
  },
  check: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  timelineIconInactive: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
    zIndex: 2,
  },
  clock: { fontSize: 12 },
  star: { color: '#FFF', fontSize: 12 },
  lineActive: {
    width: 2, height: 40,
    backgroundColor: '#3B82F6',
    position: 'absolute', left: 21, top: 26, zIndex: 1,
  },
  lineInactive: {
    width: 2, height: 40,
    backgroundColor: '#333',
    position: 'absolute', left: 21, top: 120, zIndex: 1,
  },
  timelineContent: { flex: 1, paddingBottom: 24 },
  tTitleActive: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  tSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  notificationBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  notificationText: { color: '#4ADE80', fontSize: 12, fontWeight: '600' },

  // Footer
  footer: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
    alignItems: 'center',
  },
  priceText: { color: '#FFF', fontSize: 14, marginBottom: 16 },
  priceBold: { fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#3B82F6',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  legalLinks: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  legalText: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  legalDot: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  securityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shield: { fontSize: 14 },
  securityText: { color: '#4ADE80', fontSize: 12, fontWeight: '600' },
});
