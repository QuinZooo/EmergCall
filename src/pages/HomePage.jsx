import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <View style={styles.homeContent}>
        <TouchableOpacity style={styles.sosButton}>
          <Text style={styles.sosText}>SOS</Text>
          <Ionicons name="notifications" size={50} color="#fff" />
        </TouchableOpacity>

        <View style={styles.directoryRow}>
          <TouchableOpacity style={[styles.dirBtn, { backgroundColor: '#2C3E50' }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={30} color="#2C3E50" />
            </View>
            <Text style={styles.dirBtnText}>Police</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dirBtn, { backgroundColor: '#E65100' }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="fire" size={30} color="#E65100" />
            </View>
            <Text style={styles.dirBtnText}>Fire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dirBtn, { backgroundColor: '#4DD0E1' }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="hospital-box" size={30} color="#4DD0E1" />
            </View>
            <Text style={styles.dirBtnText}>Medic</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavBar navigation={navigation} />
    </View>
  );
}
