import { supabase } from './supabase.js';

const isMfaUnavailableError = (message = '') => {
  const value = message.toLowerCase();
  return value.includes('mfa') && (value.includes('not enabled') || value.includes('unsupported') || value.includes('factor'));
};

export const resolvePostLoginRoute = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return 'Login';
  }

  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

  if (factorsError) {
    if (isMfaUnavailableError(factorsError.message || '')) {
      // Keep app usable if MFA is not enabled in project settings yet.
      return 'Home';
    }
    throw factorsError;
  }

  const hasVerifiedTotp = (factorsData?.totp || []).some((factor) => factor.status === 'verified');
  if (!hasVerifiedTotp) {
    return 'MfaSetup';
  }

  const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalError) {
    return 'MfaVerify';
  }

  return aalData?.currentLevel === 'aal2' ? 'Home' : 'MfaVerify';
};
