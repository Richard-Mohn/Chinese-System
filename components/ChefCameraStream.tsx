'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FaPlay, FaStop, FaVolumeUp, FaVolumeMute,
  FaCamera, FaSyncAlt, FaExpand, FaCompress,
} from 'react-icons/fa';

export type CameraSource =
  | { type: 'hls'; url: string; label?: string }
  | { type: 'browser'; deviceId?: string; label?: string; facingMode?: 'user' | 'environment' }
  | { type: 'mjpeg'; url: string; label?: string }
  | { type: 'image'; url: string; label?: string; refreshMs?: number };

interface ChefCameraStreamProps {
  streamUrl?: string;
  source?: CameraSource;
  sources?: CameraSource[];
  businessId: string;
  isLive?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  showControls?: boolean;
  className?: string;
  label?: string;
}

/**
 * Chef Cam — Multi-source live streaming component
 *
 * Supports:
 *  • HLS (.m3u8) — OBS / streaming software / IP cameras with HLS output
 *  • Browser camera (getUserMedia) — phones, Surface Pro, webcams
 *  • MJPEG — commercial IP cameras (Axis, Hikvision, Dahua, etc.)
 *  • Static image refresh — simple IP cameras with snapshot URL
 *
 * Designed for kitchens, bakeries, packaging stations, workshops, and antique stores.
 */
