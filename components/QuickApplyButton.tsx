'use client';

import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import QuickApplicationModal from './QuickApplicationModal';

interface QuickApplyButtonProps {
  roleSlug?: string;
  variant?: 'primary' | 'secondary';
}

export default function QuickApplyButton({ roleSlug, variant = 'primary' }: QuickApplyButtonProps) {
  const [open, setOpen] = useState(false);

  const className =
    variant === 'primary'
      ? 'inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white font-bold hover:bg-zinc-800'
      : 'inline-flex items-center gap-2 px-8 py-4 rounded-full border border-zinc-200 text-zinc-700 font-bold hover:border-zinc-400';

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        Quick Apply <FaArrowRight className="text-xs" />
      </button>
      <QuickApplicationModal isOpen={open} onClose={() => setOpen(false)} defaultRoleSlug={roleSlug} />
    </>
  );
}
