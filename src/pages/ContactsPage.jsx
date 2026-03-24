import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function ContactsScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <ScrollView style={styles.contactsContent}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.contactCard}>
            <Ionicons name="person-circle" size={40} color="#333" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Name of Emergency Contact</Text>
              <Text style={styles.contactPhone}>Phone Number</Text>
            </View>
            <Ionicons name="trash" size={24} color="#d32f2f" />
          </View>
        ))}
        <TouchableOpacity>
          <Text style={styles.addContactText}>+ Add Contact</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavBar navigation={navigation} />
    </View>
  );
}
