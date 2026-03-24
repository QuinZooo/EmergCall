import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Header from '../components/Header.jsx';
import styles from '../styles/commonStyles';

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Header transparent={true} />
        <View style={[styles.formContainer, { 
          width: '100%', 
          maxWidth: 400, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 20, 
          paddingVertical: 40, 
          paddingHorizontal: 25,
          marginTop: 20,
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 12,
          borderWidth: 1,
          borderColor: '#e8e8e8'
        }]}>
          <Text style={[styles.label, { 
            textAlign: 'center', 
            fontSize: 28, 
            fontWeight: '700', 
            marginBottom: 32, 
            color: '#2C3E50',
            letterSpacing: 0.5
          }]}>Welcome Back</Text>

          <Text style={[styles.label, { marginBottom: 8 }]}>Email</Text>
          <TextInput 
            style={[styles.input, { 
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#ddd',
              paddingLeft: 16
            }]} 
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginBottom: 8, marginTop: 16 }]}>Password</Text>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 24,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8
          }}>
            <TextInput 
              style={{ 
                flex: 1, 
                height: 48,
                paddingLeft: 16,
                fontSize: 16
              }} 
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={{ paddingHorizontal: 12, height: 48, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 22, color: '#666' }}>{showPassword ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.primaryButton, { marginBottom: 12 }]} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryButtonText}>LOGIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.secondaryButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ marginTop: 20, paddingVertical: 8 }}>
            <Text style={[styles.forgotText, { color: '#FF9800', fontSize: 14, fontWeight: '600' }]}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
