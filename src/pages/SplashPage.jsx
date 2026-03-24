import * as React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../styles/commonStyles';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.splashContainer}>
      <View style={styles.splashCenter}>
        <Image source={require('../../project-assets/emergcall_logo.png')} style={styles.logoLarge} resizeMode="contain" />
        <Text style={styles.splashTitle}>EMERGCALL</Text>
      </View>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Login')} 
        style={[styles.primaryButton, { width: '80%', marginBottom: 40 }]}
      >
        <Text style={styles.primaryButtonText}>Let's Get Started!</Text>
      </TouchableOpacity>
    </View>
  );
}
