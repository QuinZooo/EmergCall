import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Header from '../components/Header.jsx';
import styles from '../styles/commonStyles';

export default function SignupScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} secureTextEntry={true} />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} secureTextEntry={true} />

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryButtonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>BACK TO LOGIN</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
