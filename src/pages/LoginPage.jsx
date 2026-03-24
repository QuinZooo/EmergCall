import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Header from '../components/Header.jsx';
import styles from '../styles/commonStyles';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} />
        <Text style={styles.label}>Pass</Text>
        <TextInput style={styles.input} secureTextEntry={true} />
        
        <View style={styles.rememberContainer}>
          <View style={styles.checkboxBox} />
          <Text style={styles.rememberText}>Remember me?</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryButtonText}>LOGIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.secondaryButtonText}>SIGN UP</Text>
        </TouchableOpacity>
        
        <Text style={styles.forgotText}>forgot password?</Text>
      </View>
    </View>
  );
}
