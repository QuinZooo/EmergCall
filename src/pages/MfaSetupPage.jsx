import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import Header from '../components/Header.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

const qrFromUri = (uri = '') => {
  if (!uri) {
    return '';
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uri)}`;
};

export default function MfaSetupScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);
  const [verifying, setVerifying] = React.useState(false);
  const [factorId, setFactorId] = React.useState('');
  const [otpUri, setOtpUri] = React.useState('');
  const [otpSecret, setOtpSecret] = React.useState('');
  const [code, setCode] = React.useState('');

  const setupFactor = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        throw factorsError;
      }

      const verifiedTotp = (factorsData?.totp || []).find((factor) => factor.status === 'verified');
      if (verifiedTotp) {
        navigation.replace('MfaVerify');
        return;
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'EmergCall Authenticator',
      });

      if (error) {
        throw error;
      }

      setFactorId(data?.id || '');
      setOtpUri(data?.totp?.uri || '');
      setOtpSecret(data?.totp?.secret || '');
    } catch (err) {
      Alert.alert('2FA Setup Error', err?.message || 'Unable to initialize 2FA setup.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  React.useEffect(() => {
    setupFactor();
  }, [setupFactor]);

  const handleVerify = async () => {
    if (!factorId) {
      Alert.alert('Setup Required', 'Please wait for setup to complete first.');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Missing Code', 'Enter the 6-digit code from your authenticator app.');
      return;
    }

    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        throw challengeError;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: code.trim(),
      });

      if (verifyError) {
        throw verifyError;
      }

      Alert.alert('2FA Enabled', 'Authenticator verification successful.', [
        { text: 'Continue', onPress: () => navigation.replace('Home') },
      ]);
    } catch (err) {
      Alert.alert('Verification Failed', err?.message || 'Unable to verify this code.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}> 
        <Header transparent={true} />
        <View style={styles.formCardContainer}>
          <Text style={styles.formTitle}>Set Up 2FA</Text>
          <Text style={{ color: '#5F6E7A', marginBottom: 14, fontSize: 14, lineHeight: 20 }}>
            Scan this QR code with Google Authenticator, Authy, or another TOTP app, then enter the generated code.
          </Text>

          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color="#FF9800" />
              <Text style={{ color: '#5F6E7A', marginTop: 10 }}>Preparing secure setup...</Text>
            </View>
          ) : (
            <>
              {otpUri ? <Image source={{ uri: qrFromUri(otpUri) }} style={{ width: 220, height: 220, alignSelf: 'center', borderRadius: 12, marginBottom: 12 }} /> : null}
              <Text style={styles.label}>Manual Secret (if QR scan fails)</Text>
              <Text style={{ color: '#2C3E50', fontSize: 13, marginBottom: 12 }}>{otpSecret || 'Unavailable'}</Text>

              <Text style={styles.label}>Authenticator Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                editable={!verifying}
              />

              <TouchableOpacity style={[styles.primaryButton, { opacity: verifying ? 0.7 : 1 }]} onPress={handleVerify} disabled={verifying}>
                {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>VERIFY & CONTINUE</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={setupFactor} disabled={verifying}>
                <Text style={styles.secondaryButtonText}>REGENERATE QR</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
