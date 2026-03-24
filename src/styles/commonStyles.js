import { StyleSheet } from 'react-native';

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

export default styles;
