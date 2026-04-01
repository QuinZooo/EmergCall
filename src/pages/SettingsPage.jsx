import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';
import { supabase } from '../lib/supabase.js';
import { loadAppSettings, saveAppSettings, DEFAULT_APP_SETTINGS } from '../lib/appSettings.js';

export default function SettingsPage({ navigation }) {
  const [user, setUser] = React.useState(null);
  const [settings, setSettings] = React.useState({ ...DEFAULT_APP_SETTINGS });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const sessionUser = session?.user || null;
        setUser(sessionUser);

        const stored = await loadAppSettings(sessionUser?.id);
        setSettings(stored);
      } catch (err) {
        Alert.alert('Settings Error', err?.message || 'Unable to load settings right now.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const updateSetting = async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);

    try {
      await saveAppSettings(user?.id, next);
    } catch (err) {
      setSettings(settings);
      Alert.alert('Save Failed', err?.message || 'Unable to save this setting.');
    }
  };

  const stepCountdown = (direction) => {
    const nextValue = Math.max(0, Math.min(30, settings.sosCountdownSeconds + direction));
    updateSetting({ sosCountdownSeconds: nextValue });
  };

  const handleSignOut = async (scope = 'local') => {
    try {
      const { error } = await supabase.auth.signOut({ scope });
      if (error) {
        throw error;
      }

      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Logout Failed', err?.message || 'Unable to logout right now.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'You will be signed out from this device. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => handleSignOut('local'),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <Header transparent={true} />
        <View style={styles.settingsLoadingState}>
          <ActivityIndicator size="large" color="#2C3E50" />
          <Text style={styles.settingsLoadingText}>Loading settings...</Text>
        </View>
        <BottomNavBar navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.profileBackdropTop} />
      <View style={styles.profileBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.settingsScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsTopRow}>
          <TouchableOpacity style={styles.settingsBackBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={18} color="#2C3E50" />
            <Text style={styles.settingsBackBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.contactsTitle}>Settings</Text>
        <Text style={styles.contactsSubtitle}>Customize your emergency and account preferences.</Text>

        <View style={styles.settingsSectionCard}>
          <Text style={styles.settingsSectionTitle}>Emergency SOS</Text>

          <View style={styles.settingsSwitchRow}>
            <View style={styles.settingsSwitchContent}>
              <Text style={styles.settingsLabel}>Shake phone to trigger SOS</Text>
              <Text style={styles.settingsHint}>A strong double-shake opens the SOS screen.</Text>
            </View>
            <Switch
              value={settings.shakeToSosEnabled}
              onValueChange={(value) => updateSetting({ shakeToSosEnabled: value })}
              trackColor={{ false: '#C8D3DE', true: '#8DC5FF' }}
              thumbColor={settings.shakeToSosEnabled ? '#2C3E50' : '#F5F8FA'}
            />
          </View>

          <View style={styles.settingsDivider} />

          <View style={styles.settingsSwitchRow}>
            <View style={styles.settingsSwitchContent}>
              <Text style={styles.settingsLabel}>Include GPS location in SOS</Text>
              <Text style={styles.settingsHint}>Attach your coordinates and map link.</Text>
            </View>
            <Switch
              value={settings.includeLocationInSos}
              onValueChange={(value) => updateSetting({ includeLocationInSos: value })}
              trackColor={{ false: '#C8D3DE', true: '#8DC5FF' }}
              thumbColor={settings.includeLocationInSos ? '#2C3E50' : '#F5F8FA'}
            />
          </View>

          <View style={styles.settingsDivider} />

          <View style={styles.settingsSwitchRow}>
            <View style={styles.settingsSwitchContent}>
              <Text style={styles.settingsLabel}>Include medical info in SOS</Text>
              <Text style={styles.settingsHint}>Blood type, allergies, and medications.</Text>
            </View>
            <Switch
              value={settings.includeMedicalInfoInSos}
              onValueChange={(value) => updateSetting({ includeMedicalInfoInSos: value })}
              trackColor={{ false: '#C8D3DE', true: '#8DC5FF' }}
              thumbColor={settings.includeMedicalInfoInSos ? '#2C3E50' : '#F5F8FA'}
            />
          </View>

          <View style={styles.settingsDivider} />

          <View style={styles.settingsStepperRow}>
            <View style={styles.settingsSwitchContent}>
              <Text style={styles.settingsLabel}>SOS countdown</Text>
              <Text style={styles.settingsHint}>Delay before auto sending SOS message.</Text>
            </View>
            <View style={styles.settingsStepperControls}>
              <TouchableOpacity style={styles.settingsStepperBtn} onPress={() => stepCountdown(-1)}>
                <Ionicons name="remove" size={16} color="#2C3E50" />
              </TouchableOpacity>
              <Text style={styles.settingsStepperValue}>{settings.sosCountdownSeconds}s</Text>
              <TouchableOpacity style={styles.settingsStepperBtn} onPress={() => stepCountdown(1)}>
                <Ionicons name="add" size={16} color="#2C3E50" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.settingsSectionCard}>
          <Text style={styles.settingsSectionTitle}>Quick Links</Text>

          <TouchableOpacity style={styles.settingsActionRow} onPress={() => navigation.navigate('Contacts')}>
            <View style={styles.profileIconWrap}>
              <Ionicons name="people" size={18} color="#2C3E50" />
            </View>
            <View style={styles.settingsActionTextWrap}>
              <Text style={styles.settingsActionTitle}>Emergency Contacts</Text>
              <Text style={styles.settingsHint}>Manage who receives SOS messages.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsActionRow} onPress={() => navigation.navigate('MedicalInfo')}>
            <View style={styles.profileIconWrap}>
              <MaterialCommunityIcons name="medical-bag" size={18} color="#2C3E50" />
            </View>
            <View style={styles.settingsActionTextWrap}>
              <Text style={styles.settingsActionTitle}>Medical Information</Text>
              <Text style={styles.settingsHint}>Update medical details used in SOS alerts.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsActionRow} onPress={() => navigation.navigate('Hotline')}>
            <View style={styles.profileIconWrap}>
              <Ionicons name="call" size={18} color="#2C3E50" />
            </View>
            <View style={styles.settingsActionTextWrap}>
              <Text style={styles.settingsActionTitle}>Emergency Hotlines</Text>
              <Text style={styles.settingsHint}>Open quick-dial emergency numbers.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsDangerCard}>
          <Text style={styles.settingsSectionTitle}>Session</Text>

          <TouchableOpacity style={styles.settingsDangerRow} onPress={confirmLogout}>
            <View style={styles.profileLogoutIconWrap}>
              <Ionicons name="log-out-outline" size={18} color="#C84444" />
            </View>
            <Text style={styles.settingsDangerText}>Logout this device</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
