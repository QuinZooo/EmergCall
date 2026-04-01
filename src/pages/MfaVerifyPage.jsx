import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Header from '../components/Header.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

export default function MfaVerifyScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);
  const [verifying, setVerifying] = React.useState(false);
  const [factorId, setFactorId] = React.useState('');
  const [challengeId, setChallengeId] = React.useState('');
  const [code, setCode] = React.useState('');

  const prepareChallenge = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === 'aal2') {
        navigation.replace('Home');
        return;
      }

      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        throw factorsError;
      }

      const verifiedTotp = (factorsData?.totp || []).find((factor) => factor.status === 'verified');
      if (!verifiedTotp) {
        navigation.replace('MfaSetup');
        return;
      }

      setFactorId(verifiedTotp.id);

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedTotp.id,
      });

      if (challengeError) {
        throw challengeError;
      }

      setChallengeId(challengeData.id || '');
    } catch (err) {
      Alert.alert('2FA Error', err?.message || 'Unable to prepare verification challenge.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  React.useEffect(() => {
    prepareChallenge();
  }, [prepareChallenge]);

  const handleVerify = async () => {
    if (!factorId || !challengeId) {
      Alert.alert('Try Again', 'Verification challenge expired. Please refresh the challenge.');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Missing Code', 'Enter the current code from your authenticator app.');
      return;
    }

    setVerifying(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: code.trim(),
      });

      if (error) {
        throw error;
      }

      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Verification Failed', err?.message || 'Invalid or expired code.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Header transparent={true} />
        <View style={styles.formCardContainer}>
          <Text style={styles.formTitle}>Verify 2FA</Text>
          <Text style={{ color: '#5F6E7A', marginBottom: 14, fontSize: 14, lineHeight: 20 }}>
            Enter the one-time code from your authenticator app to continue.
          </Text>

          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color="#FF9800" />
              <Text style={{ color: '#5F6E7A', marginTop: 10 }}>Preparing challenge...</Text>
            </View>
          ) : (
            <>
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
                {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>VERIFY</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={prepareChallenge} disabled={verifying}>
                <Text style={styles.secondaryButtonText}>REFRESH CHALLENGE</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.forgotText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
