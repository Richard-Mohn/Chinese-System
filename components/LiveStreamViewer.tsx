'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChefCameraStream, CameraSource } from '@/components/ChefCameraStream';
import { STREAM_CONTEXTS, StreamContext, ContextConfig } from '@/components/LiveStreamManager';
import {
  FaBroadcastTower, FaExchangeAlt, FaExpand, FaUsers, FaEye,
} from 'react-icons/fa';

// ─── Props ───────────────────────────────────────────────────

interface LiveStreamViewerProps {
  businessId: string;
  context: StreamContext;
  className?: string;
  compact?: boolean;           // Compact card for embedding in pages
  accentOverride?: string;     // Override accent color (for genre themes)
}

// ─── Component ───────────────────────────────────────────────

export default function LiveStreamViewer({
  businessId,
  context,
  className = '',
  compact = false,
  accentOverride,
}: LiveStreamViewerProps) {
  const ctx: ContextConfig = STREAM_CONTEXTS[context] || STREAM_CONTEXTS.general;

  const [isLive, setIsLive] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCam, setActiveCam] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Subscribe to stream config
  useEffect(() => {
    if (!businessId) return;
    const unsub = onSnapshot(
      doc(db, 'businesses', businessId, 'config', ctx.firestoreKey),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIsLive(data.isLive ?? false);
          setEnabled(data.enabled ?? false);
          setViewerCount(data.viewerCount ?? 0);
          setCameras((data.cameras ?? []).filter((c: any) => c.enabled));
        } else {
          setIsLive(false);
          setEnabled(false);
          setCameras([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Stream listener error:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [businessId, ctx.firestoreKey]);

  const activeSource: CameraSource | null = useMemo(() => {
    const cam = cameras[activeCam];
    if (!cam) return null;
    if (cam.type === 'browser') return { type: 'browser', deviceId: cam.deviceId, label: cam.label, facingMode: cam.facingMode };
    if (cam.type === 'mjpeg') return { type: 'mjpeg', url: cam.url, label: cam.label };
    if (cam.type === 'image') return { type: 'image', url: cam.url, label: cam.label };
    return { type: 'hls', url: cam.url, label: cam.label };
  }, [cameras, activeCam]);

  // Don't render if not enabled or not shown on storefront
  if (loading) {
    return (
      <div className={`animate-pulse bg-zinc-100 rounded-2xl ${compact ? 'h-48' : 'h-64'} ${className}`} />
    );
  }

  if (!enabled && !isLive) return null;

  // ── Offline state ──
  if (!isLive) {
    return (
      <div className={`bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-2xl overflow-hidden ${className}`}>
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
          <div className="w-14 h-14 bg-zinc-200 rounded-full flex items-center justify-center">
            <ctx.icon className="text-zinc-400 text-xl" />
          </div>
          <p className="text-sm font-bold text-zinc-500">{ctx.labels.stream}</p>
          <p className="text-xs text-zinc-400">
            {context === 'performance' ? 'No live performance right now — check back soon!'
              : context === 'worship' ? 'No service streaming right now — check the schedule.'
              : 'Stream is currently offline.'}
          </p>
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <span className="w-2 h-2 bg-zinc-300 rounded-full" />
            Offline
          </div>
        </div>
      </div>
    );
  }

  // ── Live state ──
  const accent = accentOverride || ctx.accentColor;

  if (compact) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-black aspect-video ${className}`}>
        {/* Live badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Live
          </span>
          <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <FaEye className="text-[8px]" /> {viewerCount || 1}
          </span>
        </div>

        {/* Camera switcher */}
        {cameras.length > 1 && (
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={() => setActiveCam((activeCam + 1) % cameras.length)}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full text-xs transition-colors"
              title="Switch camera"
            >
              <FaExchangeAlt />
            </button>
          </div>
        )}

        {/* Stream */}
        {activeSource && (
          <ChefCameraStream
            source={activeSource}
            businessId={businessId}
            isLive={isLive}
            autoPlay
            muted
          />
        )}
      </div>
    );
  }

  // ── Full-size player ──
  return (
    <motion.div
      className={`bg-black rounded-2xl overflow-hidden shadow-xl ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-900 to-black">
        <div className="flex items-center gap-3">
          <FaBroadcastTower className={`text-${accent}-400`} />
          <span className="text-white font-bold text-sm">{ctx.labels.stream}</span>
          <span className="bg-red-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
            <FaUsers className="text-[10px]" /> {viewerCount || 1} {ctx.labels.viewer.toLowerCase()}
          </span>
          {cameras.length > 1 && (
            <button
              onClick={() => setActiveCam((activeCam + 1) % cameras.length)}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg transition-colors"
              title="Switch camera"
            >
              <FaExchangeAlt className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Stream area */}
      <div className="relative aspect-video bg-zinc-950">
        {activeSource && (
          <ChefCameraStream
            source={activeSource}
            businessId={businessId}
            isLive={isLive}
            autoPlay
            muted
          />
        )}
      </div>

      {/* Camera selector (if multiple) */}
      {cameras.length > 1 && (
        <div className="flex gap-2 px-4 py-3 bg-zinc-950 border-t border-zinc-800">
          {cameras.map((cam: any, i: number) => (
            <button
              key={cam.id}
              onClick={() => setActiveCam(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                i === activeCam
                  ? `bg-${accent}-600 text-white`
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cam.label || `Camera ${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
