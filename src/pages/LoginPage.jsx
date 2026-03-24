import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Header from '../components/Header.jsx';
import styles from '../styles/commonStyles';

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Header transparent={true} />
        <View style={styles.formCardContainer}>
          <Text style={styles.formTitle}>Welcome Back</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
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

          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryButtonText}>LOGIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.secondaryButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
