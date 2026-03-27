import * as React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import styles from '../styles/commonStyles';

export default function GPSScreen({ navigation }) {
  const [location, setLocation] = React.useState(null);
  const [address, setAddress] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Location permission denied.');
        setLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });

      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (geo) {
          const parts = [geo.street, geo.city, geo.region, geo.country].filter(Boolean);
          setAddress(parts.join(', '));
        }
      } catch {
        setAddress(null);
      }
    } catch (err) {
      setError('Unable to fetch location.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLocation();
  }, []);

  const openInMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  const shareLocation = () => {
    if (!location) return;
    const msg = `My current location: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    const smsUrl = `sms:?body=${encodeURIComponent(msg)}`;
    Linking.openURL(smsUrl);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contactsBackdropTop} />
      <View style={styles.contactsBackdropBottom} />
      <Header transparent={true} />

      <View style={styles.gpsContainer}>
        <Text style={styles.contactsTitle}>GPS Location</Text>
        <Text style={styles.contactsSubtitle}>View and share your current position.</Text>

        <View style={styles.gpsCard}>
          {loading ? (
            <View style={[styles.gpsCenterContent, { paddingHorizontal: 20 }]}>
              <ActivityIndicator size="large" color="#FF9800" />
              <Text style={styles.gpsLoadingText}>Getting your location...</Text>
            </View>
          ) : error ? (
            <View style={[styles.gpsCenterContent, { paddingHorizontal: 20 }]}>
              <Ionicons name="warning" size={48} color="#D64545" />
              <Text style={styles.gpsErrorText}>{error}</Text>
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 16 }]} onPress={fetchLocation}>
                <Text style={styles.primaryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <MapView
                style={styles.mapContainer}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }}
              >
                <Marker
                  coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                  title="You are here"
                  pinColor="#FF9800"
                />
              </MapView>

              {address && <Text style={styles.gpsAddress}>{address}</Text>}

              <View style={styles.gpsActions}>
                <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={openInMaps}>
                  <Text style={styles.primaryButtonText}>Open in Maps</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={shareLocation}>
                  <Text style={styles.secondaryButtonText}>Share Location</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.gpsRefreshBtn, { paddingHorizontal: 20 }]} onPress={fetchLocation}>
                <Ionicons name="refresh" size={18} color="#2C3E50" />
                <Text style={styles.gpsRefreshText}>Refresh Location</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
