import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header.jsx';
import BottomNavBar from '../components/BottomNavBar.jsx';
import { supabase } from '../lib/supabase.js';
import styles from '../styles/commonStyles';

const PROFILE_BUCKET = 'profile';
const MASTER_ADMIN_EMAIL = 'qcdmrendon@tip.edu.ph';

const resolveAvatarUrl = async (avatarPath = '', fallbackUrl = '') => {
  if (avatarPath) {
    const { data, error } = await supabase.storage.from(PROFILE_BUCKET).createSignedUrl(avatarPath, 60 * 60 * 24 * 7);
    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }

    const { data: publicData } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(avatarPath);
    if (publicData?.publicUrl) {
      return publicData.publicUrl;
    }
  }

  return fallbackUrl || '';
};

const isMasterAdminAccount = (email = '') => email.trim().toLowerCase() === MASTER_ADMIN_EMAIL;

export default function AdminUsersPage({ navigation }) {
  const [users, setUsers] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingName, setEditingName] = React.useState('');
  const [editingPhone, setEditingPhone] = React.useState('');
  const [editingRole, setEditingRole] = React.useState('user');
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Create user state
  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [newUserRole, setNewUserRole] = React.useState('user');
  const [creating, setCreating] = React.useState(false);

  const ensureAdmin = React.useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigation.replace('Login');
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      navigation.replace('Home');
      return false;
    }

    return true;
  }, [navigation]);

  const loadUsers = React.useCallback(async () => {
    try {
      const allowed = await ensureAdmin();
      if (!allowed) {
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, avatar_url, avatar_path, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const hydrated = await Promise.all(
        (data || []).map(async (item) => ({
          ...item,
          resolved_avatar_url: await resolveAvatarUrl(item.avatar_path, item.avatar_url),
        }))
      );

      setUsers(hydrated);
    } catch (err) {
      Alert.alert('Load Error', err?.message || 'Unable to load users.');
    }
  }, [ensureAdmin]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setEditingName(user.full_name || '');
    setEditingPhone(user.phone || '');
    setEditingRole(user.role || 'user');
    setModalVisible(true);
  };

  const closeUserModal = () => {
    if (saving || deleting) {
      return;
    }

    setModalVisible(false);
    setSelectedUser(null);
    setEditingName('');
    setEditingPhone('');
    setEditingRole('user');
  };

  const saveUserChanges = async () => {
    if (!selectedUser || saving) {
      return;
    }

    const trimmedName = editingName.trim();
    if (!trimmedName) {
      Alert.alert('Invalid Name', 'Please enter a full name.');
      return;
    }

    if (isMasterAdminAccount(selectedUser.email) && editingRole !== 'admin') {
      Alert.alert('Protected Account', 'The master admin account cannot be changed to user.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
          phone: editingPhone.trim() || null,
          role: editingRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedUser.id);

      if (error) {
        throw error;
      }

      await loadUsers();
      closeUserModal();
      Alert.alert('Saved', 'User profile was updated.');
    } catch (err) {
      Alert.alert('Update Error', err?.message || 'Unable to update this user.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteUser = () => {
    if (!selectedUser) {
      return;
    }

    if (isMasterAdminAccount(selectedUser.email)) {
      Alert.alert('Protected Account', 'The master admin account cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete User',
      `Delete ${selectedUser.full_name || selectedUser.email || 'this user'}? This should remove the auth account and profile.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteUserAccount,
        },
      ]
    );
  };

  const deleteUserAccount = async () => {
    if (!selectedUser || deleting) {
      return;
    }

    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: {
          userId: selectedUser.id,
          shouldSoftDelete: false,
        },
      });

      if (error) {
        throw error;
      }

      await loadUsers();
      closeUserModal();
      Alert.alert('Deleted', 'User account was deleted.');
    } catch (err) {
      Alert.alert('Delete Error', err?.message || 'Unable to delete this user.');
    } finally {
      setDeleting(false);
    }
  };

  const openCreateModal = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewPhone('');
    setNewUserRole('user');
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setCreateModalVisible(false);
  };

  const createUser = async () => {
    if (creating) return;
    const trimmedEmail = newEmail.trim();
    const trimmedName = newName.trim();
    const trimmedPassword = newPassword.trim();

    if (!trimmedName) {
      Alert.alert('Invalid Input', 'Please enter a full name.');
      return;
    }
    if (!trimmedEmail) {
      Alert.alert('Invalid Input', 'Please enter an email address.');
      return;
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      Alert.alert('Invalid Input', 'Password must be at least 6 characters.');
      return;
    }

    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: {
          email: trimmedEmail,
          password: trimmedPassword,
          fullName: trimmedName,
          phone: newPhone.trim() || null,
          role: newUserRole,
        },
      });

      if (error) throw error;
      if (data?.success === false) throw new Error(data.error || 'Unable to create user.');

      await loadUsers();
      closeCreateModal();
      Alert.alert('Created', `Account for ${trimmedName} was created successfully.`);
    } catch (err) {
      Alert.alert('Create Error', err?.message || 'Unable to create user.');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((item) => {
    const haystack = [item.full_name, item.email, item.phone, item.role]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search.toLowerCase());
  });

  const selectedIsMasterAdmin = isMasterAdminAccount(selectedUser?.email || '');

  return (
    <View style={styles.mainContainer}>
      <View style={styles.adminBackdropTop} />
      <View style={styles.adminBackdropBottom} />
      <Header transparent={true} />

      <ScrollView
        contentContainerStyle={styles.adminScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={styles.adminTitle}>Users</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#2C3E50', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
            onPress={openCreateModal}
          >
            <Ionicons name="person-add-outline" size={15} color="#fff" style={{ marginRight: 6 }} />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add User</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.adminSubtitle}>Manage user roles and account details.</Text>

        <TextInput
          style={styles.adminSearchInput}
          placeholder="Search by name, email, phone, role..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#8A98A6"
        />

        {filteredUsers.map((item) => {
          const isAdmin = item.role === 'admin';
          const isMasterAdmin = isMasterAdminAccount(item.email);

          return (
            <TouchableOpacity key={item.id} style={styles.adminListCard} activeOpacity={0.92} onPress={() => openUserModal(item)}>
              <View style={styles.adminListHeaderRow}>
                <Text style={styles.adminListTitle}>{item.full_name || 'Unnamed user'}</Text>
                <View style={[styles.adminRoleBadge, isAdmin ? styles.adminRoleAdmin : styles.adminRoleUser]}>
                  <Text style={[styles.adminBadgeText, isAdmin ? styles.adminRoleAdminText : styles.adminRoleUserText]}>
                    {item.role || 'user'}
                  </Text>
                </View>
              </View>

              <Text style={styles.adminListMeta}>{item.email || 'No email'}</Text>
              <Text style={styles.adminListMeta}>{item.phone || 'No phone number'}</Text>
              <Text style={styles.adminListMeta}>Joined {new Date(item.created_at).toLocaleDateString()}</Text>
              {isMasterAdmin ? (
                <Text style={[styles.adminListMeta, { marginTop: 8, color: '#C68A17', fontWeight: '700' }]}>Master admin account</Text>
              ) : null}
              <Text style={[styles.adminListMeta, { marginTop: 8, color: '#2C3E50', fontWeight: '700' }]}>Tap to view or edit</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={createModalVisible} transparent={true} animationType="fade" onRequestClose={closeCreateModal}>
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>Create User</Text>

            <Text style={styles.profileModalLabel}>Full Name *</Text>
            <TextInput
              style={styles.profileModalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter full name"
              placeholderTextColor="#9AA7B4"
            />

            <Text style={styles.profileModalLabel}>Email *</Text>
            <TextInput
              style={styles.profileModalInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter email address"
              placeholderTextColor="#9AA7B4"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.profileModalLabel}>Password * (min 6 chars)</Text>
            <TextInput
              style={styles.profileModalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter password"
              placeholderTextColor="#9AA7B4"
              secureTextEntry
            />

            <Text style={styles.profileModalLabel}>Phone</Text>
            <TextInput
              style={styles.profileModalInput}
              value={newPhone}
              onChangeText={setNewPhone}
              placeholder="Enter phone number (optional)"
              placeholderTextColor="#9AA7B4"
              keyboardType="phone-pad"
            />

            <Text style={styles.profileModalLabel}>Role</Text>
            <View style={styles.adminInlineActions}>
              <TouchableOpacity
                style={newUserRole === 'user' ? styles.adminSmallButton : styles.adminSmallOutlineButton}
                onPress={() => setNewUserRole('user')}
              >
                <Text style={newUserRole === 'user' ? styles.adminSmallButtonText : styles.adminSmallOutlineButtonText}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={newUserRole === 'admin' ? styles.adminSmallButton : styles.adminSmallOutlineButton}
                onPress={() => setNewUserRole('admin')}
              >
                <Text style={newUserRole === 'admin' ? styles.adminSmallButtonText : styles.adminSmallOutlineButtonText}>Admin</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.profileModalActions, { justifyContent: 'flex-end', marginTop: 20 }]}>
              <TouchableOpacity style={[styles.profileModalCancelBtn, { marginRight: 10 }]} onPress={closeCreateModal} disabled={creating}>
                <Text style={styles.profileModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileModalSaveBtn} onPress={createUser} disabled={creating}>
                <Text style={styles.profileModalSaveText}>{creating ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeUserModal}>
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>User Account</Text>

            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.avatarPlaceholder}>
                {selectedUser?.resolved_avatar_url ? (
                  <Image source={{ uri: selectedUser.resolved_avatar_url }} style={styles.profileAvatarImage} resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={40} color="#2C3E50" />
                )}
              </View>
            </View>

            <Text style={styles.profileModalLabel}>Full Name</Text>
            <TextInput
              style={styles.profileModalInput}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Enter full name"
              placeholderTextColor="#9AA7B4"
            />

            <Text style={styles.profileModalLabel}>Email</Text>
            <TextInput
              style={styles.profileModalInput}
              value={selectedUser?.email || ''}
              editable={false}
              placeholder="No email"
              placeholderTextColor="#9AA7B4"
            />

            <Text style={styles.profileModalLabel}>Phone</Text>
            <TextInput
              style={styles.profileModalInput}
              value={editingPhone}
              onChangeText={setEditingPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#9AA7B4"
              keyboardType="phone-pad"
            />

            <Text style={styles.profileModalLabel}>Role</Text>
            <View style={styles.adminInlineActions}>
              <TouchableOpacity
                style={editingRole === 'user' ? styles.adminSmallButton : styles.adminSmallOutlineButton}
                onPress={() => !selectedIsMasterAdmin && setEditingRole('user')}
                disabled={selectedIsMasterAdmin}
              >
                <Text style={editingRole === 'user' ? styles.adminSmallButtonText : styles.adminSmallOutlineButtonText}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={editingRole === 'admin' ? styles.adminSmallButton : styles.adminSmallOutlineButton}
                onPress={() => setEditingRole('admin')}
              >
                <Text style={editingRole === 'admin' ? styles.adminSmallButtonText : styles.adminSmallOutlineButtonText}>Admin</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.profileModalHelperText}>
              {selectedIsMasterAdmin
                ? 'This is the master admin account. It can stay admin only and cannot be deleted.'
                : 'Email is shown for review. Actual auth email changes should be done through a secure server-side admin flow.'}
            </Text>

            <View style={[styles.profileModalActions, { justifyContent: 'space-between', marginTop: 20 }]}> 
              <TouchableOpacity
                style={[
                  styles.profileModalCancelBtn,
                  { borderColor: '#F2D0D0', backgroundColor: selectedIsMasterAdmin ? '#F7F7F7' : '#FFF5F5' },
                ]}
                onPress={confirmDeleteUser}
                disabled={deleting || selectedIsMasterAdmin}
              >
                <Text style={[styles.profileModalCancelText, { color: selectedIsMasterAdmin ? '#9AA7B4' : '#C84444' }]}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={[styles.profileModalCancelBtn, { marginRight: 10 }]} onPress={closeUserModal} disabled={saving || deleting}>
                  <Text style={styles.profileModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileModalSaveBtn} onPress={saveUserChanges} disabled={saving || deleting}>
                  <Text style={styles.profileModalSaveText}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} variant="admin" />
    </View>
  );
}
