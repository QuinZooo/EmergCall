import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import Header from '../components/Header.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successModalVisible, setSuccessModalVisible] = React.useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Sign up with Supabase
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        Alert.alert('Signup Error', signupError.message);
        setLoading(false);
        return;
      }

      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Use an in-app modal so the message always appears on web and mobile.
      setSuccessModalVisible(true);
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
      Alert.alert('Error', err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Modal
          transparent={true}
          visible={successModalVisible}
          animationType="fade"
          onRequestClose={() => {
            setSuccessModalVisible(false);
            navigation.navigate('Login');
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                width: '100%',
                maxWidth: 360,
                borderRadius: 14,
                padding: 20,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 12 }}>
                Check Your Email First
              </Text>
              <Text style={{ fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 18 }}>
                We sent you a confirmation email. Please click the link in your email before you can log in.
              </Text>

              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 0 }]}
                onPress={() => {
                  setSuccessModalVisible(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.primaryButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Header transparent={true} />
        <View style={styles.formCardContainer}>
          <Text style={[styles.formTitle, { marginBottom: 32 }]}>Create Account</Text>

          {error ? (
            <View style={{ backgroundColor: '#ffe5e5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: '#c00', fontSize: 14 }}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWithIcon}>
            <TextInput 
              style={styles.inputField}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIconButton}
              disabled={loading}
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
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIconButton}
              disabled={loading}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, { opacity: loading ? 0.6 : 1 }]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>BACK TO LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
