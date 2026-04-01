import * as React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from '../styles/commonStyles';
import { supabase } from '../lib/supabase.js';
import { resolvePostLoginRoute } from '../lib/mfaFlow.js';

export default function SplashScreen({ navigation }) {
  const [checkingSession, setCheckingSession] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (!error && data?.session) {
          const nextRoute = await resolvePostLoginRoute();
          navigation.replace(nextRoute);
          return;
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <View style={styles.splashCenter}>
        <Image source={require('../../project-assets/emergcall_logo.png')} style={styles.logoLarge} resizeMode="contain" />
        <Text style={styles.splashTitle}>EMERGCALL</Text>
      </View>

      {checkingSession ? (
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={[styles.primaryButtonText, { marginTop: 12 }]}>Checking account...</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={[styles.primaryButton, { width: '80%', marginBottom: 40 }]}
        >
          <Text style={styles.primaryButtonText}>Let's Get Started!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
