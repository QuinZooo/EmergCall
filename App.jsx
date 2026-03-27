import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View } from 'react-native';

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

const Stack = createNativeStackNavigator();

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
  { name: 'GPS', component: GPSPage }
];

export default function App() {
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

  return (
    <View style={{ flex: 1, backgroundColor: '#E6F4FE' }}>
      <NavigationContainer>
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
