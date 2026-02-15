/**
 * Background Check Integration
 * 
 * Connects to MohnMatrix background check API for employment screening.
 * Professional tier businesses can run instant background checks on applicants.
 */

export interface BackgroundCheckRequest {
  firstName: string;
  lastName: string;
  state: string;
  dob?: string;
  ssn?: string; // Optional, never stored, only passed to API
  purpose: 'employment_screening' | 'volunteer_screening';
}

export interface BackgroundCheckResult {
  success: boolean;
  recordCount: number;
  recordsFound: boolean;
  summary: {
    criminalRecords: number;
    trafficViolations: number;
    civilRecords: number;
    warrants: number;
  };
  risk: 'clear' | 'review' | 'high_risk';
  details?: any;
  provider: string;
  reference: string;
  checkedAt: string;
  expiresAt: string;
}

/**
 * Run a background check via MohnMatrix API
 */
export async function runBackgroundCheck(
  request: BackgroundCheckRequest
): Promise<BackgroundCheckResult> {
  const endpoint = process.env.NEXT_PUBLIC_MOHNMATRIX_SEARCH_API_URL || 'https://mohnmatrix.com/api/search';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Source': 'MohnMenu-HR',
    },
    body: JSON.stringify({
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),
      state: request.state,
      dob: request.dob,
      purpose: request.purpose,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'Background check failed');
  }

  const data = await response.json();
  const records = data.results || [];

  // Calculate risk based on records found
  let risk: 'clear' | 'review' | 'high_risk' = 'clear';
  const criminalCount = records.filter((r: any) => r.type === 'criminal').length;
  const warrantCount = records.filter((r: any) => r.type === 'warrant').length;

  if (warrantCount > 0 || criminalCount > 2) {
    risk = 'high_risk';
  } else if (criminalCount > 0 || records.length > 3) {
    risk = 'review';
  }

  const now = new Date();
  const expires = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  return {
    success: true,
    recordCount: records.length,
    recordsFound: records.length > 0,
    summary: {
      criminalRecords: records.filter((r: any) => r.type === 'criminal').length,
      trafficViolations: records.filter((r: any) => r.type === 'traffic').length,
      civilRecords: records.filter((r: any) => r.type === 'civil').length,
      warrants: records.filter((r: any) => r.type === 'warrant').length,
    },
    risk,
    details: data,
    provider: 'MohnMatrix',
    reference: data.searchId || `MCH-${Date.now()}`,
    checkedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

/**
 * Verify an ID document matches application data
 */
export function verifyIDMatch(
  idData: { name: string; address?: string; dob?: string },
  appData: { fullName: string; address?: string; dob?: string }
): { matched: boolean; confidence: number; issues: string[] } {
  const issues: string[] = [];
  let matchPoints = 0;
  let totalPoints = 0;

  // Name matching (most important)
  totalPoints += 3;
  const idNameNorm = idData.name.toLowerCase().replace(/[^a-z]/g, '');
  const appNameNorm = appData.fullName.toLowerCase().replace(/[^a-z]/g, '');
  if (idNameNorm === appNameNorm) {
    matchPoints += 3;
  } else if (idNameNorm.includes(appNameNorm) || appNameNorm.includes(idNameNorm)) {
    matchPoints += 2;
    issues.push('Name partially matches');
  } else {
    issues.push('Name does not match');
  }

  // Address matching (if available)
  if (idData.address && appData.address) {
    totalPoints += 2;
    const idAddrNorm = idData.address.toLowerCase().replace(/[^a-z0-9]/g, '');
    const appAddrNorm = appData.address.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (idAddrNorm.includes(appAddrNorm) || appAddrNorm.includes(idAddrNorm)) {
      matchPoints += 2;
    } else {
      matchPoints += 1;
      issues.push('Address does not match');
    }
  }

  // DOB matching (if available)
  if (idData.dob && appData.dob) {
    totalPoints += 2;
    if (idData.dob === appData.dob) {
      matchPoints += 2;
    } else {
      issues.push('Date of birth does not match');
    }
  }

  const confidence = totalPoints > 0 ? Math.round((matchPoints / totalPoints) * 100) : 0;
  const matched = confidence >= 70;

  return { matched, confidence, issues };
}
