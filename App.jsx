import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Pages
import SplashPage from './src/pages/SplashPage.jsx';
import LoginPage from './src/pages/LoginPage.jsx';
import SignupPage from './src/pages/SignupPage.jsx';
import HomePage from './src/pages/HomePage.jsx';
import ProfilePage from './src/pages/ProfilePage.jsx';
import ContactsPage from './src/pages/ContactsPage.jsx';

const Stack = createNativeStackNavigator();

const routes = [
  { name: 'Splash', component: SplashPage },
  { name: 'Login', component: LoginPage },
  { name: 'Signup', component: SignupPage },
  { name: 'Home', component: HomePage },
  { name: 'Profile', component: ProfilePage },
  { name: 'Contacts', component: ContactsPage }
];

export default function App() {
  return (
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
  );
}