export const ChefCameraStream: React.FC<ChefCameraStreamProps> = ({
  streamUrl,
  source,
  sources,
  businessId,
  isLive = false,
  autoPlay = false,
  muted = false,
  showControls = true,
  className = '',
  label,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Multi-camera support
  const allSources = sources || (source ? [source] : (streamUrl ? [{ type: 'hls' as const, url: streamUrl }] : []));
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSource = allSources[activeIndex] || null;

  // Detect the effective type
  const sourceType = activeSource?.type || 'hls';
  const sourceUrl = activeSource && 'url' in activeSource ? activeSource.url : streamUrl || '';

  // Cleanup local media stream
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
  }, []);

  // ── HLS player ──
  useEffect(() => {
    if (sourceType !== 'hls' || !sourceUrl) return;
    const video = videoRef.current;
    if (!video) return;
    setIsLoading(true);
    setError(null);

    let destroyed = false;
    import('hls.js').then(({ default: Hls }) => {
      if (destroyed) return;
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setError(data.type === Hls.ErrorTypes.NETWORK_ERROR
            ? 'Network error — stream unavailable'
            : 'Stream error — please try again');
          setIsLoading(false);
        }
      });
      return () => { destroyed = true; hls.destroy(); };
    }).catch(() => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', () => setIsLoading(false), { once: true });
      } else {
        setError('Browser does not support HLS streaming');
        setIsLoading(false);
      }
    });

    return () => { destroyed = true; };
  }, [sourceType, sourceUrl, autoPlay]);

  // ── Browser camera (getUserMedia) ──
  useEffect(() => {
    if (sourceType !== 'browser') return;
    const video = videoRef.current;
    if (!video) return;
    setIsLoading(true);
    setError(null);
    stopLocalStream();

    const constraints: MediaStreamConstraints = {
      video: activeSource && activeSource.type === 'browser' && activeSource.deviceId
        ? { deviceId: { exact: activeSource.deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : {
            facingMode: activeSource && activeSource.type === 'browser' ? activeSource.facingMode || 'environment' : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
      audio: true,
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        localStreamRef.current = stream;
        video.srcObject = stream;
        video.muted = isMuted;
        video.play().then(() => { setPlaying(true); setIsLoading(false); }).catch(() => setIsLoading(false));
      })
      .catch(err => {
        setError(
          err.name === 'NotAllowedError' ? 'Camera permission denied. Please allow camera access.'
          : err.name === 'NotFoundError' ? 'No camera found on this device.'
          : `Camera error: ${err.message}`
        );
        setIsLoading(false);
      });

    return () => stopLocalStream();
  }, [sourceType, activeSource, stopLocalStream, isMuted]);

  // ── MJPEG stream (IP cameras) ──
  // MJPEG is just an <img> tag — handled in JSX below

  // ── Image refresh (snapshot cameras) ──
  useEffect(() => {
    if (sourceType !== 'image' || !sourceUrl) return;
    setIsLoading(false);
    const interval = activeSource && activeSource.type === 'image' ? activeSource.refreshMs || 2000 : 2000;
    const timer = setInterval(() => {
      if (imgRef.current) {
        imgRef.current.src = `${sourceUrl}${sourceUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      }
    }, interval);
    return () => clearInterval(timer);
  }, [sourceType, sourceUrl, activeSource]);

  // Cleanup on unmount
  useEffect(() => () => stopLocalStream(), [stopLocalStream]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().catch(() => setError('Playback failed'));
      setPlaying(true);
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (video) video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v / 100;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const switchCamera = () => {
    if (allSources.length <= 1) return;
    stopLocalStream();
    setActiveIndex(i => (i + 1) % allSources.length);
  };

  const showVideo = sourceType === 'hls' || sourceType === 'browser';
  const showMjpeg = sourceType === 'mjpeg';
  const showImage = sourceType === 'image';

  return (
    <motion.div
      ref={containerRef}
      className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Live Indicator */}
      {isLive && (
        <motion.div
          className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-black uppercase tracking-wider">Live</span>
        </motion.div>
      )}

      {/* Camera label */}
      {(label || (activeSource && activeSource.label)) && (
        <div className="absolute top-4 right-4 z-20 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
          {activeSource?.label || label}
        </div>
      )}

      {/* Multi-camera indicator */}
      {allSources.length > 1 && (
        <button
          onClick={switchCamera}
          className="absolute top-4 right-4 z-20 bg-black/60 text-white px-3 py-2 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors flex items-center gap-2"
          style={label || activeSource?.label ? { right: 'auto', left: '5rem' } : {}}
        >
          <FaSyncAlt className="text-xs" />
          <span className="text-xs font-bold">{activeIndex + 1}/{allSources.length}</span>
        </button>
      )}

      {/* Video / Image area */}
      <div className="relative aspect-video bg-black">
        {showVideo && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls={false}
            crossOrigin="anonymous"
            playsInline
            muted={isMuted}
          />
        )}

        {showMjpeg && (
          <img
            src={sourceUrl}
            alt="Camera feed"
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => { setError('MJPEG stream unavailable'); setIsLoading(false); }}
          />
        )}

        {showImage && (
          <img
            ref={imgRef}
            src={`${sourceUrl}${sourceUrl.includes('?') ? '&' : '?'}t=${Date.now()}`}
            alt="Camera snapshot"
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => { setError('Camera snapshot unavailable'); setIsLoading(false); }}
          />
        )}

        {/* No source placeholder */}
        {!activeSource && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 gap-4">
            <FaCamera className="text-4xl text-zinc-600" />
            <p className="text-zinc-400 font-bold text-sm">No camera configured</p>
            <p className="text-zinc-500 text-xs">Set up a camera in Owner → Chef Cam</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && activeSource && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm font-bold">
                {sourceType === 'browser' ? 'Accessing camera...' : 'Connecting stream...'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl">📹</div>
            <p className="text-white text-center max-w-sm px-4">
              <span className="font-bold block mb-2">Stream Unavailable</span>
              <span className="text-sm text-gray-400">{error}</span>
            </p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                if (sourceType === 'browser') {
                  // Re-trigger browser camera effect
                  setActiveIndex(i => i);
                }
              }}
              className="px-6 py-2 mt-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="bg-zinc-900 px-4 py-3 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-3">
            {showVideo && (
              <button
                onClick={handlePlayPause}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors shrink-0"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <FaStop size={14} /> : <FaPlay size={14} />}
              </button>
            )}

            {/* Volume */}
            {showVideo && (
              <div className="flex items-center gap-2 flex-1 mx-2">
                <button onClick={handleMuteToggle} className="text-white hover:text-orange-500 transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                </button>
                <input
                  type="range" min="0" max="100" value={volume} onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  aria-label="Volume"
                />
                <span className="text-[10px] text-gray-400 w-7 text-right">{volume}%</span>
              </div>
            )}

            {/* Source type badge */}
            <div className="text-[10px] text-gray-400 px-2 py-1 bg-zinc-800 rounded-full uppercase font-bold shrink-0">
              {sourceType === 'browser' ? '📱 Device' : sourceType === 'mjpeg' ? '📡 IP Cam' : sourceType === 'image' ? '🖼 Snapshot' : '🎥 HLS'}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-orange-500 transition-colors shrink-0" aria-label="Toggle fullscreen">
              {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Chef Notes */}
      <motion.div
        className="bg-gradient-to-t from-black to-transparent p-4 text-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs font-medium leading-relaxed">
          🎬 <strong>Live Feed:</strong> Watch your order being prepared in real-time.
          This transparency builds trust and shows our commitment to quality.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ChefCameraStream;
