import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase.js';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [user, setUser] = React.useState(null);

  const getStorageKey = () => (user?.id ? `emergencyContacts:${user.id}` : 'emergencyContacts');

  const loadContacts = async () => {
    try {
      const key = getStorageKey();
      const stored = await AsyncStorage.getItem(key);
      if (stored) setContacts(JSON.parse(stored));
    } catch (e) {
      // Ignore errors
    }
  };

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.warn('Failed to get session', err);
      }
    };

    fetchUser();
  }, []);

  React.useEffect(() => {
    loadContacts();
  }, [user]);

  const saveContacts = async (newContacts) => {
    try {
      const key = getStorageKey();
      await AsyncStorage.setItem(key, JSON.stringify(newContacts));
      setContacts(newContacts);
    } catch (e) {
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }
    const newContact = { id: Date.now().toString(), name: newName.trim(), phone: newPhone.trim() };
    saveContacts([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Contact', 'Are you sure you want to delete this contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => saveContacts(contacts.filter(c => c.id !== id)) }
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contactsBackdropTop} />
      <View style={styles.contactsBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.contactsScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.contactsTitle}>Emergency Contacts</Text>
        <Text style={styles.contactsSubtitle}>People we notify during urgent situations.</Text>

        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCardModern}>
            <View style={styles.contactAvatarWrap}>
              <Ionicons name="person" size={22} color="#2C3E50" />
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.contactNameModern}>{contact.name}</Text>
              <Text style={styles.contactPhoneModern}>{contact.phone}</Text>
            </View>

            <TouchableOpacity style={styles.contactDeleteBtn} onPress={() => handleDelete(contact.id)}>
              <Ionicons name="trash-outline" size={18} color="#C84444" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addContactBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.addContactBtnText}>Add Contact</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              placeholderTextColor="#999"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
                <Text style={styles.primaryButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
