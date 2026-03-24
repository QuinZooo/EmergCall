import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/commonStyles';

const BottomNavBar = ({ navigation }) => (
  <View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Contacts')}>
      <Ionicons name="people-circle" size={28} color="#fff" />
      <Text style={styles.navText}>Contacts</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
      <Ionicons name="home" size={28} color="#fff" />
      <Text style={styles.navText}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
      <Ionicons name="person-circle" size={28} color="#fff" />
      <Text style={styles.navText}>Profile</Text>
    </TouchableOpacity>
  </View>
);

export default BottomNavBar;
