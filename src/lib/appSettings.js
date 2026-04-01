import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_APP_SETTINGS = {
  shakeToSosEnabled: true,
  includeLocationInSos: true,
  includeMedicalInfoInSos: true,
  sosCountdownSeconds: 5,
  notifyReportStatus: true,
  notifySafetyTips: false,
  autoRetryPendingReports: true,
};

export const getAppSettingsStorageKey = (userId) => `appSettings:${userId || 'anonymous'}`;

const normalizeCountdown = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_APP_SETTINGS.sosCountdownSeconds;
  }

  const rounded = Math.round(value);
  if (rounded < 0) {
    return 0;
  }

  if (rounded > 30) {
    return 30;
  }

  return rounded;
};

export const normalizeAppSettings = (value = {}) => ({
  ...DEFAULT_APP_SETTINGS,
  shakeToSosEnabled: value?.shakeToSosEnabled !== false,
  includeLocationInSos: value?.includeLocationInSos !== false,
  includeMedicalInfoInSos: value?.includeMedicalInfoInSos !== false,
  sosCountdownSeconds: normalizeCountdown(value?.sosCountdownSeconds),
  notifyReportStatus: value?.notifyReportStatus !== false,
  notifySafetyTips: Boolean(value?.notifySafetyTips),
  autoRetryPendingReports: value?.autoRetryPendingReports !== false,
});

export const loadAppSettings = async (userId) => {
  const key = getAppSettingsStorageKey(userId);
  const raw = await AsyncStorage.getItem(key);

  if (!raw) {
    return { ...DEFAULT_APP_SETTINGS };
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeAppSettings(parsed);
  } catch (err) {
    return { ...DEFAULT_APP_SETTINGS };
  }
};

export const saveAppSettings = async (userId, nextSettings) => {
  const key = getAppSettingsStorageKey(userId);
  const normalized = normalizeAppSettings(nextSettings);
  await AsyncStorage.setItem(key, JSON.stringify(normalized));
  return normalized;
};
