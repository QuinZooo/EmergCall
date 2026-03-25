import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

export default function ProfileScreen({ navigation }) {
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.warn('Failed to fetch user', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert('Logout Failed', error.message || 'Unable to logout right now.');
        return;
      }

      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Logout Failed', err?.message || 'Unable to logout right now.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.profileBackdropTop} />
      <View style={styles.profileBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.profileScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.profileTitle}>My Profile</Text>
        <Text style={styles.profileSubtitle}>Manage your account and emergency settings.</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={42} color="#2C3E50" />
          </View>
          <Text style={styles.profileName}>{user?.user_metadata?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'example@gmail.com'}</Text>
          <TouchableOpacity style={styles.profileEditChip}>
            <Text style={styles.profileEditChipText}>Update Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileMenu}>
          <TouchableOpacity style={styles.profileActionRow}>
            <View style={styles.profileIconWrap}>
              <Ionicons name="person" size={18} color="#2C3E50" />
            </View>
            <Text style={styles.profileActionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileActionRow}>
            <View style={styles.profileIconWrap}>
              <MaterialCommunityIcons name="medical-bag" size={18} color="#2C3E50" />
            </View>
            <Text style={styles.profileActionText}>Set Medical Information</Text>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileActionRow}>
            <View style={styles.profileIconWrap}>
              <Ionicons name="settings" size={18} color="#2C3E50" />
            </View>
            <Text style={styles.profileActionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.profileLogoutBtn} onPress={handleLogout} disabled={loggingOut}>
          <View style={styles.profileLogoutIconWrap}>
            <Ionicons name="log-out-outline" size={18} color="#C84444" />
          </View>
          <Text style={styles.profileLogoutText}>{loggingOut ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
