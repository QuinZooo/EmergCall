import * as React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

const formatTimestamp = (value) => {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function ReportDetailScreen({ navigation, route }) {
  const reportId = route?.params?.reportId;
  const [loading, setLoading] = React.useState(true);
  const [report, setReport] = React.useState(null);
  const [photos, setPhotos] = React.useState([]);

  const loadDetail = React.useCallback(async () => {
    if (!reportId) {
      Alert.alert('Missing Report', 'Unable to load this report.');
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const { data: reportRow, error: reportError } = await supabase
        .from('reports')
        .select('id, incident_type, description, latitude, longitude, status, priority, created_at, updated_at')
        .eq('id', reportId)
        .single();

      if (reportError) {
        throw reportError;
      }

      const { data: photoRows, error: photoError } = await supabase
        .from('report_photos')
        .select('file_url, file_path, created_at')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (photoError) {
        throw photoError;
      }

      setReport(reportRow);
      setPhotos(photoRows || []);
    } catch (err) {
      Alert.alert('Load Error', err?.message || 'Unable to load report details right now.');
    } finally {
      setLoading(false);
    }
  }, [navigation, reportId]);

  React.useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contactsBackdropTop} />
      <View style={styles.contactsBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.contactsScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.reportDetailTopRow}>
          <TouchableOpacity style={styles.reportDetailBackBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={18} color="#2C3E50" />
            <Text style={styles.reportDetailBackText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.contactsTitle}>Report Detail</Text>
        <Text style={styles.contactsSubtitle}>Complete incident context and submitted evidence.</Text>

        {loading ? (
          <View style={styles.myReportsCenterState}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.myReportsStateText}>Loading report detail...</Text>
          </View>
        ) : null}

        {!loading && report ? (
          <View style={styles.reportDetailCard}>
            <View style={styles.reportDetailHeader}>
              <Text style={styles.reportDetailType}>{report.incident_type || 'Incident'}</Text>
              <View style={styles.myReportStatusPill}>
                <Text style={styles.myReportStatusText}>{(report.status || 'submitted').toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.reportDetailMeta}>Created: {formatTimestamp(report.created_at)}</Text>
            <Text style={styles.reportDetailMeta}>Updated: {formatTimestamp(report.updated_at)}</Text>

            <View style={styles.reportDetailBlock}>
              <Text style={styles.reportDetailLabel}>Description</Text>
              <Text style={styles.reportDetailValue}>{report.description || 'No description provided.'}</Text>
            </View>

            <View style={styles.reportDetailBlock}>
              <Text style={styles.reportDetailLabel}>Priority</Text>
              <Text style={styles.reportDetailValue}>{(report.priority || 'normal').toUpperCase()}</Text>
            </View>

            <View style={styles.reportDetailBlock}>
              <Text style={styles.reportDetailLabel}>Location</Text>
              {typeof report.latitude === 'number' && typeof report.longitude === 'number' ? (
                <Text style={styles.reportDetailValue}>{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</Text>
              ) : (
                <Text style={styles.reportDetailValue}>No location attached</Text>
              )}
            </View>

            <View style={styles.reportDetailBlock}>
              <Text style={styles.reportDetailLabel}>Submitted Photos</Text>
              {photos.length ? (
                <View style={styles.myReportPhotoGrid}>
                  {photos.map((photo, index) => (
                    <Image
                      key={`${photo.file_path || report.id}-${index}`}
                      source={{ uri: photo.file_url }}
                      style={styles.myReportPhoto}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.reportDetailValue}>No photos attached</Text>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
