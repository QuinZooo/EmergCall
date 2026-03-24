import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function ContactsScreen({ navigation }) {
  const contacts = [1, 2, 3];

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contactsBackdropTop} />
      <View style={styles.contactsBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.contactsScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.contactsTitle}>Emergency Contacts</Text>
        <Text style={styles.contactsSubtitle}>People we notify during urgent situations.</Text>

        {contacts.map((item) => (
          <View key={item} style={styles.contactCardModern}>
            <View style={styles.contactAvatarWrap}>
              <Ionicons name="person" size={22} color="#2C3E50" />
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.contactNameModern}>Name of Emergency Contact</Text>
              <Text style={styles.contactPhoneModern}>Phone Number</Text>
            </View>

            <TouchableOpacity style={styles.contactDeleteBtn}>
              <Ionicons name="trash-outline" size={18} color="#C84444" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addContactBtn}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.addContactBtnText}>Add Contact</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
