import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Header from '../components/Header.jsx';
import styles from '../styles/commonStyles';

export default function SignupScreen({ navigation }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Header transparent={true} />
        <View style={styles.formCardContainer}>
          <Text style={[styles.formTitle, { marginBottom: 32 }]}>Create Account</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWithIcon}>
            <TextInput 
              style={styles.inputField}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIconButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWithIcon}>
            <TextInput 
              style={styles.inputField}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIconButton}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryButtonText}>BACK TO LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
