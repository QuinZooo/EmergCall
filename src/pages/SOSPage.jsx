import * as React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase.js';
import { loadAppSettings, DEFAULT_APP_SETTINGS } from '../lib/appSettings.js';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function SOSPage({ navigation }) {
  const [countdown, setCountdown] = React.useState(DEFAULT_APP_SETTINGS.sosCountdownSeconds);
  const [contacts, setContacts] = React.useState([]);
  const [isSending, setIsSending] = React.useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [medicalInfo, setMedicalInfo] = React.useState(null);
  const [appSettings, setAppSettings] = React.useState({ ...DEFAULT_APP_SETTINGS });
  const hasSentRef = React.useRef(false);
  const alarmSoundRef = React.useRef(null);
  const alarmTimeoutRef = React.useRef(null);

  const getStorageKey = (suffix) => (user?.id ? `${suffix}:${user.id}` : suffix);

  const loadContacts = async () => {
    try {
      const key = getStorageKey('emergencyContacts');
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.warn('Failed to read contacts', error);
    }
  };

  const loadMedicalInfo = async () => {
    try {
      const key = getStorageKey('medicalInfo');
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setMedicalInfo(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to load medical info', err);
    }
  };

  const loadSettings = async (nextUser) => {
    try {
      const stored = await loadAppSettings(nextUser?.id);
      setAppSettings(stored);
      setCountdown(stored.sosCountdownSeconds);
    } catch (err) {
      console.warn('Failed to load app settings', err);
      setAppSettings({ ...DEFAULT_APP_SETTINGS });
      setCountdown(DEFAULT_APP_SETTINGS.sosCountdownSeconds);
    }
  };

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.warn('Failed to get session', err);
      }
    };

    fetchUser();
  }, []);

  React.useEffect(() => {
    loadContacts();
    loadMedicalInfo();
    loadSettings(user);
  }, [user]);

  React.useEffect(() => {
    if (hasSentRef.current) {
      return;
    }

    if (countdown <= 0) {
      sendSOS();
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const stopAlarm = React.useCallback(async () => {
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }

    if (!alarmSoundRef.current) {
      return;
    }

    try {
      await alarmSoundRef.current.stopAsync();
      await alarmSoundRef.current.unloadAsync();
    } catch (err) {
      console.warn('Failed to stop alarm', err);
    } finally {
      alarmSoundRef.current = null;
      setIsAlarmPlaying(false);
    }
  }, []);

  const playAlarm = React.useCallback(async () => {
    try {
      if (alarmSoundRef.current) {
        await alarmSoundRef.current.replayAsync();
      } else {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/sos_alert.mp3'),
          { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        alarmSoundRef.current = sound;
      }

      setIsAlarmPlaying(true);

      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
      }

      alarmTimeoutRef.current = setTimeout(() => {
        stopAlarm();
      }, 15000);
    } catch (err) {
      console.warn('Failed to play alarm', err);
    }
  }, [stopAlarm]);

  React.useEffect(() => () => {
    stopAlarm();
  }, [stopAlarm]);

  const sendSOS = async () => {
    if (isSending || hasSentRef.current) return;
    hasSentRef.current = true;
    setIsSending(true);
    await playAlarm();

    let locationText = '';
    let medicalText = '';

    try {
      if (appSettings.includeLocationInSos) {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status === 'granted') {
          const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
          const { latitude, longitude } = position.coords;
          locationText = `\nMy location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        }
      }
    } catch (err) {
      console.warn('Location error', err);
    }

    if (
      appSettings.includeMedicalInfoInSos
      && medicalInfo
      && (medicalInfo.bloodType || medicalInfo.allergies || medicalInfo.medications)
    ) {
      medicalText = '\n\n--- MEDICAL INFO ---';
      if (medicalInfo.bloodType) medicalText += `\nBlood: ${medicalInfo.bloodType}`;
      if (medicalInfo.allergies) medicalText += `\nAllergies: ${medicalInfo.allergies}`;
      if (medicalInfo.medications) medicalText += `\nMeds: ${medicalInfo.medications}`;
    }

    const message = `EMERGENCY!\nI need help now. This is an auto-alert from EmergCall.${locationText}${medicalText}`;

    if (!contacts || contacts.length === 0) {
      Alert.alert(
        'No contacts',
        'No emergency contacts saved. Please add a contact first in Contacts screen.',
        [{ text: 'Go to Contacts', onPress: () => navigation.navigate('Contacts') }]
      );
      hasSentRef.current = false;
      setIsSending(false);
      return;
    }

    const phoneList = contacts
      .map((c) => c.phone?.replace(/[^0-9+]/g, ''))
      .filter(Boolean);

    if (!phoneList || phoneList.length === 0) {
      Alert.alert('Invalid number', 'No valid phone numbers found in saved contacts.');
      hasSentRef.current = false;
      setIsSending(false);
      return;
    }

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('SMS Not Available', 'SMS is not available on this device.');
        hasSentRef.current = false;
        setIsSending(false);
        return;
      }

      const result = await SMS.sendSMSAsync(phoneList, message);
      
      if (result.result === 'sent' || result.result === 'unknown') {
        Alert.alert('SOS Sent', `Emergency alert sent to ${phoneList.length} contact(s).`);
      } else {
        hasSentRef.current = false;
        Alert.alert('Send Cancelled', 'SOS message was not sent.');
      }
    } catch (err) {
      hasSentRef.current = false;
      Alert.alert('Send failed', err?.message || 'Unable to send emergency alert.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.homeBackdropTop} />
      <View style={styles.homeBackdropBottom} />
      <Header transparent={true} />

      <View style={[styles.homeScrollContent, { paddingTop: 40, paddingBottom: 20, justifyContent: 'flex-start', alignItems: 'center', flex: 1 }]}>  
        <Text style={[styles.homeTitle, { fontSize: 28, marginBottom: 10 }]}>SOS Alert</Text>
        <Text style={[styles.homeSubtitle, { textAlign: 'center', maxWidth: '90%', marginBottom: 20 }]}>Your SOS will trigger in {countdown} second{countdown === 1 ? '' : 's'}. Please confirm or cancel.</Text>

        {medicalInfo && (medicalInfo.bloodType || medicalInfo.allergies || medicalInfo.medications) && (
          <View style={styles.sosMedicalBox}>
            <Text style={styles.sosMedicalTitle}>⚠️ Medical Alert Info</Text>
            {medicalInfo.bloodType && <Text style={styles.sosMedicalLine}><Text style={{ fontWeight: '700' }}>Blood:</Text> {medicalInfo.bloodType}</Text>}
            {medicalInfo.allergies && <Text style={styles.sosMedicalLine}><Text style={{ fontWeight: '700' }}>Allergies:</Text> {medicalInfo.allergies}</Text>}
            {medicalInfo.medications && <Text style={styles.sosMedicalLine}><Text style={{ fontWeight: '700' }}>Meds:</Text> {medicalInfo.medications}</Text>}
          </View>
        )}

        <View style={{ marginTop: 24, width: '85%' }}>
          <TouchableOpacity
            style={[styles.primaryButton, { marginBottom: 12, backgroundColor: '#D64545' }]}
            onPress={sendSOS}
            disabled={isSending}
          >
            <Text style={styles.primaryButtonText}>{isSending ? 'Sending...' : 'Send SOS Now'}</Text>
          </TouchableOpacity>

          {isAlarmPlaying ? (
            <TouchableOpacity
              style={[styles.secondaryButton, { marginBottom: 12, borderColor: '#C84444' }]}
              onPress={stopAlarm}
            >
              <Text style={[styles.secondaryButtonText, { color: '#C84444', fontWeight: '800' }]}>Stop Alarm</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={async () => {
              await stopAlarm();
              navigation.goBack();
            }}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 24, color: '#c00', fontWeight: '700' }}>Contacts found: {contacts.length}</Text>
      </View>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
