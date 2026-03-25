import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Header from '../components/Header.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        const message = (loginError.message || '').toLowerCase();

        if (message.includes('email not confirmed')) {
          setError('Please confirm your email first before logging in.');
          Alert.alert('Email Not Confirmed', 'Please check your inbox and confirm your email before logging in.');
        } else if (message.includes('invalid login credentials')) {
          setError('Account not found or wrong password.');
          Alert.alert('Login Failed', 'Account is not registered yet or password is incorrect.');
        } else {
          setError(loginError.message);
          Alert.alert('Login Failed', loginError.message);
        }
        return;
      }

      if (data?.session) {
        navigation.navigate('Home');
      }
    } catch (err) {
      const fallback = 'An error occurred while logging in.';
      setError(err?.message || fallback);
      Alert.alert('Login Error', err?.message || fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Header transparent={true} />
        <View style={styles.formCardContainer}>
          <Text style={styles.formTitle}>Welcome Back</Text>

          {error ? (
            <View style={{ backgroundColor: '#ffe5e5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: '#c00', fontSize: 14 }}>{error}</Text>
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
            editable={!loading}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
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

          <TouchableOpacity
            style={[styles.primaryButton, { opacity: loading ? 0.6 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>LOGIN</Text>}
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
