import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

const FILTERS = ['all', 'submitted', 'in_progress', 'resolved'];

const formatStatusLabel = (value = '') => value.replace(/_/g, ' ').toUpperCase();

export default function AdminReportsPage({ navigation }) {
  const [reports, setReports] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [refreshing, setRefreshing] = React.useState(false);

  const ensureAdmin = React.useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigation.replace('Login');
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      navigation.replace('Home');
      return false;
    }

    return true;
  }, [navigation]);

  const loadReports = React.useCallback(async () => {
    try {
      const allowed = await ensureAdmin();
      if (!allowed) {
        return;
      }

      let query = supabase
        .from('reports')
        .select(`
          id,
          user_id,
          incident_type,
          description,
          address,
          latitude,
          longitude,
          status,
          priority,
          created_at,
          updated_at,
          profiles:user_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      setReports(data || []);
    } catch (err) {
      Alert.alert('Load Error', err?.message || 'Unable to load reports.');
    }
  }, [ensureAdmin, statusFilter]);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const getBadgeStyle = (status) => {
    const value = (status || '').toLowerCase();

    if (value === 'resolved') {
      return {
        container: [styles.adminBadge, styles.adminBadgeResolved],
        text: [styles.adminBadgeText, styles.adminBadgeResolvedText],
      };
    }

    if (value === 'in_progress') {
      return {
        container: [styles.adminBadge, styles.adminBadgeProgress],
        text: [styles.adminBadgeText, styles.adminBadgeProgressText],
      };
    }

    return {
      container: [styles.adminBadge, styles.adminBadgePending],
      text: [styles.adminBadgeText, styles.adminBadgePendingText],
    };
  };

  const updateReportStatus = async (reportId, nextStatus) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) {
        throw error;
      }
      await loadReports();
    } catch (err) {
      Alert.alert('Update Error', err?.message || 'Unable to update report.');
    }
  };

  const filteredReports = reports.filter((item) => {
    const haystack = [
      item.incident_type,
      item.description,
      item.address,
      item.priority,
      item.status,
      item.profiles?.full_name,
      item.profiles?.email,
      item.profiles?.phone,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search.toLowerCase());
  });

  return (
    <View style={styles.mainContainer}>
      <View style={styles.adminBackdropTop} />
      <View style={styles.adminBackdropBottom} />
      <Header transparent={true} />

      <ScrollView
        contentContainerStyle={styles.adminScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.adminTitle}>Reports</Text>
        <Text style={styles.adminSubtitle}>Review all submitted incidents.</Text>

        <TextInput
          style={styles.adminSearchInput}
          placeholder="Search by incident, user, address, priority..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#8A98A6"
        />

        <View style={styles.adminFilterRow}>
          {FILTERS.map((filter) => {
            const active = filter === statusFilter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.adminFilterChip, active && styles.adminFilterChipActive]}
                onPress={() => setStatusFilter(filter)}
              >
                <Text style={[styles.adminFilterChipText, active && styles.adminFilterChipTextActive]}>
                  {formatStatusLabel(filter)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredReports.map((item) => {
          const badge = getBadgeStyle(item.status);
          const locationText = typeof item.latitude === 'number' && typeof item.longitude === 'number'
            ? `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}`
            : (item.address || 'No location attached');

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.adminListCard}
              activeOpacity={0.92}
              onPress={() => navigation.navigate('ReportDetail', { reportId: item.id, adminView: true })}
            >
              <View style={styles.adminListHeaderRow}>
                <Text style={styles.adminListTitle}>{item.incident_type || 'Untitled report'}</Text>
                <View style={badge.container}>
                  <Text style={badge.text}>{formatStatusLabel(item.status || 'submitted')}</Text>
                </View>
              </View>

              <Text style={styles.adminListMeta}>
                By {item.profiles?.full_name || 'Unknown user'} • {item.profiles?.email || 'No email'}
              </Text>
              <Text style={styles.adminListMeta}>{new Date(item.created_at).toLocaleString()}</Text>
              <Text style={styles.adminListMeta}>Priority: {(item.priority || 'normal').toUpperCase()}</Text>
              <Text style={styles.adminListMeta}>{locationText}</Text>

              <Text style={styles.adminListText}>{item.description || 'No description provided.'}</Text>

              <View style={styles.adminInlineActions}>
                <TouchableOpacity
                  style={styles.adminSmallButton}
                  onPress={() => updateReportStatus(item.id, 'in_progress')}
                >
                  <Text style={styles.adminSmallButtonText}>Mark In Progress</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.adminSmallOutlineButton}
                  onPress={() => updateReportStatus(item.id, 'resolved')}
                >
                  <Text style={styles.adminSmallOutlineButtonText}>Resolve</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <BottomNavBar navigation={navigation} variant="admin" />
    </View>
  );
}
