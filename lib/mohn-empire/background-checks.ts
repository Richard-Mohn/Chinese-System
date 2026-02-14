export type BackgroundCheckStatus = 'pending' | 'approved' | 'rejected' | 'needs_review';

export interface BackgroundCheckRequest {
  candidateId: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  businessId?: string;
}

export interface BackgroundCheckResult {
  status: BackgroundCheckStatus;
  checkedAt: string;
  providerReference: string;
  notes?: string;
}

function fallbackStatus(seedText: string): BackgroundCheckStatus {
  const seed = seedText
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  if (seed % 11 === 0) return 'rejected';
  if (seed % 5 === 0) return 'needs_review';
  return 'approved';
}

export async function runBackgroundCheck(
  request: BackgroundCheckRequest,
): Promise<BackgroundCheckResult> {
  const endpoint = process.env.NEXT_PUBLIC_MOHNMATRIX_BG_API_URL;

  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Background check provider request failed');
    }

    const payload = await response.json();

    return {
      status: payload.status ?? 'needs_review',
      checkedAt: payload.checkedAt ?? new Date().toISOString(),
      providerReference:
        payload.providerReference ?? `matrix-${request.candidateId}-${Date.now()}`,
      notes: payload.notes,
    };
  }

  await new Promise(resolve => setTimeout(resolve, 900));

  return {
    status: fallbackStatus(`${request.candidateId}:${request.email ?? ''}`),
    checkedAt: new Date().toISOString(),
    providerReference: `matrix-local-${request.candidateId}-${Date.now()}`,
    notes:
      'Fallback mode active. Set NEXT_PUBLIC_MOHNMATRIX_BG_API_URL to use the deployed MohnMatrix provider.',
  };
}
