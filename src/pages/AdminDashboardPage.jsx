import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

export default function AdminDashboardPage({ navigation }) {
  const [stats, setStats] = React.useState({
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    totalUsers: 0,
  });

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

  const loadStats = React.useCallback(async () => {
    try {
      const allowed = await ensureAdmin();
      if (!allowed) {
        return;
      }

      const { count: totalReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      const { count: pendingReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');

      const { count: inProgressReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        inProgressReports: inProgressReports || 0,
        totalUsers: totalUsers || 0,
      });
    } catch (err) {
      Alert.alert('Load Error', err?.message || 'Unable to load admin stats.');
    }
  }, [ensureAdmin]);

  React.useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.adminBackdropTop} />
      <View style={styles.adminBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.adminScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.adminTitle}>Admin Panel</Text>
        <Text style={styles.adminSubtitle}>Monitor reports, users, and emergency data.</Text>

        <View style={styles.adminStatsGrid}>
          <View style={styles.adminStatCard}>
            <Text style={styles.adminStatLabel}>Total Reports</Text>
            <Text style={styles.adminStatValue}>{stats.totalReports}</Text>
          </View>

          <View style={styles.adminStatCard}>
            <Text style={styles.adminStatLabel}>Pending</Text>
            <Text style={styles.adminStatValue}>{stats.pendingReports}</Text>
          </View>

          <View style={styles.adminStatCard}>
            <Text style={styles.adminStatLabel}>In Progress</Text>
            <Text style={styles.adminStatValue}>{stats.inProgressReports}</Text>
          </View>

          <View style={styles.adminStatCard}>
            <Text style={styles.adminStatLabel}>Users</Text>
            <Text style={styles.adminStatValue}>{stats.totalUsers}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.adminActionCard} onPress={() => navigation.navigate('AdminReports')}>
          <View style={styles.adminActionIconWrap}>
            <MaterialCommunityIcons name="file-document-multiple-outline" size={22} color="#2C3E50" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminActionTitle}>Manage Reports</Text>
            <Text style={styles.adminActionMeta}>Review reports, open details, and update response flow.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B8B99" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.adminActionCard} onPress={() => navigation.navigate('AdminUsers')}>
          <View style={styles.adminActionIconWrap}>
            <Ionicons name="people-outline" size={22} color="#2C3E50" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminActionTitle}>Manage Users</Text>
            <Text style={styles.adminActionMeta}>Review profiles, roles, and account actions.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B8B99" />
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} variant="admin" />
    </View>
  );
}
