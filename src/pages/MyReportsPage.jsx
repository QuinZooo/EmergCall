import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import { supabase } from '../lib/supabase.js';
import { getLocalReports, retryPendingReportSync } from '../lib/reportSync.js';
import styles from '../styles/commonStyles';

const PAGE_SIZE = 10;

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

export default function MyReportsScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [previewPhotoUri, setPreviewPhotoUri] = React.useState('');
  const [isPreviewVisible, setIsPreviewVisible] = React.useState(false);
  const [reports, setReports] = React.useState([]);

  const openPhotoPreview = (uri) => {
    if (!uri) {
      return;
    }

    setPreviewPhotoUri(uri);
    setIsPreviewVisible(true);
  };

  const closePhotoPreview = () => {
    setIsPreviewVisible(false);
    setPreviewPhotoUri('');
  };

  const getStatusPillStyle = (statusRaw) => {
    const status = (statusRaw || '').toLowerCase();

    if (status === 'resolved' || status === 'closed') {
      return {
        container: styles.myReportStatusResolved,
        text: styles.myReportStatusResolvedText,
      };
    }

    if (status === 'in_progress' || status === 'in progress') {
      return {
        container: styles.myReportStatusProgress,
        text: styles.myReportStatusProgressText,
      };
    }

    return {
      container: styles.myReportStatusSubmitted,
      text: styles.myReportStatusSubmittedText,
    };
  };

  const getPriorityPillStyle = (priorityRaw) => {
    const priority = (priorityRaw || '').toLowerCase();

    if (priority === 'high' || priority === 'critical') {
      return {
        container: styles.myReportPriorityHigh,
        text: styles.myReportPriorityHighText,
      };
    }

    return {
      container: styles.myReportPriorityNormal,
      text: styles.myReportPriorityNormalText,
    };
  };

  const getSyncPillStyle = (syncStatusRaw) => {
    const syncStatus = (syncStatusRaw || '').toLowerCase();

    if (syncStatus === 'synced') {
      return {
        container: styles.myReportSyncSynced,
        text: styles.myReportSyncSyncedText,
        label: 'SYNCED',
      };
    }

    if (syncStatus === 'syncing') {
      return {
        container: styles.myReportSyncSyncing,
        text: styles.myReportSyncSyncingText,
        label: 'SYNCING',
      };
    }

    if (syncStatus === 'local_only') {
      return {
        container: styles.myReportSyncLocalOnly,
        text: styles.myReportSyncLocalOnlyText,
        label: 'LOCAL ONLY',
      };
    }

    return {
      container: styles.myReportSyncPending,
      text: styles.myReportSyncPendingText,
      label: 'PENDING RETRY',
    };
  };

  const loadReports = async ({ isRefresh = false, append = false } = {}) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user?.id) {
        setReports([]);
        setHasMore(false);
        setCurrentPage(0);
        return;
      }

      await retryPendingReportSync(session.user.id);
      const localReports = await getLocalReports(session.user.id);
      const localByCloudId = new Map(
        (localReports || [])
          .filter((item) => item.cloud_report_id)
          .map((item) => [item.cloud_report_id, item])
      );

      const pageToLoad = append ? currentPage + 1 : 0;
      const from = pageToLoad * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: reportRows, error: reportError } = await supabase
        .from('reports')
        .select('id, incident_type, description, latitude, longitude, status, priority, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (reportError) {
        throw reportError;
      }

      const reportIds = (reportRows || []).map((row) => row.id);
      let photosByReport = {};

      if (reportIds.length > 0) {
        const { data: photoRows, error: photoError } = await supabase
          .from('report_photos')
          .select('report_id, file_url, file_path, created_at')
          .in('report_id', reportIds)
          .order('created_at', { ascending: true });

        if (photoError) {
          throw photoError;
        }

        photosByReport = (photoRows || []).reduce((acc, row) => {
          const reportId = row.report_id;
          if (!acc[reportId]) {
            acc[reportId] = [];
          }

          acc[reportId].push({
            url: row.file_url || '',
            path: row.file_path || '',
          });
          return acc;
        }, {});
      }

      const normalizedCloud = (reportRows || []).map((report) => {
        const localShadow = localByCloudId.get(report.id);
        return {
          ...report,
          local_id: localShadow?.local_id || '',
          sync_status: localShadow?.sync_status || 'synced',
          last_sync_error: localShadow?.last_sync_error || '',
          photos: photosByReport[report.id] || [],
          source: 'cloud',
        };
      });

      const pendingLocal = (localReports || [])
        .filter((item) => !item.cloud_report_id)
        .map((item) => ({
          id: item.local_id,
          local_id: item.local_id,
          incident_type: item.incident_type,
          description: item.description,
          latitude: item.latitude,
          longitude: item.longitude,
          status: item.status || 'submitted',
          priority: item.priority || 'normal',
          created_at: item.created_at,
          sync_status: item.sync_status || 'pending_retry',
          last_sync_error: item.last_sync_error || '',
          photos: (item.photo_uris || []).map((uri, index) => ({
            url: uri,
            path: `${item.local_id}-${index}`,
          })),
          source: 'local',
        }));

      const normalized = [...pendingLocal, ...normalizedCloud].sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime;
      });

      setReports((prev) => {
        if (!append) {
          return normalized;
        }

        const existingIds = new Set(prev.map((item) => item.id));
        const incoming = normalized.filter((item) => !existingIds.has(item.id));
        return [...prev, ...incoming];
      });
      setCurrentPage(pageToLoad);
      setHasMore((reportRows || []).length === PAGE_SIZE);
    } catch (err) {
      Alert.alert('Load Error', err?.message || 'Unable to load reports right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  React.useEffect(() => {
    loadReports();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contactsBackdropTop} />
      <View style={styles.contactsBackdropBottom} />
      <Header transparent={true} />

      <ScrollView
        contentContainerStyle={styles.contactsScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadReports({ isRefresh: true })} tintColor="#FF9800" />}
      >
        <Text style={styles.contactsTitle}>My Reports</Text>
        <Text style={styles.contactsSubtitle}>Review your submitted incidents and attached evidence.</Text>

        <TouchableOpacity style={styles.myReportsRefreshBtn} onPress={() => loadReports({ isRefresh: true })} disabled={refreshing || loading}>
          <Ionicons name="refresh" size={16} color="#2C3E50" />
          <Text style={styles.myReportsRefreshText}>{refreshing ? 'Refreshing...' : 'Refresh reports'}</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.myReportsCenterState}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.myReportsStateText}>Loading your reports...</Text>
          </View>
        ) : null}

        {!loading && reports.length === 0 ? (
          <View style={styles.myReportsCenterState}>
            <Ionicons name="document-text-outline" size={42} color="#8A96A3" />
            <Text style={styles.myReportsStateText}>No reports found yet.</Text>
            <TouchableOpacity style={[styles.primaryButton, { marginTop: 14 }]} onPress={() => navigation.navigate('ReportIncident')}>
              <Text style={styles.primaryButtonText}>Create First Report</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading
          ? reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.myReportCard}
                onPress={() => {
                  if (report.source === 'local') {
                    Alert.alert('Local Report', 'This report is still local and has not synced to cloud yet.');
                    return;
                  }

                  navigation.navigate('ReportDetail', { reportId: report.id });
                }}
                activeOpacity={0.95}
              >
                <View style={styles.myReportHeaderRow}>
                  <Text style={styles.myReportType}>{report.incident_type || 'Incident'}</Text>
                  <View style={[styles.myReportStatusPill, getStatusPillStyle(report.status).container]}>
                    <Text style={[styles.myReportStatusText, getStatusPillStyle(report.status).text]}>{(report.status || 'submitted').toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.myReportMetaRow}>
                  <View style={[styles.myReportPriorityPill, getPriorityPillStyle(report.priority).container]}>
                    <Text style={[styles.myReportPriorityText, getPriorityPillStyle(report.priority).text]}>
                      PRIORITY: {(report.priority || 'normal').toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.myReportSyncPill, getSyncPillStyle(report.sync_status).container]}>
                    <Text style={[styles.myReportSyncText, getSyncPillStyle(report.sync_status).text]}>
                      {getSyncPillStyle(report.sync_status).label}
                    </Text>
                  </View>
                </View>

                {report.last_sync_error ? <Text style={styles.myReportSyncError}>{report.last_sync_error}</Text> : null}

                <Text style={styles.myReportTime}>{formatTimestamp(report.created_at)}</Text>
                <Text style={styles.myReportDescription}>{report.description || 'No description provided.'}</Text>

                {typeof report.latitude === 'number' && typeof report.longitude === 'number' ? (
                  <View style={styles.myReportLocationRow}>
                    <Ionicons name="location" size={14} color="#E36A20" />
                    <Text style={styles.myReportLocationText}>
                      {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                    </Text>
                  </View>
                ) : null}

                {report.photos.length ? (
                  <View style={styles.myReportPhotoGrid}>
                    {report.photos.map((photo) => (
                      <TouchableOpacity key={`${report.id}-${photo.path || photo.url}`} onPress={() => openPhotoPreview(photo.url)}>
                        <Image
                          source={{ uri: photo.url }}
                          style={styles.myReportPhoto}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.myReportNoPhotos}>No photos attached</Text>
                )}
              </TouchableOpacity>
            ))
          : null}

        {!loading && reports.length > 0 && hasMore ? (
          <TouchableOpacity
            style={[styles.myReportsLoadMoreBtn, loadingMore && { opacity: 0.7 }]}
            onPress={() => loadReports({ append: true })}
            disabled={loadingMore}
          >
            {loadingMore ? <ActivityIndicator size="small" color="#2C3E50" /> : <Ionicons name="chevron-down" size={16} color="#2C3E50" />}
            <Text style={styles.myReportsLoadMoreText}>{loadingMore ? 'Loading...' : 'Load more reports'}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <Modal visible={isPreviewVisible} transparent={true} animationType="fade" onRequestClose={closePhotoPreview}>
        <Pressable style={styles.photoPreviewOverlay} onPress={closePhotoPreview}>
          <Pressable style={styles.photoPreviewContent} onPress={() => {}}>
            <TouchableOpacity style={styles.photoPreviewCloseBtn} onPress={closePhotoPreview}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
            {previewPhotoUri ? (
              <Image source={{ uri: previewPhotoUri }} style={styles.photoPreviewImage} resizeMode="contain" />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
