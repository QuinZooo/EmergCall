import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
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
          <Text style={styles.homeEyebrow}>Stay Ready</Text>
          <Text style={styles.homeTitle}>Emergency Hub</Text>
          <Text style={styles.homeSubtitle}>Fast access to emergency services when every second counts.</Text>
        </View>

        <TouchableOpacity style={styles.sosCircleButton} onPress={() => navigation.navigate('SOS')}>
          <Text style={styles.sosCircleTitle}>Trigger SOS</Text>
          <Text style={styles.sosCircleHint}>Tap for emergency help</Text>
        </TouchableOpacity>

        <Text style={styles.quickLabel}>Quick Directory</Text>
        <View style={styles.directoryGrid}>
          <TouchableOpacity style={[styles.dirCard, styles.policeCard]} onPress={() => Linking.openURL('tel:911')}>
            <View style={styles.dirIconBubble}>
              <Ionicons name="shield-checkmark" size={30} color="#2C3E50" />
            </View>
            <Text style={styles.dirCardTitle}>Police</Text>
            <Text style={styles.dirCardMeta}>911 Hotline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dirCard, styles.fireCard]} onPress={() => Linking.openURL('tel:911')}>
            <View style={styles.dirIconBubble}>
              <MaterialCommunityIcons name="fire" size={30} color="#E65100" />
            </View>
            <Text style={styles.dirCardTitle}>Fire</Text>
            <Text style={styles.dirCardMeta}>Rescue Team</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dirCard, styles.medicCard]} onPress={() => Linking.openURL('tel:911')}>
            <View style={styles.dirIconBubble}>
              <MaterialCommunityIcons name="hospital-box" size={30} color="#4DD0E1" />
            </View>
            <Text style={styles.dirCardTitle}>Medic</Text>
            <Text style={styles.dirCardMeta}>Ambulance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
