import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

const PROFILE_BUCKET = 'profile';

const resolveProfilePhoto = (metadata = {}) => {
  const avatarUrl = metadata.avatar_url || metadata.profile_photo || '';
  const avatarPath = metadata.avatar_path || '';

  if (avatarUrl) {
    return avatarUrl;
  }

  if (!avatarPath) {
    return '';
  }

  const { data } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(avatarPath);
  return data?.publicUrl || '';
};

const resolveProfilePhotoFromPath = (avatarPath = '') => {
  if (!avatarPath) {
    return '';
  }

  const { data } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(avatarPath);
  return data?.publicUrl || '';
};

const resolveSignedProfilePhotoFromPath = async (avatarPath = '') => {
  if (!avatarPath) {
    return '';
  }

  const { data, error } = await supabase.storage.from(PROFILE_BUCKET).createSignedUrl(avatarPath, 60 * 60 * 24 * 7);
  if (error) {
    return '';
  }

  return data?.signedUrl || '';
};

export default function ProfileScreen({ navigation }) {
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [userId, setUserId] = React.useState('');
  const [username, setUsername] = React.useState('Name');
  const [tempUsername, setTempUsername] = React.useState('Name');
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState('');
  const [profilePhotoPath, setProfilePhotoPath] = React.useState('');
  const [selectedImageUri, setSelectedImageUri] = React.useState('');
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    const loadProfileFromAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        Alert.alert('Profile Error', error.message || 'Unable to load your profile.');
        return;
      }

      const user = data?.user;
      if (!user) {
        return;
      }

      setUserId(user.id || '');
      const metadata = user.user_metadata || {};
      const accountDisplayName = metadata.display_name || metadata.full_name || metadata.username || user.email || 'Name';
      const accountPhotoPath = metadata.avatar_path || '';
      const signedPhotoUrl = await resolveSignedProfilePhotoFromPath(accountPhotoPath);
      const accountPhoto = signedPhotoUrl || resolveProfilePhotoFromPath(accountPhotoPath) || resolveProfilePhoto(metadata);

      setUsername(accountDisplayName);
      setTempUsername(accountDisplayName);
      setProfilePhotoUrl(accountPhoto);
      setProfilePhotoPath(accountPhotoPath);
      setImageLoadFailed(false);
      setEmail(user.email || '');
    };

    loadProfileFromAuth();
  }, []);

  const openEditModal = () => {
    setTempUsername(username);
    setSelectedImageUri('');
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
  };

  const handleSelectImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Please allow photo library permission to select a profile image.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setSelectedImageUri(result.assets[0].uri);
    } catch (err) {
      Alert.alert('Image Error', err?.message || 'Unable to select image right now.');
    }
  };

  const uploadProfileImage = async (localUri) => {
    if (!localUri || !userId) {
      return { publicUrl: profilePhotoUrl, path: profilePhotoPath };
    }

    const uriWithoutQuery = localUri.split('?')[0];
    const extension = (uriWithoutQuery.split('.').pop() || 'jpg').toLowerCase();
    const normalizedExtension = ['png', 'webp', 'jpeg', 'jpg'].includes(extension) ? extension : 'jpg';
    const filePath = `${userId}/avatar-${Date.now()}.${normalizedExtension}`;

    const response = await fetch(localUri);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = normalizedExtension === 'png' ? 'image/png' : normalizedExtension === 'webp' ? 'image/webp' : 'image/jpeg';

    const { error: uploadError } = await supabase.storage.from(PROFILE_BUCKET).upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(filePath);
    return {
      publicUrl: data?.publicUrl || '',
      path: filePath,
    };
  };

  const handleSaveProfileChanges = async () => {
    if (savingProfile) {
      return;
    }

    const sanitizedUsername = tempUsername.trim();

    if (!sanitizedUsername) {
      Alert.alert('Invalid Username', 'Please enter a username before saving.');
      return;
    }

    if (!userId) {
      Alert.alert('Update Failed', 'Unable to identify the current user. Please login again.');
      return;
    }

    setSavingProfile(true);
    try {
      const previousPhotoPath = profilePhotoPath;
      const uploadedImage = await uploadProfileImage(selectedImageUri);

      const { data, error } = await supabase.auth.updateUser({
        data: {
          display_name: sanitizedUsername,
          full_name: sanitizedUsername,
          avatar_url: uploadedImage.publicUrl,
          profile_photo: uploadedImage.publicUrl,
          avatar_path: uploadedImage.path,
        },
      });

      if (error) {
        Alert.alert('Update Failed', error.message || 'Unable to update your profile.');
        return;
      }

      const updatedMetadata = data?.user?.user_metadata || {};
      const updatedName = updatedMetadata.display_name || updatedMetadata.full_name || sanitizedUsername;
      const updatedPath = updatedMetadata.avatar_path || uploadedImage.path || profilePhotoPath;
      const signedPhotoUrl = await resolveSignedProfilePhotoFromPath(updatedPath);
      const updatedPhoto = signedPhotoUrl || resolveProfilePhotoFromPath(updatedPath) || uploadedImage.publicUrl || selectedImageUri || resolveProfilePhoto(updatedMetadata);

      setUsername(updatedName);
      setProfilePhotoUrl(updatedPhoto);
      setProfilePhotoPath(updatedPath);
      setImageLoadFailed(false);
      setSelectedImageUri('');

      if (selectedImageUri && previousPhotoPath && previousPhotoPath !== updatedPath) {
        const { error: deleteError } = await supabase.storage.from(PROFILE_BUCKET).remove([previousPhotoPath]);
        if (deleteError) {
          // Keep profile update successful even if old file cleanup fails.
          console.warn('Old avatar cleanup failed:', deleteError.message);
        }
      }

      closeEditModal();
      Alert.alert('Profile Updated', 'Your account display name was updated successfully.');
    } catch (err) {
      Alert.alert('Update Failed', err?.message || 'Unable to update your profile.');
    } finally {
      setSavingProfile(false);
    }
  };
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.warn('Failed to fetch user', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert('Logout Failed', error.message || 'Unable to logout right now.');
        return;
      }

      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Logout Failed', err?.message || 'Unable to logout right now.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.profileBackdropTop} />
      <View style={styles.profileBackdropBottom} />
      <Header transparent={true} />

      <ScrollView contentContainerStyle={styles.profileScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.profileTitle}>My Profile</Text>
        <Text style={styles.profileSubtitle}>Manage your account and emergency settings.</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            {profilePhotoUrl && !imageLoadFailed ? (
              <Image
                source={{ uri: profilePhotoUrl }}
                style={styles.profileAvatarImage}
                onError={() => setImageLoadFailed(true)}
              />
            ) : (
              <Ionicons name="person" size={42} color="#2C3E50" />
            )}
          </View>
          <Text style={styles.profileName}>{user?.user_metadata?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'example@gmail.com'}</Text>
          <TouchableOpacity style={styles.profileEditChip}>
            <Text style={styles.profileEditChipText}>Update Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileMenu}>
          <TouchableOpacity style={styles.profileActionRow} onPress={openEditModal}>
            <View style={styles.profileIconWrap}>
              <Ionicons name="person" size={18} color="#2C3E50" />
            </View>
            <Text style={styles.profileActionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileActionRow} onPress={() => navigation.navigate('MedicalInfo')}>
            <View style={styles.profileIconWrap}>
              <MaterialCommunityIcons name="medical-bag" size={18} color="#2C3E50" />
            </View>
            <Text style={styles.profileActionText}>Set Medical Information</Text>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileActionRow} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.profileIconWrap}>
              <Ionicons name="settings" size={18} color="#2C3E50" />
            </View>
            <Text style={styles.profileActionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#8A96A3" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.profileLogoutBtn} onPress={handleLogout} disabled={loggingOut}>
          <View style={styles.profileLogoutIconWrap}>
            <Ionicons name="log-out-outline" size={18} color="#C84444" />
          </View>
          <Text style={styles.profileLogoutText}>{loggingOut ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isEditModalVisible} transparent={true} animationType="fade" onRequestClose={closeEditModal}>
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>Edit Profile</Text>

            <Text style={styles.profileModalLabel}>Change Username</Text>
            <TextInput
              value={tempUsername}
              onChangeText={setTempUsername}
              placeholder="Enter username"
              placeholderTextColor="#8A96A3"
              style={styles.profileModalInput}
            />

            <Text style={styles.profileModalLabel}>Change Profile Photo</Text>
            <TouchableOpacity style={styles.profileImagePickerBtn} onPress={handleSelectImage} disabled={savingProfile}>
              <Text style={styles.profileImagePickerBtnText}>Select Image</Text>
            </TouchableOpacity>
            {selectedImageUri ? (
              <Image source={{ uri: selectedImageUri }} style={styles.profileModalImagePreview} />
            ) : null}
            <Text style={styles.profileModalHelperText}>
              {selectedImageUri ? 'Image selected and ready to upload.' : 'No new image selected.'}
            </Text>

            <View style={styles.profileModalActions}>
              <TouchableOpacity style={styles.profileModalCancelBtn} onPress={closeEditModal} disabled={savingProfile}>
                <Text style={styles.profileModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileModalSaveBtn, savingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfileChanges}
                disabled={savingProfile}
              >
                <Text style={styles.profileModalSaveText}>{savingProfile ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}
