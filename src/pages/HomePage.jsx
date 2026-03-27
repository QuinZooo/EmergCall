import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.homeBackdropTop} />
      <View style={styles.homeBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.homeScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.homeHero}>
          <Text style={styles.homeEyebrow}>STAY READY</Text>
          <Text style={styles.homeTitle}>Emergency Hub</Text>
          <Text style={styles.homeSubtitle}>Fast access to emergency services when every second counts.</Text>
        </View>

        <TouchableOpacity style={styles.sosCircleButton} onPress={() => navigation.navigate('SOS')}>
          <Text style={styles.sosCircleTitle}>SOS</Text>
          <Text style={styles.sosCircleHint}>Tap for emergency alert</Text>
        </TouchableOpacity>

        <Text style={styles.quickLabel}>Quick Actions</Text>
        <View style={styles.directoryGrid}>
          <TouchableOpacity style={[styles.dirCard, styles.policeCard]} onPress={() => navigation.navigate('ReportIncident')}>
            <View style={styles.dirIconBubble}>
              <MaterialCommunityIcons name="file-document-edit" size={30} color="#2C3E50" />
            </View>
            <Text style={styles.dirCardTitle}>Report</Text>
            <Text style={styles.dirCardMeta}>Incident</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dirCard, styles.fireCard]} onPress={() => navigation.navigate('GPS')}>
            <View style={styles.dirIconBubble}>
              <Ionicons name="location" size={30} color="#E65100" />
            </View>
            <Text style={styles.dirCardTitle}>GPS</Text>
            <Text style={styles.dirCardMeta}>Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dirCard, styles.medicCard]} onPress={() => navigation.navigate('Hotline')}>
            <View style={styles.dirIconBubble}>
              <Ionicons name="call" size={30} color="#2AAFC2" />
            </View>
            <Text style={styles.dirCardTitle}>Hotline</Text>
            <Text style={styles.dirCardMeta}>Emergency</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
