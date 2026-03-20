import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- Shared Bottom Navigation Component ---
const BottomNavBar = ({ navigation }) => (
  <View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Contacts')}>
      <Ionicons name="people-circle" size={28} color="#fff" />
      <Text style={styles.navText}>Contacts</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
      <Ionicons name="home" size={28} color="#fff" />
      <Text style={styles.navText}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
      <Ionicons name="document-text" size={28} color="#fff" />
      <Text style={styles.navText}>Profile</Text>
    </TouchableOpacity>
  </View>
);

// --- Shared Header Component ---
const Header = () => (
  <View style={styles.headerDark}>
    <Image 
      source={require('./project-assets/emergcall_logo.png')} 
      style={styles.logoSmall} 
      resizeMode="contain" 
    />
  </View>
);

// --- 1. Splash / Welcome Screen ---
function SplashScreen({ navigation }) {
  return (
    <View style={styles.splashContainer}>
      <View style={styles.splashCenter}>
        <Image source={require('./project-assets/emergcall_logo.png')} style={styles.logoLarge} resizeMode="contain" />
        <Text style={styles.splashTitle}>EMERGCALL</Text>
      </View>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Login')} 
        style={[styles.primaryButton, { width: '80%', marginBottom: 40 }]}
      >
        <Text style={styles.primaryButtonText}>Let's Get Started!</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- 2. Login / Registration Screen ---
function LoginScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} />
        <Text style={styles.label}>Pass</Text>
        <TextInput style={styles.input} secureTextEntry={true} />
        
        <View style={styles.rememberContainer}>
          <View style={styles.checkboxBox} />
          <Text style={styles.rememberText}>Remember me?</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryButtonText}>LOGIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.secondaryButtonText}>SIGN UP</Text>
        </TouchableOpacity>
        
        <Text style={styles.forgotText}>forgot password?</Text>
      </View>
    </View>
  );
}

// --- 2b. Sign Up / Registration Screen ---
function SignupScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} secureTextEntry={true} />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} secureTextEntry={true} />

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryButtonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>BACK TO LOGIN</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
// --- 3. Home Screen (Dashboard) ---
function HomeScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <View style={styles.homeContent}>
 
        <TouchableOpacity style={styles.sosButton}>
          <Text style={styles.sosText}>SOS</Text>
          <Ionicons name="notifications" size={50} color="#fff" />
        </TouchableOpacity>


        <View style={styles.directoryRow}>
          <TouchableOpacity style={[styles.dirBtn, { backgroundColor: '#2C3E50' }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={30} color="#2C3E50" />
            </View>
            <Text style={styles.dirBtnText}>Police</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dirBtn, { backgroundColor: '#E65100' }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="fire" size={30} color="#E65100" />
            </View>
            <Text style={styles.dirBtnText}>Fire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dirBtn, { backgroundColor: '#4DD0E1' }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="hospital-box" size={30} color="#4DD0E1" />
            </View>
            <Text style={styles.dirBtnText}>Medic</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavBar navigation={navigation} />
    </View>
  );
}

// --- 4. Profile Screen ---
function ProfileScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <View style={styles.profileContent}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.profileName}>Name</Text>
        <Text style={styles.profileEmail}>Example@gmail.com</Text>

        <View style={styles.profileMenu}>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="person" size={20} color="#333" />
            <Text style={styles.profileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn}>
            <MaterialCommunityIcons name="medical-bag" size={20} color="#333" />
            <Text style={styles.profileBtnText}>Set Medical Information</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="settings" size={20} color="#333" />
            <Text style={styles.profileBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavBar navigation={navigation} />
    </View>
  );
}

// --- 5. Contacts Screen ---
function ContactsScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      <Header />
      <ScrollView style={styles.contactsContent}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.contactCard}>
            <Ionicons name="person-circle" size={40} color="#333" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Name of Emergency Contact</Text>
              <Text style={styles.contactPhone}>Phone Number</Text>
            </View>
            <Ionicons name="trash" size={24} color="#d32f2f" />
          </View>
        ))}
        <TouchableOpacity>
          <Text style={styles.addContactText}>+ Add Contact</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} /> 
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // --- General & Layout ---
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  headerDark: { backgroundColor: '#2C3E50', height: 120, justifyContent: 'center', alignItems: 'center', paddingTop: 20 },
  logoSmall: { width: 50, height: 60 },
  
  // --- Bottom Nav ---
  bottomNav: { flexDirection: 'row', backgroundColor: '#2C3E50', height: 70, justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  navItem: { alignItems: 'center' },
  navText: { color: '#fff', fontSize: 10, marginTop: 2 },

  // --- Splash Screen ---
  splashContainer: { flex: 1, backgroundColor: '#fff', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  splashCenter: { alignItems: 'center', marginTop: 150 },
  logoLarge: { width: 120, height: 150, marginBottom: 20 },
  splashTitle: { fontSize: 26, fontWeight: '900', color: '#FF9800', letterSpacing: 1 },
  loadingWrapper: { marginBottom: 30, padding: 10 },
  loadingText: { fontSize: 16, color: '#FF9800', fontWeight: '600' },

  // --- Login Screen ---
  formContainer: { paddingHorizontal: 40, paddingTop: 40 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  input: { backgroundColor: '#8C92AC', height: 45, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5 },
  rememberContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  checkboxBox: { width: 15, height: 15, backgroundColor: '#ccc', marginRight: 10 },
  rememberText: { fontSize: 12, fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#FF9800', paddingVertical: 12, alignItems: 'center', marginBottom: 10, borderRadius: 5 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { backgroundColor: '#2C3E50', paddingVertical: 12, alignItems: 'center', marginBottom: 10, borderRadius: 5 },
  secondaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  forgotText: { textAlign: 'center', fontSize: 12, fontWeight: 'bold', marginTop: 5 },

  // --- Home Screen ---
  homeContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 50 },
  sosButton: { backgroundColor: '#D32F2F', width: 220, height: 220, borderRadius: 110, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
  sosText: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginBottom: 10 },
  directoryRow: { flexDirection: 'row', gap: 15, paddingHorizontal: 20 },
  dirBtn: { flex: 1, height: 140, borderRadius: 15, alignItems: 'center', justifyContent: 'center', padding: 10 },
  iconCircle: { width: 60, height: 60, backgroundColor: '#fff', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  dirBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // --- Profile Screen ---
  profileContent: { flex: 1, alignItems: 'center', paddingTop: 40 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2C3E50', marginBottom: 15 },
  profileName: { fontSize: 24, color: '#2C3E50', fontWeight: 'bold' },
  profileEmail: { fontSize: 14, color: '#888', marginBottom: 40 },
  profileMenu: { width: '80%', gap: 20 },
  profileBtn: { backgroundColor: '#FF9800', flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, gap: 15 },
  profileBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // --- Contacts Screen ---
  contactsContent: { flex: 1, padding: 20 },
  contactCard: { backgroundColor: '#FF9800', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 15 },
  contactInfo: { flex: 1, marginLeft: 15 },
  contactName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  contactPhone: { color: '#fff', fontSize: 12 },
  addContactText: { color: '#4CAF50', fontWeight: 'bold', textAlign: 'center', fontSize: 16, marginTop: 10 }
});