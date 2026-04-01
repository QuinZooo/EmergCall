import * as React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

const EMPTY_MEDICAL_INFO = {
  bloodType: '',
  allergies: '',
  medications: '',
};

export default function MedicalInfoPage({ navigation }) {
  const [user, setUser] = React.useState(null);
  const [medicalInfo, setMedicalInfo] = React.useState(EMPTY_MEDICAL_INFO);
  const [saving, setSaving] = React.useState(false);

  const getStorageKey = React.useCallback(
    () => (user?.id ? `medicalInfo:${user.id}` : 'medicalInfo'),
    [user]
  );

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

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
    const loadMedicalInfo = async () => {
      try {
        const stored = await AsyncStorage.getItem(getStorageKey());
        if (!stored) {
          setMedicalInfo(EMPTY_MEDICAL_INFO);
          return;
        }

        const parsed = JSON.parse(stored);
        setMedicalInfo({
          bloodType: parsed?.bloodType || '',
          allergies: parsed?.allergies || '',
          medications: parsed?.medications || '',
        });
      } catch (err) {
        console.warn('Failed to load medical info', err);
      }
    };

    loadMedicalInfo();
  }, [getStorageKey]);

  const updateField = (field, value) => {
    setMedicalInfo((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bloodType: medicalInfo.bloodType.trim(),
        allergies: medicalInfo.allergies.trim(),
        medications: medicalInfo.medications.trim(),
      };

      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(payload));
      setMedicalInfo(payload);
      Alert.alert('Saved', 'Your medical information was saved successfully.');
    } catch (err) {
      Alert.alert('Save Failed', err?.message || 'Unable to save medical information right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contactsBackdropTop} />
      <View style={styles.contactsBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.medicalScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.contactsTitle}>Medical Information</Text>
        <Text style={styles.contactsSubtitle}>Save health details that can be included in an SOS alert.</Text>

        <View style={styles.medicalCard}>
          <View style={styles.medicalFieldGroup}>
            <View style={styles.medicalFieldHeader}>
              <MaterialCommunityIcons name="water" size={18} color="#C84444" />
              <Text style={styles.medicalFieldLabel}>Blood Type</Text>
            </View>
            <TextInput
              style={styles.medicalInput}
              placeholder="Example: O+"
              placeholderTextColor="#8A96A3"
              value={medicalInfo.bloodType}
              onChangeText={(value) => updateField('bloodType', value)}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.medicalFieldGroup}>
            <View style={styles.medicalFieldHeader}>
              <Ionicons name="warning-outline" size={18} color="#E65100" />
              <Text style={styles.medicalFieldLabel}>Allergies</Text>
            </View>
            <TextInput
              style={[styles.medicalInput, styles.medicalTextArea]}
              placeholder="List allergies or type none"
              placeholderTextColor="#8A96A3"
              value={medicalInfo.allergies}
              onChangeText={(value) => updateField('allergies', value)}
              multiline={true}
              numberOfLines={3}
            />
          </View>

          <View style={styles.medicalFieldGroup}>
            <View style={styles.medicalFieldHeader}>
              <MaterialCommunityIcons name="pill" size={18} color="#2AAFC2" />
              <Text style={styles.medicalFieldLabel}>Medications</Text>
            </View>
            <TextInput
              style={[styles.medicalInput, styles.medicalTextArea]}
              placeholder="List current medications or type none"
              placeholderTextColor="#8A96A3"
              value={medicalInfo.medications}
              onChangeText={(value) => updateField('medications', value)}
              multiline={true}
              numberOfLines={3}
            />
          </View>

          <View style={styles.medicalInfoBox}>
            <Ionicons name="information-circle" size={18} color="#0D5F75" />
            <Text style={styles.medicalInfoText}>
              These details stay on the device and can be attached to SOS messages when the medical info setting is enabled.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { marginBottom: 0, marginTop: 4, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Medical Information'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}