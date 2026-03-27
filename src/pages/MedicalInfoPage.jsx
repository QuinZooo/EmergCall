import * as React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase.js';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function MedicalInfoScreen({ navigation }) {
  const [user, setUser] = React.useState(null);
  const [bloodType, setBloodType] = React.useState('');
  const [allergies, setAllergies] = React.useState('');
  const [medications, setMedications] = React.useState('');
  const [emergencyNotes, setEmergencyNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const getStorageKey = () => (user?.id ? `medicalInfo:${user.id}` : 'medicalInfo');

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
    if (!user) return;
    loadMedicalInfo();
  }, [user]);

  const loadMedicalInfo = async () => {
    try {
      const key = getStorageKey();
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        setBloodType(data.bloodType || '');
        setAllergies(data.allergies || '');
        setMedications(data.medications || '');
        setEmergencyNotes(data.emergencyNotes || '');
      }
    } catch (err) {
      console.warn('Failed to load medical info', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const medicalInfo = {
        bloodType: bloodType.trim(),
        allergies: allergies.trim(),
        medications: medications.trim(),
        emergencyNotes: emergencyNotes.trim(),
        lastUpdated: new Date().toISOString(),
      };

      const key = getStorageKey();
      await AsyncStorage.setItem(key, JSON.stringify(medicalInfo));

      Alert.alert('Saved', 'Your medical information has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to save medical information.');
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
        <Text style={styles.contactsSubtitle}>Store your critical health data for emergencies.</Text>

        <View style={styles.medicalCard}>
          <View style={styles.medicalFieldGroup}>
            <View style={styles.medicalFieldHeader}>
              <Ionicons name="water" size={18} color="#D64545" />
              <Text style={styles.medicalFieldLabel}>Blood Type</Text>
            </View>
            <TextInput
              value={bloodType}
              onChangeText={setBloodType}
              placeholder="e.g., O+, A-, B+, AB"
              placeholderTextColor="#8A96A3"
              style={styles.medicalInput}
            />
          </View>

          <View style={styles.medicalFieldGroup}>
            <View style={styles.medicalFieldHeader}>
              <Ionicons name="warning" size={18} color="#FF9800" />
              <Text style={styles.medicalFieldLabel}>Allergies</Text>
            </View>
            <TextInput
              value={allergies}
              onChangeText={setAllergies}
              placeholder="e.g., Penicillin, Shellfish, Peanuts"
              placeholderTextColor="#8A96A3"
              multiline
              numberOfLines={3}
              style={[styles.medicalInput, styles.medicalTextArea]}
            />
          </View>

          <View style={styles.medicalFieldGroup}>
            <View style={styles.medicalFieldHeader}>
              <Ionicons name="medical" size={18} color="#2AAFC2" />
              <Text style={styles.medicalFieldLabel}>Current Medications</Text>
            </View>
            <TextInput
              value={medications}
              onChangeText={setMedications}
              placeholder="e.g., Insulin (20 units), Aspirin"
              placeholderTextColor="#8A96A3"
              multiline
              numberOfLines={3}
              style={[styles.medicalInput, styles.medicalTextArea]}
            />
          </View>

          <View style={styles.medicalFieldGroup}>
            <View style={styles.medicalFieldHeader}>
              <Ionicons name="document-text" size={18} color="#27AE60" />
              <Text style={styles.medicalFieldLabel}>Emergency Notes</Text>
            </View>
            <TextInput
              value={emergencyNotes}
              onChangeText={setEmergencyNotes}
              placeholder="e.g., Condition details, emergency procedures, doctor contact"
              placeholderTextColor="#8A96A3"
              multiline
              numberOfLines={4}
              style={[styles.medicalInput, styles.medicalTextArea]}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? 'Saving...' : 'Save Medical Information'}
          </Text>
        </TouchableOpacity>

        <View style={styles.medicalInfoBox}>
          <Ionicons name="information-circle" size={20} color="#2AAFC2" />
          <Text style={styles.medicalInfoText}>
            This information is stored locally on your device and can be accessed during emergencies.
          </Text>
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
