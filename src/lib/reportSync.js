import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase.js';

const LOCAL_REPORTS_KEY_PREFIX = 'incidentReports:';
const SYNC_QUEUE_KEY = 'pendingReportSyncQueue';
const REPORT_PHOTOS_BUCKET = 'report-photos';

const readJson = async (key, fallbackValue) => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallbackValue;
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    return fallbackValue;
  }
};

const writeJson = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getFriendlySyncError = (err) => {
  const raw = err?.message || 'Sync failed';
  const lower = raw.toLowerCase();

  if (lower.includes('row-level security policy') && lower.includes('table "profiles"')) {
    return 'Profile permission issue. Ask admin to allow profile creation/select for your user.';
  }

  if (lower.includes('reports_user_id_fkey')) {
    return 'Profile record missing for this account. Ask admin to backfill profiles.';
  }

  if (lower.includes('reports_status_check')) {
    return 'Report status is invalid for current database rules.';
  }

  return raw;
};

const logAudit = async ({ actorId, action, targetTable, targetId, details }) => {
  if (!actorId) {
    return;
  }

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    details,
  });

  if (error) {
    console.warn('Audit log failed:', error.message);
  }
};

const uploadPhotoAndCreateRecord = async ({ reportId, userId, localUri, index }) => {
  const uriWithoutQuery = localUri.split('?')[0];
  const extension = (uriWithoutQuery.split('.').pop() || 'jpg').toLowerCase();
  const normalizedExt = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
  const contentType = normalizedExt === 'png' ? 'image/png' : normalizedExt === 'webp' ? 'image/webp' : 'image/jpeg';
  const filePath = `${userId}/${reportId}/photo-${Date.now()}-${index}.${normalizedExt}`;

  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(REPORT_PHOTOS_BUCKET).upload(filePath, arrayBuffer, {
    contentType,
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(REPORT_PHOTOS_BUCKET).getPublicUrl(filePath);

  const { error: photoRowError } = await supabase.from('report_photos').insert({
    report_id: reportId,
    user_id: userId,
    file_path: filePath,
    file_url: data?.publicUrl || '',
  });

  if (photoRowError) {
    throw photoRowError;
  }
};

export const getReportsStorageKey = (userId) => `${LOCAL_REPORTS_KEY_PREFIX}${userId || 'anonymous'}`;

export const getLocalReports = async (userId) => readJson(getReportsStorageKey(userId), []);

export const saveLocalReports = async (userId, reports) => {
  await writeJson(getReportsStorageKey(userId), reports);
};

export const appendLocalReport = async (userId, report) => {
  const reports = await getLocalReports(userId);
  const nextReports = [report, ...reports];
  await saveLocalReports(userId, nextReports);
  return nextReports;
};

export const patchLocalReportById = async (userId, localId, patch) => {
  const reports = await getLocalReports(userId);
  const updated = reports.map((report) => {
    if (report.local_id !== localId) {
      return report;
    }

    return {
      ...report,
      ...patch,
    };
  });

  await saveLocalReports(userId, updated);
  return updated;
};

const getQueue = async () => readJson(SYNC_QUEUE_KEY, []);

const saveQueue = async (queue) => {
  await writeJson(SYNC_QUEUE_KEY, queue);
};

const ensureProfileForUser = async (userId) => {
  if (!userId) {
    return;
  }

  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email || '';
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    (email ? email.split('@')[0] : '') ||
    'User';

  const payload = {
    id: userId,
    full_name: fullName,
    email,
  };

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (upsertError) {
    throw upsertError;
  }
};

export const enqueueReportForSync = async ({ userId, localId, errorMessage = '' }) => {
  const queue = await getQueue();
  const existing = queue.find((item) => item.user_id === userId && item.local_id === localId);

  if (existing) {
    const updated = queue.map((item) => {
      if (item.user_id !== userId || item.local_id !== localId) {
        return item;
      }

      return {
        ...item,
        updated_at: new Date().toISOString(),
        last_error: errorMessage || item.last_error || '',
      };
    });
    await saveQueue(updated);
    return;
  }

  queue.push({
    user_id: userId,
    local_id: localId,
    retry_count: 0,
    last_error: errorMessage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  await saveQueue(queue);
};

export const syncLocalReportToCloud = async ({ userId, report }) => {
  const insertPayload = {
    user_id: userId,
    incident_type: report.incident_type,
    description: report.description,
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null,
    priority: report.priority || 'normal',
  };

  let createdReport;
  let reportError;

  ({ data: createdReport, error: reportError } = await supabase
    .from('reports')
    .insert(insertPayload)
    .select('id')
    .single());

  if (reportError && (reportError.message || '').includes('reports_user_id_fkey')) {
    await ensureProfileForUser(userId);

    ({ data: createdReport, error: reportError } = await supabase
      .from('reports')
      .insert(insertPayload)
      .select('id')
      .single());
  }

  if (reportError) {
    throw reportError;
  }

  await logAudit({
    actorId: userId,
    action: 'REPORT_CREATED',
    targetTable: 'reports',
    targetId: createdReport.id,
    details: {
      incident_type: report.incident_type,
      has_photos: (report.photo_uris || []).length > 0,
      photo_count: (report.photo_uris || []).length,
      local_id: report.local_id,
      source: report.sync_source || 'app',
    },
  });

  let uploadedCount = 0;
  const photos = report.photo_uris || [];
  for (let i = 0; i < photos.length; i += 1) {
    await uploadPhotoAndCreateRecord({
      reportId: createdReport.id,
      userId,
      localUri: photos[i],
      index: i,
    });
    uploadedCount += 1;
  }

  if (uploadedCount > 0) {
    await logAudit({
      actorId: userId,
      action: 'REPORT_PHOTOS_UPLOADED',
      targetTable: 'report_photos',
      targetId: createdReport.id,
      details: {
        uploaded_count: uploadedCount,
        local_id: report.local_id,
      },
    });
  }

  return createdReport.id;
};

export const retryPendingReportSync = async (userId) => {
  if (!userId) {
    return { syncedCount: 0, failedCount: 0, pendingCount: 0 };
  }

  const queue = await getQueue();
  const userQueue = queue.filter((item) => item.user_id === userId);

  if (!userQueue.length) {
    return { syncedCount: 0, failedCount: 0, pendingCount: 0 };
  }

  let nextQueue = [...queue];
  let syncedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < userQueue.length; i += 1) {
    const queueItem = userQueue[i];
    const reports = await getLocalReports(userId);
    const report = reports.find((item) => item.local_id === queueItem.local_id);

    if (!report) {
      nextQueue = nextQueue.filter((item) => !(item.user_id === userId && item.local_id === queueItem.local_id));
      continue;
    }

    if (report.sync_status === 'synced' && report.cloud_report_id) {
      nextQueue = nextQueue.filter((item) => !(item.user_id === userId && item.local_id === queueItem.local_id));
      continue;
    }

    try {
      const cloudReportId = await syncLocalReportToCloud({ userId, report });
      await patchLocalReportById(userId, queueItem.local_id, {
        sync_status: 'synced',
        cloud_report_id: cloudReportId,
        last_sync_error: '',
        updated_at: new Date().toISOString(),
      });

      nextQueue = nextQueue.filter((item) => !(item.user_id === userId && item.local_id === queueItem.local_id));
      syncedCount += 1;
    } catch (err) {
      const message = getFriendlySyncError(err);
      await patchLocalReportById(userId, queueItem.local_id, {
        sync_status: 'pending_retry',
        last_sync_error: message,
        updated_at: new Date().toISOString(),
      });

      nextQueue = nextQueue.map((item) => {
        if (item.user_id !== userId || item.local_id !== queueItem.local_id) {
          return item;
        }

        return {
          ...item,
          retry_count: (item.retry_count || 0) + 1,
          last_error: message,
          updated_at: new Date().toISOString(),
        };
      });
      failedCount += 1;
    }
  }

  await saveQueue(nextQueue);
  const pendingCount = nextQueue.filter((item) => item.user_id === userId).length;
  return { syncedCount, failedCount, pendingCount };
};
