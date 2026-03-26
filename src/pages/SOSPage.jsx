import * as React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase.js';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function SOSPage({ navigation }) {
  const [countdown, setCountdown] = React.useState(5);
  const [contacts, setContacts] = React.useState([]);
  const [isSending, setIsSending] = React.useState(false);
  const [user, setUser] = React.useState(null);

  const getStorageKey = () => (user?.id ? `emergencyContacts:${user.id}` : 'emergencyContacts');

  const loadContacts = async () => {
    try {
      const key = getStorageKey();
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
  }, [user]);

  React.useEffect(() => {
    if (countdown <= 0) {
      sendSOS();
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendSOS = async () => {
    if (isSending) return;
    setIsSending(true);

    let locationText = '';

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === 'granted') {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        const { latitude, longitude } = position.coords;
        locationText = `\nMy location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      }
    } catch (err) {
      console.warn('Location error', err);
    }

    const message = encodeURIComponent(
      `EMERGENCY!\nI need help now. This is an auto-alert from EmergCall.${locationText}`
    );

    if (!contacts || contacts.length === 0) {
      Alert.alert(
        'No contacts',
        'No emergency contacts saved. Please add a contact first in Contacts screen.',
        [{ text: 'Go to Contacts', onPress: () => navigation.navigate('Contacts') }]
      );
      setIsSending(false);
      return;
    }

    const phoneList = contacts
      .map((c) => c.phone?.replace(/[^0-9,+]/g, ''))
      .filter(Boolean)
      .join(',');

    if (!phoneList) {
      Alert.alert('Invalid number', 'No valid phone numbers found in saved contacts.');
      setIsSending(false);
      return;
    }

    const url = `sms:${phoneList}?body=${message}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      Alert.alert('SOS sent', 'Emergency message prepared in your SMS app.');
    } else {
      Alert.alert('Send failed', 'Unable to open SMS app on this device.');
    }

    setIsSending(false);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.homeBackdropTop} />
      <View style={styles.homeBackdropBottom} />
      <Header transparent={true} />

      <View style={[styles.homeScrollContent, { paddingTop: 60, justifyContent: 'center', alignItems: 'center', flex: 1 }]}>  
        <Text style={[styles.homeTitle, { fontSize: 28, marginBottom: 10 }]}>SOS Alert</Text>
        <Text style={[styles.homeSubtitle, { textAlign: 'center', maxWidth: '90%' }]}>Your SOS will trigger in {countdown} second{countdown === 1 ? '' : 's'}. Please confirm or cancel.</Text>

        <View style={{ marginTop: 30, width: '85%' }}>
          <TouchableOpacity
            style={[styles.primaryButton, { marginBottom: 12, backgroundColor: '#D64545' }]}
            onPress={sendSOS}
            disabled={isSending}
          >
            <Text style={styles.primaryButtonText}>{isSending ? 'Sending...' : 'Send SOS Now'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
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
