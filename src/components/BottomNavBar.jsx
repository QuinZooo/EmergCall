import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles/commonStyles';

export default function BottomNavBar({ navigation, variant = 'user' }) {
  const items = variant === 'admin'
    ? [
        {
          key: 'reports',
          label: 'Reports',
          icon: <MaterialCommunityIcons name="file-document-multiple-outline" size={24} color="#fff" />,
          onPress: () => navigation.navigate('AdminReports'),
        },
        {
          key: 'admin',
          label: 'Admin Panel',
          icon: <Ionicons name="shield-checkmark" size={24} color="#fff" />,
          onPress: () => navigation.navigate('AdminDashboard'),
        },
        {
          key: 'profile',
          label: 'Profile',
          icon: <Ionicons name="person-circle" size={24} color="#fff" />,
          onPress: () => navigation.navigate('Profile'),
        },
      ]
    : [
        {
          key: 'contacts',
          label: 'Contacts',
          icon: <Ionicons name="people-circle" size={24} color="#fff" />,
          onPress: () => navigation.navigate('Contacts'),
        },
        {
          key: 'home',
          label: 'Home',
          icon: <Ionicons name="home" size={24} color="#fff" />,
          onPress: () => navigation.navigate('Home'),
        },
        {
          key: 'reports',
          label: 'My Reports',
          icon: <MaterialCommunityIcons name="file-document-outline" size={24} color="#fff" />,
          onPress: () => navigation.navigate('MyReports'),
        },
        {
          key: 'profile',
          label: 'Profile',
          icon: <Ionicons name="person-circle" size={24} color="#fff" />,
          onPress: () => navigation.navigate('Profile'),
        },
      ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <TouchableOpacity key={item.key} style={styles.navItem} onPress={item.onPress}>
          {item.icon}
          <Text style={styles.navText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
