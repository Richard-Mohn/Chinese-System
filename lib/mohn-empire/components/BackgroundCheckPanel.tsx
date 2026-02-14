'use client';

import { FaShieldAlt } from 'react-icons/fa';
import type { BackgroundCheckStatus } from '../background-checks';

interface BackgroundCheckPanelProps {
  subjectLabel: string;
  roleLabel: string;
  status?: BackgroundCheckStatus | 'pending' | 'approved' | 'rejected';
  checkedAt?: string;
  running?: boolean;
  onRun: () => void;
  compact?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  needs_review: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function BackgroundCheckPanel({
  subjectLabel,
  roleLabel,
  status = 'pending',
  checkedAt,
  running,
  onRun,
  compact,
}: BackgroundCheckPanelProps) {
  const label = status.replace('_', ' ');

  return (
    <div className={`rounded-xl border p-3 ${compact ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-200'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Background Check</div>
          <div className="text-sm font-bold text-zinc-800">{subjectLabel} · {roleLabel}</div>
          {checkedAt && (
            <div className="text-[11px] text-zinc-500 mt-1">Last checked: {new Date(checkedAt).toLocaleString()}</div>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
          {label}
        </span>
      </div>
      <button
        onClick={onRun}
        disabled={running}
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-700 transition-colors disabled:opacity-60"
      >
        {running ? (
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaShieldAlt className="text-[11px]" />
        )}
        {running ? 'Checking...' : 'Run Check'}
      </button>
    </div>
  );
}
