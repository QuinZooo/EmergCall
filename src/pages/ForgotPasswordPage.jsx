import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Header from '../components/Header.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

const findProfileByEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export default function ForgotPasswordPage({ navigation }) {
  const [step, setStep] = React.useState('email');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const requestOtp = async () => {
    setError('');
    setSuccessMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const existingProfile = await findProfileByEmail(normalizedEmail);
      if (!existingProfile?.id) {
        Alert.alert(
          'Email Not Found',
          'This email does not have an account. Do you want to create one?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Create Account', onPress: () => navigation.navigate('Signup') },
          ]
        );
        return;
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        throw otpError;
      }

      setStep('otp');
      setSuccessMessage('OTP sent. Please check your email.');
    } catch (err) {
      setError(err?.message || 'Unable to send OTP right now.');
      Alert.alert('Reset Password Error', err?.message || 'Unable to send OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setSuccessMessage('');

    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: 'email',
      });

      if (verifyError) {
        throw verifyError;
      }

      setStep('password');
      setSuccessMessage('OTP verified. Enter your new password.');
    } catch (err) {
      setError(err?.message || 'Invalid or expired OTP.');
      Alert.alert('OTP Error', err?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const saveNewPassword = async () => {
    setError('');
    setSuccessMessage('');

    if (!password) {
      setError('New password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();
      Alert.alert('Password Changed', 'Change password done, please login now.', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Login'),
        },
      ]);
    } catch (err) {
      setError(err?.message || 'Unable to change password right now.');
      Alert.alert('Change Password Error', err?.message || 'Unable to change password right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Header transparent={true} />
        <View style={styles.formCardContainer}>
          <Text style={styles.formTitle}>Forgot Password</Text>
          <Text style={{ color: '#6B7A88', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
            {step === 'email'
              ? 'Enter your email and we will send an OTP.'
              : step === 'otp'
                ? 'Enter the OTP sent to your email.'
                : 'Enter your new password.'}
          </Text>

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

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading && step === 'email'}
          />

          {step === 'otp' || step === 'password' ? (
            <>
              <Text style={styles.label}>OTP Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                autoCapitalize="none"
                value={otp}
                onChangeText={setOtp}
                editable={!loading && step === 'otp'}
                maxLength={6}
              />
            </>
          ) : null}

          {step === 'password' ? (
            <>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconButton} disabled={loading}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIconButton} disabled={loading}>
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {step === 'email' ? (
            <TouchableOpacity style={[styles.primaryButton, { opacity: loading ? 0.6 : 1 }]} onPress={requestOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>SEND OTP</Text>}
            </TouchableOpacity>
          ) : null}

          {step === 'otp' ? (
            <>
              <TouchableOpacity style={[styles.primaryButton, { opacity: loading ? 0.6 : 1 }]} onPress={verifyOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>VERIFY OTP</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={requestOtp} disabled={loading}>
                <Text style={styles.secondaryButtonText}>RESEND OTP</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {step === 'password' ? (
            <>
              <TouchableOpacity style={[styles.primaryButton, { opacity: loading ? 0.6 : 1 }]} onPress={saveNewPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>SAVE PASSWORD</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.replace('Login')} disabled={loading}>
                <Text style={styles.secondaryButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {step === 'email' ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={styles.secondaryButtonText}>BACK TO LOGIN</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
