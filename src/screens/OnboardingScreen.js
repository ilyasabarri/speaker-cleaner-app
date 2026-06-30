import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useLanguage } from '../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

const slides = [
  { key: 'welcome' },
  { key: 'frequency' },
  { key: 'tone' },
];

function WelcomeSlide({ t }) {
  return (
    <View style={styles.slide}>
      <View style={styles.welcomeImageContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.welcomeImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', '#000000']}
          style={styles.imageGradient}
        />
      </View>
      <View style={styles.welcomeText}>
        <Text style={styles.welcomeTitle}>{t('SpeakerTest')}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.laurel}>❧</Text>
          <Text style={styles.statsText}>1,000,000+{'\n'}users worldwide</Text>
          <Text style={styles.laurel}>❧</Text>
        </View>
      </View>
    </View>
  );
}

function FrequencySlide({ t }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnims = useRef([...Array(8)].map(() => new Animated.Value(0))).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Animate floating dots
    floatAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 2000 + i * 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2000 + i * 500, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.slide}>
      <View style={styles.freqCenter}>
        {/* Floating dots */}
        {floatAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingDot,
              {
                top: Math.random() * height * 0.5 + 40,
                left: Math.random() * width,
                width: i % 3 === 0 ? 16 : 10,
                height: i % 3 === 0 ? 16 : 10,
                opacity: 0.4 + (i % 4) * 0.15,
                transform: [{
                  translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] })
                }]
              },
            ]}
          />
        ))}
        <Animated.View style={[styles.speakerCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Svg width={160} height={160} viewBox="0 0 140 140">
            {/* Soft background glow using an SVG circle instead of buggy native shadows */}
            <Circle cx="70" cy="70" r="70" fill="#3B82F6" opacity="0.15" />
            
            {/* Main dark circle */}
            <Circle cx="70" cy="70" r="62" fill="#141E2D" />
            
            {/* Speaker body */}
            <Path
              d="M45 50 L62 50 L84 32 L84 108 L62 90 L45 90 Z"
              fill="#4A90E2"
            />
            
            {/* Inner sound wave */}
            <Path
              d="M96 52 Q110 70 96 88"
              stroke="#4A90E2"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Outer sound wave */}
            <Path
              d="M106 42 Q126 70 106 98"
              stroke="#4A90E2"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
        <Text style={styles.freqTitle}>{t('OnboardingTitle1')}</Text>
        <Text style={styles.freqSubtitle}>{t('OnboardingDesc1')}</Text>
      </View>
    </View>
  );
}

function ToneSlide({ t }) {
  const waveAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, []);

  const waveWidth = width * 0.65;
  const pd = waveWidth / 2;
  const activeWavePath = `M0,70 C${pd*0.25},20 ${pd*0.75},120 ${pd},70 C${pd*1.25},20 ${pd*1.75},120 ${pd*2},70 C${pd*2.25},20 ${pd*2.75},120 ${pd*3},70`;

  return (
    <View style={styles.slide}>
      <View style={styles.toneCenter}>
        <View style={styles.toneCard}>
          <SvgLinearGradient id="toneGrad" x1="0" y1="0" x2="0" y2="1">
             <Stop offset="0" stopColor="#1E3A8A" stopOpacity="1" />
             <Stop offset="1" stopColor="#0B1B3D" stopOpacity="1" />
          </SvgLinearGradient>
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#0B1B3D' }]} />
          
          <View style={{ width: waveWidth, height: 140, overflow: 'hidden' }}>
            <Animated.View style={{
              flexDirection: 'row',
              width: waveWidth * 2,
              transform: [{
                translateX: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -pd]
                })
              }]
            }}>
              <Svg width={waveWidth * 2} height={140} viewBox={`0 0 ${waveWidth * 2} 140`}>
                <Path d={activeWavePath} stroke="#60A5FA" strokeWidth="3" fill="none" />
              </Svg>
            </Animated.View>
          </View>
          
          <Text style={styles.hzNumber}>440<Text style={styles.hzUnit}>Hz</Text></Text>
          <View style={styles.hzUnderline} />
        </View>
        <Text style={styles.freqTitle}>{t('OnboardingTitle2')}</Text>
        <Text style={styles.freqSubtitle}>{t('OnboardingDesc2')}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleContinue = () => {
    if (currentIndex < slides.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      navigation.replace('OnboardingPaywall');
    }
  };

  const renderSlide = (slide) => {
    switch (slide.key) {
      case 'welcome': return <WelcomeSlide key="welcome" t={t} />;
      case 'frequency': return <FrequencySlide key="frequency" t={t} />;
      case 'tone': return <ToneSlide key="tone" t={t} />;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A']} style={StyleSheet.absoluteFillObject} />
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
        {slides.map(renderSlide)}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButtonWrapper} onPress={handleContinue} activeOpacity={0.85}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.continueButton} start={{x:0, y:0}} end={{x:1, y:1}}>
            <Text style={styles.continueText}>{currentIndex === slides.length - 1 ? t('GetStarted') : t('NextStep')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Welcome
  welcomeImageContainer: {
    width,
    height: height * 0.62,
    position: 'absolute',
    top: 0,
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  welcomeText: {
    position: 'absolute',
    bottom: 220,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  laurel: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  statsText: {
    fontSize: 15,
    color: '#00AAFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Frequency
  freqCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 180,
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: '#60A5FA',
    shadowColor: '#60A5FA',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  speakerCircle: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  freqSubtitle: {
    fontSize: 15,
    color: '#8899AA',
    textAlign: 'center',
    paddingHorizontal: 50,
    lineHeight: 22,
  },
  // Tone
  toneCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 180,
  },
  toneCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 40,
    width: width * 0.75,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  hzNumber: {
    fontSize: 52,
    fontWeight: '700',
    color: '#00AAFF',
    marginTop: 10,
  },
  hzUnit: {
    fontSize: 22,
    fontWeight: '400',
    color: '#93C5FD',
  },
  hzUnderline: {
    width: 100,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginTop: 12,
  },
  // Dots
  dotsRow: {
    position: 'absolute',
    bottom: 155,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#3B82F6',
    width: 26,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dotInactive: {
    backgroundColor: '#334155',
  },
  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 30,
    right: 30,
  },
  continueButtonWrapper: {
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    borderRadius: 18,
  },
  continueButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
