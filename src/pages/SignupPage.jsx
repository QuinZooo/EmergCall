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
  const [verificationCode, setVerificationCode] = React.useState('');
  const [verificationModalVisible, setVerificationModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

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

  const handleCreateAccount = async () => {
    setError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (otpError) {
        setError(otpError.message);
        Alert.alert('Signup Error', otpError.message);
        return;
      }

      setVerificationCode('');
      setVerificationModalVisible(true);
      setSuccessMessage('Verification code sent. Check your email from EmergCall App.');
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
      Alert.alert('Error', err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setSuccessMessage('');

    if (!verificationCode.trim()) {
      setError('Verification code is required');
      return;
    }

    if (verificationCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: verificationCode.trim(),
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message);
        Alert.alert('Verification Error', verifyError.message);
        return;
      }

      if (data?.session) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password,
          data: {
            full_name: fullName.trim(),
          },
        });

        if (passwordError) {
          setError(passwordError.message);
          Alert.alert('Profile Error', passwordError.message);
          return;
        }

        setSuccessMessage('Email verified successfully. Account created.');
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setVerificationModalVisible(false);
        navigation.navigate('Home');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during verification');
      Alert.alert('Verification Error', err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Modal
          transparent={true}
          visible={verificationModalVisible}
          animationType="fade"
          onRequestClose={() => setVerificationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm your signup</Text>
              <Text style={{ color: '#334', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
                From EmergCall App
              </Text>
              <Text style={{ color: '#445', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                Enter the 6-digit verification code sent to {email.trim()}.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                autoCapitalize="none"
                value={verificationCode}
                onChangeText={setVerificationCode}
                editable={!loading}
                maxLength={6}
              />

              <TouchableOpacity
                style={[styles.primaryButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>VERIFY CODE</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleCreateAccount}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>RESEND CODE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={() => setVerificationModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>CLOSE</Text>
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

          {successMessage ? (
            <View style={{ backgroundColor: '#e8f6ee', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: '#0c6b3f', fontSize: 14 }}>{successMessage}</Text>
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
            onPress={handleCreateAccount}
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
