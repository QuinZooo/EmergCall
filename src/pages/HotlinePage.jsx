import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

const HOTLINES = [
  { id: '1', label: 'National Emergency', number: '911', icon: 'shield-checkmark', iconType: 'ionicon', color: '#2C3E50' },
  { id: '2', label: 'Philippine Red Cross', number: '143', icon: 'medkit', iconType: 'ionicon', color: '#D64545' },
  { id: '3', label: 'QC Fire Department (BFP)', number: '(02) 8925-0168', icon: 'fire', iconType: 'material', color: '#E65100' },
  { id: '4', label: 'QC Police (QCPD)', number: '(02) 8988-8722', icon: 'shield', iconType: 'ionicon', color: '#1A5276' },
  { id: '5', label: 'NDRRMC', number: '(02) 8911-5061', icon: 'warning', iconType: 'ionicon', color: '#FF9800' },
  { id: '6', label: 'DOH Health Hotline', number: '1555', icon: 'hospital-box', iconType: 'material', color: '#2AAFC2' },
  { id: '7', label: 'QC Disaster Risk Reduction', number: '(02) 8925-1170', icon: 'alert-circle', iconType: 'ionicon', color: '#FF9800' },
  { id: '8', label: 'PNP Hotline', number: '117', icon: 'call', iconType: 'ionicon', color: '#27AE60' },
  { id: '9', label: 'Bantay Bata (Child Abuse)', number: '163', icon: 'people', iconType: 'ionicon', color: '#8E44AD' },
];

export default function HotlineScreen({ navigation }) {
  const dialNumber = (number) => {
    const cleaned = number.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleaned}`);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contactsBackdropTop} />
      <View style={styles.contactsBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.contactsScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.contactsTitle}>Emergency Hotlines</Text>
        <Text style={styles.contactsSubtitle}>Tap any hotline to call directly.</Text>

        {HOTLINES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.hotlineCard} onPress={() => dialNumber(item.number)}>
            <View style={[styles.hotlineIconWrap, { backgroundColor: item.color + '18' }]}>
              {item.iconType === 'material' ? (
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              ) : (
                <Ionicons name={item.icon} size={22} color={item.color} />
              )}
            </View>
            <View style={styles.hotlineInfo}>
              <Text style={styles.hotlineLabel}>{item.label}</Text>
              <Text style={styles.hotlineNumber}>{item.number}</Text>
            </View>
            <View style={styles.hotlineCallBtn}>
              <Ionicons name="call" size={18} color="#27AE60" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
