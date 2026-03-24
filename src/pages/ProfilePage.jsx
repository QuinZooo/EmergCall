import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function ProfileScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <View style={styles.profileContent}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.profileName}>Name</Text>
        <Text style={styles.profileEmail}>Example@gmail.com</Text>

        <View style={styles.profileMenu}>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="person" size={20} color="#333" />
            <Text style={styles.profileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn}>
            <MaterialCommunityIcons name="medical-bag" size={20} color="#333" />
            <Text style={styles.profileBtnText}>Set Medical Information</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="settings" size={20} color="#333" />
            <Text style={styles.profileBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavBar navigation={navigation} />
    </View>
  );
}
