import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Switch,
  Alert,
  Share,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaywallModal from './PaywallModal';
import { useLanguage } from '../contexts/LanguageContext';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese'];

export default function SettingsModal({ visible, onClose }) {
  const { language, setLanguage, t } = useLanguage();
  const [activeView, setActiveView] = useState('main');
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Feedback state
  const [feedbackText, setFeedbackText] = useState('');

  const handleMenuPress = async (id) => {
    if (id === 'share') {
      try {
        await Share.share({
          message: t('ShareMessage'),
        });
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      setActiveView(id);
    }
  };

  const renderHeader = (title, showBack = false) => (
    <View style={styles.header}>
      {showBack ? (
        <Pressable style={styles.backBtn} onPress={() => setActiveView('main')}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.placeholderBtn} />
      )}
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.closeBtn} onPress={() => { setActiveView('main'); onClose(); }}>
        <Text style={styles.closeIcon}>✕</Text>
      </Pressable>
    </View>
  );

  const renderMain = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Pro Banner */}
      <Pressable onPress={() => setPaywallVisible(true)}>
        <LinearGradient colors={['#2196F3', '#00CFFF']} style={styles.proBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.proTextBlock}>
            <Text style={styles.proTitle}>{t('GetProVersion')}</Text>
            <Text style={styles.proSub}>{t('UnlimitedAccess')}</Text>
            <View style={styles.proBtn}>
              <Text style={styles.proBtnText}>{t('GetNow')}</Text>
            </View>
          </View>
          <Text style={styles.planetEmoji}>🪐</Text>
        </LinearGradient>
      </Pressable>

      {/* Menu Group 1 */}
      <View style={styles.menuGroup}>
        <Pressable style={[styles.menuItem, styles.menuItemBorder]} onPress={() => handleMenuPress('language')}>
          <View style={styles.menuIconBox}><Text style={styles.menuIconEmoji}>🔤</Text></View>
          <Text style={styles.menuLabel}>{t('Language')}</Text>
          <Text style={styles.menuValue}>{language}</Text>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>
        <Pressable style={[styles.menuItem, styles.menuItemBorder]} onPress={() => handleMenuPress('share')}>
          <View style={styles.menuIconBox}><Text style={styles.menuIconEmoji}>📤</Text></View>
          <Text style={styles.menuLabel}>{t('ShareApp')}</Text>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => handleMenuPress('feedback')}>
          <View style={styles.menuIconBox}><Text style={styles.menuIconEmoji}>✉️</Text></View>
          <Text style={styles.menuLabel}>{t('Feedback')}</Text>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>
      </View>

      {/* Menu Group 2 */}
      <View style={[styles.menuGroup, { marginTop: 16 }]}>
        <Pressable style={[styles.menuItem, styles.menuItemBorder]} onPress={() => handleMenuPress('privacy')}>
          <View style={styles.menuIconBox}><Text style={styles.menuIconEmoji}>🛡️</Text></View>
          <Text style={styles.menuLabel}>{t('PrivacyPolicy')}</Text>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>
        <Pressable style={[styles.menuItem, styles.menuItemBorder]} onPress={() => handleMenuPress('terms')}>
          <View style={styles.menuIconBox}><Text style={styles.menuIconEmoji}>📄</Text></View>
          <Text style={styles.menuLabel}>{t('TermsOfService')}</Text>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => handleMenuPress('notifications')}>
          <View style={styles.menuIconBox}><Text style={styles.menuIconEmoji}>💬</Text></View>
          <Text style={styles.menuLabel}>{t('MessageNotification')}</Text>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderLanguage = () => (
    <ScrollView style={styles.subPage}>
      <View style={styles.menuGroup}>
        {LANGUAGES.map((lang, i) => (
          <Pressable
            key={lang}
            style={[styles.menuItem, i < LANGUAGES.length - 1 && styles.menuItemBorder]}
            onPress={() => { setLanguage(lang); setActiveView('main'); }}
          >
            <Text style={styles.menuLabel}>{lang}</Text>
            {language === lang && <Text style={styles.checkIcon}>✓</Text>}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  const renderNotifications = () => (
    <View style={styles.subPage}>
      <View style={styles.menuGroup}>
        <View style={styles.menuItem}>
          <Text style={styles.menuLabel}>{t('PushNotifications')}</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#D1D5DB', true: '#2196F3' }}
          />
        </View>
      </View>
    </View>
  );

  const submitFeedback = () => {
    if (feedbackText.trim() === '') return;
    Alert.alert(t('Feedback'), t('FeedbackSuccess'));
    setFeedbackText('');
    setActiveView('main');
  };

  const renderFeedback = () => (
    <View style={[styles.subPage, { padding: 20 }]}>
      <TextInput
        style={styles.feedbackInput}
        multiline
        placeholder={t('FeedbackPlaceholder')}
        placeholderTextColor="#999"
        value={feedbackText}
        onChangeText={setFeedbackText}
      />
      <Pressable style={styles.feedbackBtn} onPress={submitFeedback}>
        <Text style={styles.feedbackBtnText}>{t('FeedbackSubmit')}</Text>
      </Pressable>
    </View>
  );

  const privacyText = `Last Updated: June 2026\n\n1. Information Collection And Use\nWe prioritize your privacy. This application may require microphone and camera access locally on your device to function correctly (such as measuring decibel levels or rendering thermal overlays). We do not collect, store, or transmit your audio or video data to any external servers.\n\n2. Log Data\nWe may collect diagnostic information to improve the application. This data is strictly anonymous and contains no personally identifiable information.\n\n3. Third-Party Services\nThis app may contain links to third-party services. We are not responsible for the privacy practices of these other sites.\n\n4. Changes To This Privacy Policy\nWe may update our Privacy Policy from time to time. You are advised to review this page periodically for any changes.`;

  const termsText = `Last Updated: June 2026\n\n1. Acceptance of Terms\nBy accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.\n\n2. Subscriptions\nSome parts of the service are billed on a subscription basis. You will be billed in advance on a recurring schedule. Subscriptions auto-renew unless canceled.\n\n3. Use License\nPermission is granted to temporarily download one copy of the materials for personal, non-commercial use only. This is the grant of a license, not a transfer of title.\n\n4. Limitations\nIn no event shall we or our suppliers be liable for any damages arising out of the use or inability to use the materials on our application.\n\n5. Accuracy of Materials\nThe materials appearing in this application could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.`;

  const renderLegal = (title, text) => (
    <ScrollView style={styles.subPage} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.legalText}>{text}</Text>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'main': return renderMain();
      case 'language': return renderLanguage();
      case 'notifications': return renderNotifications();
      case 'feedback': return renderFeedback();
      case 'privacy': return renderLegal(t('PrivacyPolicy'), privacyText);
      case 'terms': return renderLegal(t('TermsOfService'), termsText);
      default: return renderMain();
    }
  };

  const getTitle = () => {
    switch (activeView) {
      case 'main': return t('Settings');
      case 'language': return t('Language');
      case 'notifications': return t('MessageNotification');
      case 'feedback': return t('Feedback');
      case 'privacy': return t('PrivacyPolicy');
      case 'terms': return t('TermsOfService');
      default: return t('Settings');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader(getTitle(), activeView !== 'main')}
        {renderContent()}
      </SafeAreaView>
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 10, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111' },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#EEEEEE',
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { fontSize: 16, color: '#555', fontWeight: '600' },
  backBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#EEEEEE',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#555', fontWeight: '600' },
  placeholderBtn: { width: 34, height: 34 },
  proBanner: {
    margin: 16, borderRadius: 18, padding: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  proTextBlock: { flex: 1 },
  proTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  proSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  proBtn: {
    marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start',
  },
  proBtnText: { color: '#2196F3', fontWeight: '700', fontSize: 15 },
  planetEmoji: { fontSize: 70, marginLeft: 10 },
  menuGroup: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F2F4F8',
    alignItems: 'center', justifyContent: 'center',
  },
  menuIconEmoji: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 16, color: '#111', fontWeight: '500' },
  menuValue: { fontSize: 15, color: '#888', fontWeight: '500' },
  menuChevron: { fontSize: 22, color: '#AABB', fontWeight: '300' },
  subPage: { flex: 1, marginTop: 16 },
  checkIcon: { fontSize: 20, color: '#2196F3', fontWeight: '800' },
  legalText: { fontSize: 15, color: '#555', lineHeight: 24 },
  feedbackInput: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, minHeight: 150,
    textAlignVertical: 'top', fontSize: 16, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  feedbackBtn: { backgroundColor: '#2196F3', borderRadius: 14, padding: 16, alignItems: 'center' },
  feedbackBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
