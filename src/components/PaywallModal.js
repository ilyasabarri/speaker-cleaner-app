import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useLanguage } from '../contexts/LanguageContext';
import { usePro } from '../contexts/ProContext';

const { width, height } = Dimensions.get('window');

const getFeatures = (t) => [
  { icon: '💦', title: t('Feature1Title'), sub: t('Feature1Sub') },
  { icon: '🔊', title: t('Feature2Title'), sub: t('Feature2Sub') },
  { icon: '🎛️', title: t('Feature3Title'), sub: t('Feature3Sub') },
  { icon: '🚫', title: t('Feature4Title'), sub: t('Feature4Sub') },
];

export default function PaywallModal({ visible, onClose }) {
  const { t, language } = useLanguage();
  const { unlockPro } = usePro();
  const FEATURES = getFeatures(t);
  
  const getPrice = () => {
    switch (language) {
      case 'ja': return '¥300';
      case 'fr':
      case 'es':
      case 'de': return '€1.99';
      case 'en':
      default: return '$1.99';
    }
  };

  const handlePurchase = () => {
    unlockPro();
    onClose();
  };
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E3A8A']} style={StyleSheet.absoluteFillObject} />
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Visual Header */}
            <View style={styles.heroSection}>
              <Text style={styles.planetEmoji}>🪐</Text>
              <View style={styles.badgeContainer}>
                <LinearGradient colors={['#FF007A', '#7928CA']} style={styles.badge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.badgeText}>{t('FiftyOffToday')}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.title}>{t('UnlockFullAccess')}</Text>
              <Text style={styles.subtitle}>{t('GetUltimateToolset')}</Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              {FEATURES.map((feat, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIconBox}>
                    <Text style={styles.featureIcon}>{feat.icon}</Text>
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feat.title}</Text>
                    <Text style={styles.featureSub}>{feat.sub}</Text>
                  </View>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              ))}
            </View>

            <View style={{ flex: 1 }} />

            {/* Pricing & CTA */}
            <View style={styles.footer}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceValue}>{getPrice()}</Text>
                <Text style={styles.pricePeriod}>/ {t('Month') || 'month'}</Text>
              </View>
              <Text style={styles.cancelText}>{t('CancelAnytime')}</Text>
              
              <Pressable style={styles.ctaBtn} onPress={handlePurchase}>
                <LinearGradient colors={['#2196F3', '#00BFFF']} style={styles.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.ctaText}>{t('Continue')}</Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.legalLinks}>
                <Text style={styles.legalText}>{t('TermsOfService')}</Text>
                <Text style={styles.legalDot}>•</Text>
                <Text style={styles.legalText}>{t('Restore')}</Text>
                <Text style={styles.legalDot}>•</Text>
                <Text style={styles.legalText}>{t('PrivacyPolicy')}</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30, flexGrow: 1 },
  heroSection: { alignItems: 'center', marginTop: 20 },
  planetEmoji: { fontSize: 100, marginBottom: 10 },
  badgeContainer: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF007A', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5,
  },
  badge: { paddingHorizontal: 16, paddingVertical: 6 },
  badgeText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingHorizontal: 20 },
  featuresList: { marginTop: 40, gap: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIconBox: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureIcon: { fontSize: 22 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  featureSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  checkIcon: { fontSize: 20, color: '#00CFFF', fontWeight: '800' },
  footer: { marginTop: 40 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  priceValue: { fontSize: 40, fontWeight: '800', color: '#FFF' },
  pricePeriod: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginLeft: 4, fontWeight: '500' },
  cancelText: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6, marginBottom: 20 },
  ctaBtn: { borderRadius: 18, overflow: 'hidden' },
  ctaGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 12 },
  legalText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '500' },
  legalDot: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
});
