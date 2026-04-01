import * as React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase.js';
import {
  appendLocalReport,
  enqueueReportForSync,
  getFriendlySyncError,
  patchLocalReportById,
  retryPendingReportSync,
  syncLocalReportToCloud,
} from '../lib/reportSync.js';
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
  const [selectedPhotos, setSelectedPhotos] = React.useState([]);

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

  const retryPendingSyncForCurrentUser = React.useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        return;
      }

      await retryPendingReportSync(session.user.id);
    } catch (err) {
      console.warn('Retry pending sync failed:', err?.message || err);
    }
  }, []);

  React.useEffect(() => {
    retryPendingSyncForCurrentUser();
  }, [retryPendingSyncForCurrentUser]);

  const handlePickPhotos = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow gallery access to attach report photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setSelectedPhotos((prev) => {
        const existingUris = new Set(prev.map((photo) => photo.uri));
        const incoming = result.assets
          .filter((asset) => !existingUris.has(asset.uri))
          .map((asset, index) => ({
            id: `${Date.now()}-${index}`,
            uri: asset.uri,
          }));

        return [...prev, ...incoming].slice(0, 5);
      });
    } catch (err) {
      Alert.alert('Photo error', err?.message || 'Unable to select photos.');
    }
  };

  const removePhoto = (id) => {
    setSelectedPhotos((prev) => prev.filter((photo) => photo.id !== id));
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id || 'anonymous';
      const localId = `local-${Date.now()}`;
      const localReport = {
        local_id: localId,
        user_id: userId,
        incident_type: selectedType,
        description: description.trim(),
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        status: 'submitted',
        priority: 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        photo_uris: selectedPhotos.map((photo) => photo.uri),
        sync_status: session?.user?.id ? 'syncing' : 'local_only',
        cloud_report_id: '',
        last_sync_error: '',
        sync_source: 'report_incident_page',
      };

      await appendLocalReport(userId, localReport);

      if (!session?.user?.id) {
        Alert.alert('Report Saved Locally', 'You are not logged in. Login to sync reports and photos to cloud.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      try {
        const cloudReportId = await syncLocalReportToCloud({
          userId: session.user.id,
          report: localReport,
        });

        await patchLocalReportById(session.user.id, localId, {
          sync_status: 'synced',
          cloud_report_id: cloudReportId,
          last_sync_error: '',
          updated_at: new Date().toISOString(),
        });

        Alert.alert('Report Submitted', 'Your report has been saved to cloud and local storage.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (syncError) {
        const syncMessage = getFriendlySyncError(syncError);

        await patchLocalReportById(session.user.id, localId, {
          sync_status: 'pending_retry',
          last_sync_error: syncMessage,
          updated_at: new Date().toISOString(),
        });
        await enqueueReportForSync({
          userId: session.user.id,
          localId,
          errorMessage: syncMessage,
        });

        Alert.alert('Queued For Sync', 'Report saved locally. Cloud sync will retry automatically.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWithRetryFirst = async () => {
    await retryPendingSyncForCurrentUser();
    await handleSubmit();
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

        <Text style={[styles.label, { marginTop: 20 }]}>Report Photos (Optional)</Text>
        <TouchableOpacity style={styles.incidentPhotoPickerBtn} onPress={handlePickPhotos} disabled={submitting}>
          <Ionicons name="images-outline" size={18} color="#2C3E50" />
          <Text style={styles.incidentPhotoPickerText}>Select up to 5 photos</Text>
        </TouchableOpacity>

        {selectedPhotos.length ? (
          <View style={styles.incidentPhotoGrid}>
            {selectedPhotos.map((photo) => (
              <View key={photo.id} style={styles.incidentPhotoItem}>
                <Image source={{ uri: photo.uri }} style={styles.incidentPhotoPreview} />
                <TouchableOpacity
                  style={styles.incidentPhotoRemoveBtn}
                  onPress={() => removePhoto(photo.id)}
                  disabled={submitting}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.incidentPhotoHint}>No photos selected.</Text>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 24, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmitWithRetryFirst}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
