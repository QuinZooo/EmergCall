import * as React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase.js';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

const INCIDENT_TYPES = ['Fire', 'Accident', 'Crime', 'Medical', 'Natural Disaster', 'Other'];

export default function ReportIncidentScreen({ navigation }) {
  const [selectedType, setSelectedType] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState(null);
  const [fetchingLocation, setFetchingLocation] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const getLocation = async () => {
    setFetchingLocation(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } else {
        Alert.alert('Permission denied', 'Location access is needed to tag your report.');
      }
    } catch (err) {
      Alert.alert('Location error', 'Unable to get current location.');
    } finally {
      setFetchingLocation(false);
    }
  };

  React.useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Missing info', 'Please select an incident type.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing info', 'Please describe the incident.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'anonymous';

      const report = {
        id: Date.now().toString(),
        userId,
        type: selectedType,
        description: description.trim(),
        location: location || null,
        timestamp: new Date().toISOString(),
      };

      // Save locally
      const key = `incidentReports:${userId}`;
      const existing = await AsyncStorage.getItem(key);
      const reports = existing ? JSON.parse(existing) : [];
      reports.unshift(report);
      await AsyncStorage.setItem(key, JSON.stringify(reports));

      Alert.alert('Report Submitted', 'Your incident report has been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contactsBackdropTop} />
      <View style={styles.contactsBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.contactsScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.contactsTitle}>Report Incident</Text>
        <Text style={styles.contactsSubtitle}>Submit details about an emergency or incident.</Text>

        <Text style={styles.label}>Incident Type</Text>
        <View style={styles.incidentTypeGrid}>
          {INCIDENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.incidentTypeChip, selectedType === type && styles.incidentTypeChipActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.incidentTypeText, selectedType === type && styles.incidentTypeTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Description</Text>
        <TextInput
          style={styles.incidentTextArea}
          placeholder="Describe the incident..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Location</Text>
        <View style={styles.incidentLocationRow}>
          <Ionicons name="location" size={18} color="#FF9800" />
          <Text style={styles.incidentLocationText}>
            {fetchingLocation ? 'Getting location...' : location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Location unavailable'}
          </Text>
          <TouchableOpacity onPress={getLocation} disabled={fetchingLocation}>
            <Ionicons name="refresh" size={18} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 24, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
