import * as React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase.js';
import {
  appendLocalReport,
  patchLocalReportById,
  syncLocalReportToCloud,
  enqueueReportForSync,
  getFriendlySyncError,
} from '../lib/reportSync.js';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

const INCIDENT_TYPES = ['Fire', 'Accident', 'Crime', 'Medical', 'Natural Disaster', 'Other'];
const PRIORITIES = ['normal', 'high', 'critical'];

const PRIORITY_LABELS = { normal: 'Normal', high: 'High', critical: 'Critical' };

const PRIORITY_ACTIVE_COLORS = {
  normal: { background: '#E8F5E9', border: '#4CAF50', text: '#1B5E20' },
  high: { background: '#FFF3E0', border: '#FF9800', text: '#E65100' },
  critical: { background: '#FFF0F0', border: '#F44336', text: '#B71C1C' },
};

export default function ReportIncidentScreen({ navigation }) {
  const [selectedType, setSelectedType] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState('normal');
  const [location, setLocation] = React.useState(null);
  const [locationName, setLocationName] = React.useState('');
  const [fetchingLocation, setFetchingLocation] = React.useState(false);
  const [photoUris, setPhotoUris] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);

  const getLocation = async () => {
    setFetchingLocation(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to tag your report.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      setLocation({ latitude, longitude });

      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results?.length) {
          const r = results[0];
          const parts = [r.name, r.street, r.district, r.city, r.region].filter(Boolean);
          setLocationName(parts.join(', '));
        }
      } catch {
        setLocationName('');
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

  const handleAddPhoto = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please allow photo library access to attach photos.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const newUris = result.assets.map((a) => a.uri);
      setPhotoUris((prev) => {
        const combined = [...prev, ...newUris];
        return combined.slice(0, 5);
      });
    } catch (err) {
      Alert.alert('Photo Error', err?.message || 'Unable to select photos.');
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

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
        local_id: `local-${Date.now()}`,
        user_id: userId,
        incident_type: selectedType,
        description: description.trim(),
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        priority,
        status: 'submitted',
        sync_status: 'pending_retry',
        cloud_report_id: '',
        last_sync_error: '',
        photo_uris: photoUris,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await appendLocalReport(userId, report);

      try {
        const cloudId = await syncLocalReportToCloud({ userId, report });
        await patchLocalReportById(userId, report.local_id, {
          sync_status: 'synced',
          cloud_report_id: cloudId,
          last_sync_error: '',
          updated_at: new Date().toISOString(),
        });
        Alert.alert('Report Submitted', 'Your incident report has been submitted.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (syncErr) {
        const message = getFriendlySyncError(syncErr);
        await enqueueReportForSync({ userId, localId: report.local_id, errorMessage: message });
        Alert.alert('Saved Locally', 'Report saved and will sync when connection is available.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const locationDisplay = fetchingLocation
    ? 'Getting location...'
    : locationName || (location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Location unavailable');

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

        <Text style={[styles.label, { marginTop: 20 }]}>Priority</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          {PRIORITIES.map((p) => {
            const active = priority === p;
            const colors = PRIORITY_ACTIVE_COLORS[p];
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  alignItems: 'center',
                  backgroundColor: active ? colors.background : '#F9FBFF',
                  borderColor: active ? colors.border : '#DCE5EE',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: active ? colors.text : '#8A96A3' }}>
                  {PRIORITY_LABELS[p]}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          <Text style={[styles.incidentLocationText, { flex: 1 }]} numberOfLines={2}>{locationDisplay}</Text>
          <TouchableOpacity onPress={getLocation} disabled={fetchingLocation}>
            <Ionicons name="refresh" size={18} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Photos</Text>
        <TouchableOpacity style={styles.incidentPhotoPickerBtn} onPress={handleAddPhoto} disabled={photoUris.length >= 5}>
          <Ionicons name="camera-outline" size={20} color="#2C3E50" />
          <Text style={styles.incidentPhotoPickerText}>
            {photoUris.length >= 5 ? 'Max 5 photos' : 'Add Photos'}
          </Text>
        </TouchableOpacity>

        {photoUris.length > 0 && (
          <View style={styles.incidentPhotoGrid}>
            {photoUris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.incidentPhotoItem}>
                <Image source={{ uri }} style={styles.incidentPhotoPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.incidentPhotoRemoveBtn} onPress={() => handleRemovePhoto(index)}>
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.incidentPhotoHint}>Up to 5 photos. Tap × to remove.</Text>

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
