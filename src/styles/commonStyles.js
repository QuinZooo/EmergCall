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
  formCardContainer: { width: '100%', maxWidth: 400, backgroundColor: '#f8f9fa', borderRadius: 20, paddingVertical: 40, paddingHorizontal: 25, marginTop: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, borderWidth: 1, borderColor: '#e8e8e8' },
  formTitle: { textAlign: 'center', fontSize: 28, fontWeight: '700', marginBottom: 32, color: '#2C3E50', letterSpacing: 0.5 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', height: 45, marginBottom: 20, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  inputWithIcon: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  inputField: { flex: 1, height: 48, paddingLeft: 16, fontSize: 16 },
  eyeIconButton: { paddingHorizontal: 12, height: 48, justifyContent: 'center' },
  eyeIcon: { fontSize: 22, color: '#666' },
  rememberContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  checkboxBox: { width: 15, height: 15, backgroundColor: '#ccc', marginRight: 10 },
  rememberText: { fontSize: 12, fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#FF9800', paddingVertical: 12, alignItems: 'center', marginBottom: 12, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { backgroundColor: '#2C3E50', paddingVertical: 12, alignItems: 'center', marginBottom: 10, borderRadius: 8 },
  secondaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  forgotText: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginTop: 20, color: '#FF9800' },

  // --- Home Screen ---
  homeBackdropTop: { position: 'absolute', top: -120, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: '#E9F0FF' },
  homeBackdropBottom: { position: 'absolute', bottom: 90, left: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: '#FFF1E2' },
  homeScrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  homeHero: { marginTop: 10, marginBottom: 20 },
  homeEyebrow: { color: '#E67E22', fontWeight: '700', fontSize: 13, letterSpacing: 1 },
  homeTitle: { color: '#1F2D3D', fontSize: 34, fontWeight: '900', marginTop: 6 },
  homeSubtitle: { color: '#5F6E7A', fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: '90%' },
  sosCircleButton: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#D64545', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 24, elevation: 8, shadowColor: '#8E1A1A', shadowOpacity: 0.3, shadowRadius: 12 },
  sosCircleTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 8 },
  sosCircleHint: { color: '#FFE5E5', fontSize: 12, marginTop: 8 },
  quickLabel: { color: '#1F2D3D', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  directoryGrid: { flexDirection: 'row', gap: 12 },
  dirCard: { flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center' },
  policeCard: { backgroundColor: '#2C3E50' },
  fireCard: { backgroundColor: '#E36A20' },
  medicCard: { backgroundColor: '#2AAFC2' },
  dirIconBubble: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  dirCardTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  dirCardMeta: { color: '#F3F6F8', fontSize: 11, marginTop: 4 },

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
