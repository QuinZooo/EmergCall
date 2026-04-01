import * as React from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';

// Import Pages
import SplashPage from './src/pages/SplashPage.jsx';
import LoginPage from './src/pages/LoginPage.jsx';
import SignupPage from './src/pages/SignupPage.jsx';
import HomePage from './src/pages/HomePage.jsx';
import ProfilePage from './src/pages/ProfilePage.jsx';
import ContactsPage from './src/pages/ContactsPage.jsx';
import SOSPage from './src/pages/SOSPage.jsx';
import HotlinePage from './src/pages/HotlinePage.jsx';
import ReportIncidentPage from './src/pages/ReportIncidentPage.jsx';
import GPSPage from './src/pages/GPSPage.jsx';
import MedicalInfoPage from './src/pages/MedicalInfoPage.jsx';
import MyReportsPage from './src/pages/MyReportsPage.jsx';
import ReportDetailPage from './src/pages/ReportDetailPage.jsx';
import MfaSetupPage from './src/pages/MfaSetupPage.jsx';
import MfaVerifyPage from './src/pages/MfaVerifyPage.jsx';
import SettingsPage from './src/pages/SettingsPage.jsx';
import { supabase } from './src/lib/supabase.js';
import { loadAppSettings } from './src/lib/appSettings.js';

const Stack = createNativeStackNavigator();
const SHAKE_THRESHOLD = 2.1;
const SHAKE_WINDOW_MS = 700;
const SHAKE_COOLDOWN_MS = 5000;
const SHAKE_DISABLED_ROUTES = new Set(['Splash', 'Login', 'Signup', 'SOS', 'MfaSetup', 'MfaVerify']);

const routes = [
  { name: 'Splash', component: SplashPage },
  { name: 'Login', component: LoginPage },
  { name: 'Signup', component: SignupPage },
  { name: 'Home', component: HomePage },
  { name: 'Profile', component: ProfilePage },
  { name: 'Contacts', component: ContactsPage },
  { name: 'SOS', component: SOSPage },
  { name: 'Hotline', component: HotlinePage },
  { name: 'ReportIncident', component: ReportIncidentPage },
  { name: 'MyReports', component: MyReportsPage },
  { name: 'ReportDetail', component: ReportDetailPage },
  { name: 'MfaSetup', component: MfaSetupPage },
  { name: 'MfaVerify', component: MfaVerifyPage },
  { name: 'Settings', component: SettingsPage },
  { name: 'GPS', component: GPSPage },
  { name: 'MedicalInfo', component: MedicalInfoPage }
];

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const shakeHitsRef = React.useRef([]);
  const lastShakeTriggerRef = React.useRef(0);
  const [shakeToSosEnabled, setShakeToSosEnabled] = React.useState(true);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const viewportContent = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    let viewportMeta = document.querySelector('meta[name="viewport"]');

    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }

    viewportMeta.setAttribute('content', viewportContent);

    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.backgroundColor = '#E6F4FE';

    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#E6F4FE';

    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.width = '100%';
      rootElement.style.height = '100%';
      rootElement.style.overflow = 'hidden';
      rootElement.style.backgroundColor = '#E6F4FE';
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const applySettingsForUser = async (userId) => {
      try {
        const settings = await loadAppSettings(userId);
        if (isMounted) {
          setShakeToSosEnabled(settings.shakeToSosEnabled !== false);
        }
      } catch (err) {
        if (isMounted) {
          setShakeToSosEnabled(true);
        }
      }
    };

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await applySettingsForUser(session?.user?.id);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await applySettingsForUser(session?.user?.id);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    Accelerometer.setUpdateInterval(120);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      if (!shakeToSosEnabled || !navigationRef.isReady()) {
        return;
      }

      const routeName = navigationRef.getCurrentRoute()?.name;
      if (!routeName || SHAKE_DISABLED_ROUTES.has(routeName)) {
        return;
      }

      const magnitude = Math.sqrt((x * x) + (y * y) + (z * z));
      if (magnitude < SHAKE_THRESHOLD) {
        return;
      }

      const now = Date.now();
      shakeHitsRef.current = shakeHitsRef.current.filter((timestamp) => now - timestamp <= SHAKE_WINDOW_MS);
      shakeHitsRef.current.push(now);

      if (shakeHitsRef.current.length < 2) {
        return;
      }

      if (now - lastShakeTriggerRef.current < SHAKE_COOLDOWN_MS) {
        return;
      }

      lastShakeTriggerRef.current = now;
      shakeHitsRef.current = [];
      navigationRef.navigate('SOS');
    });

    return () => {
      subscription.remove();
    };
  }, [navigationRef, shakeToSosEnabled]);

  return (
    <View style={{ flex: 1, backgroundColor: '#E6F4FE' }}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          {routes.map((route) => (
            <Stack.Screen
              key={route.name}
              name={route.name}
              component={route.component}
              options={{ headerShown: false }}
            />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
