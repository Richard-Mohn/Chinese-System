'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChefCameraStream, CameraSource } from '@/components/ChefCameraStream';
import {
  FaVideo, FaToggleOn, FaToggleOff, FaPlus, FaTrash,
  FaMobileAlt, FaCamera, FaDesktop, FaWifi, FaSave,
  FaCheckCircle, FaEye, FaBroadcastTower, FaUsers,
  FaMusic, FaChurch, FaUtensils, FaStore,
} from 'react-icons/fa';

// ─── Industry Contexts ───────────────────────────────────────

export type StreamContext =
  | 'kitchen'       // Chef Cam — restaurant cooking shows
  | 'packaging'     // Package Cam — delivery packing
  | 'baking'        // Bake Cam — bakery decorating
  | 'performance'   // Artist / DJ live performance
  | 'worship'       // Church live service
  | 'storefront'    // Retail / antique store walkthrough
  | 'general';      // Default

interface ContextConfig {
  title: string;
  subtitle: string;
  icon: typeof FaVideo;
  accentColor: string;      // Tailwind color class
  bgGradient: string;
  firestoreKey: string;     // Key in businesses/{id}/config/
  labels: {
    camera: string;
    stream: string;
    viewer: string;
    goLive: string;
  };
}

const STREAM_CONTEXTS: Record<StreamContext, ContextConfig> = {
  kitchen: {
    title: "Chef's Eye",
    subtitle: 'Live camera feeds for your kitchen, prep station, or grill.',
    icon: FaUtensils,
    accentColor: 'orange',
    bgGradient: 'from-orange-500 to-amber-600',
    firestoreKey: 'chefCam',
    labels: { camera: 'Kitchen Camera', stream: 'Kitchen Stream', viewer: 'Diners watching', goLive: 'Go Live in Kitchen' },
  },
  packaging: {
    title: 'Package Cam',
    subtitle: 'Show customers their order being packed and prepared for delivery.',
    icon: FaStore,
    accentColor: 'sky',
    bgGradient: 'from-sky-500 to-blue-600',
    firestoreKey: 'packageCam',
    labels: { camera: 'Packing Camera', stream: 'Package Stream', viewer: 'Customers watching', goLive: 'Go Live — Packing' },
  },
  baking: {
    title: 'Bake Cam',
    subtitle: 'Live baking, decorating, and cake crafting — show off your skills.',
    icon: FaStore,
    accentColor: 'pink',
    bgGradient: 'from-pink-500 to-rose-600',
    firestoreKey: 'bakeCam',
    labels: { camera: 'Bakery Camera', stream: 'Bakery Stream', viewer: 'Fans watching', goLive: 'Go Live — Bake Cam' },
  },
  performance: {
    title: 'Live Stage',
    subtitle: 'Stream your performance, DJ set, or studio session to fans worldwide.',
    icon: FaMusic,
    accentColor: 'indigo',
    bgGradient: 'from-indigo-500 to-purple-600',
    firestoreKey: 'liveStream',
    labels: { camera: 'Stage Camera', stream: 'Live Performance', viewer: 'Fans watching', goLive: 'Go Live — Stage' },
  },
  worship: {
    title: 'Live Service',
    subtitle: 'Stream your worship service, sermon, or bible study to your congregation.',
    icon: FaChurch,
    accentColor: 'amber',
    bgGradient: 'from-amber-500 to-yellow-600',
    firestoreKey: 'liveService',
    labels: { camera: 'Service Camera', stream: 'Live Service', viewer: 'Members watching', goLive: 'Go Live — Service' },
  },
  storefront: {
    title: 'Store Cam',
    subtitle: 'Live walk-through of your store, showroom, or market stall.',
    icon: FaStore,
    accentColor: 'emerald',
    bgGradient: 'from-emerald-500 to-green-600',
    firestoreKey: 'storeCam',
    labels: { camera: 'Store Camera', stream: 'Store Stream', viewer: 'Shoppers watching', goLive: 'Start Store Tour' },
  },
  general: {
    title: 'Live Stream',
    subtitle: 'Stream live video to your customers and followers.',
    icon: FaBroadcastTower,
    accentColor: 'violet',
    bgGradient: 'from-violet-500 to-purple-600',
    firestoreKey: 'liveStream',
    labels: { camera: 'Camera', stream: 'Live Stream', viewer: 'Viewers', goLive: 'Go Live' },
  },
};

// ─── Types ───────────────────────────────────────────────────

type CamType = 'browser' | 'hls' | 'mjpeg' | 'image';

interface CameraConfig {
  id: string;
  label: string;
  type: CamType;
  url: string;
  deviceId?: string;
  facingMode?: 'user' | 'environment';
  enabled: boolean;
}

interface StreamSettings {
  enabled: boolean;
  cameras: CameraConfig[];
  autoStartOnOrder: boolean;
  showOnStorefront: boolean;
  isLive: boolean; // currently broadcasting
  viewerCount: number;
}

const DEFAULT_SETTINGS: StreamSettings = {
  enabled: false,
  cameras: [],
  autoStartOnOrder: false,
  showOnStorefront: true,
  isLive: false,
  viewerCount: 0,
};

const CAMERA_TYPES: { value: CamType; label: string; icon: typeof FaCamera; desc: string }[] = [
  { value: 'browser', label: 'Phone / Laptop Camera', icon: FaMobileAlt, desc: 'Use this device\'s camera directly — phones, tablets, webcams' },
  { value: 'hls', label: 'Streaming Software (OBS)', icon: FaDesktop, desc: 'Stream from OBS, Streamlabs, or other RTMP→HLS software' },
  { value: 'mjpeg', label: 'IP Camera (MJPEG)', icon: FaWifi, desc: 'Axis, Hikvision, Dahua, Reolink — use MJPEG stream URL' },
  { value: 'image', label: 'IP Camera (Snapshot)', icon: FaCamera, desc: 'Simple cameras that provide a snapshot URL — refreshes every 2s' },
];

// ─── Props ───────────────────────────────────────────────────

interface LiveStreamManagerProps {
  businessId: string;
  context: StreamContext;
}

// ─── Component ───────────────────────────────────────────────

export default function LiveStreamManager({ businessId, context }: LiveStreamManagerProps) {
  const ctx = STREAM_CONTEXTS[context] || STREAM_CONTEXTS.general;
  const CtxIcon = ctx.icon;

  const [settings, setSettings] = useState<StreamSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewCam, setPreviewCam] = useState<number | null>(null);
  const [addingCamera, setAddingCamera] = useState(false);
  const [newCamType, setNewCamType] = useState<CamType | null>(null);
  const [newCamLabel, setNewCamLabel] = useState('');
  const [newCamUrl, setNewCamUrl] = useState('');
  const [newCamFacing, setNewCamFacing] = useState<'user' | 'environment'>('environment');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Load settings
  useEffect(() => {
    if (!businessId) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'businesses', businessId, 'config', ctx.firestoreKey));
        if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.data() as StreamSettings });
      } catch (err) { console.error(`Failed to load ${ctx.firestoreKey} settings:`, err); }
    };
    load();
  }, [businessId, ctx.firestoreKey]);

  const detectDevices = useCallback(async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(t => t.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAvailableDevices(devices.filter(d => d.kind === 'videoinput'));
    } catch (err) { console.error('Camera enumeration failed:', err); }
  }, []);

  const saveSettings = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'businesses', businessId, 'config', ctx.firestoreKey), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(`Failed to save ${ctx.firestoreKey} settings:`, err); }
    finally { setSaving(false); }
  };

  const addCamera = () => {
    if (!newCamType) return;
    const cam: CameraConfig = {
      id: `cam-${Date.now()}`,
      label: newCamLabel || `${ctx.labels.camera} ${settings.cameras.length + 1}`,
      type: newCamType,
      url: newCamUrl,
      deviceId: newCamType === 'browser' ? selectedDeviceId : undefined,
      facingMode: newCamType === 'browser' ? newCamFacing : undefined,
      enabled: true,
    };
    setSettings(s => ({ ...s, cameras: [...s.cameras, cam] }));
    setAddingCamera(false);
    setNewCamType(null);
    setNewCamLabel('');
    setNewCamUrl('');
    setSelectedDeviceId('');
  };

  const removeCamera = (id: string) => {
    setSettings(s => ({ ...s, cameras: s.cameras.filter(c => c.id !== id) }));
    if (previewCam !== null && settings.cameras[previewCam]?.id === id) setPreviewCam(null);
  };

  const toggleCamera = (id: string) => {
    setSettings(s => ({
      ...s,
      cameras: s.cameras.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c),
    }));
  };

  const toggleLive = async () => {
    const newIsLive = !settings.isLive;
    const newSettings = { ...settings, isLive: newIsLive, enabled: newIsLive ? true : settings.enabled };
    setSettings(newSettings);
    // Persist immediately
    try {
      await setDoc(doc(db, 'businesses', businessId, 'config', ctx.firestoreKey), newSettings);
    } catch (err) { console.error('Failed to toggle live:', err); }
  };

  const camToSource = (cam: CameraConfig): CameraSource => {
    if (cam.type === 'browser') return { type: 'browser', deviceId: cam.deviceId, label: cam.label, facingMode: cam.facingMode };
    if (cam.type === 'mjpeg') return { type: 'mjpeg', url: cam.url, label: cam.label };
    if (cam.type === 'image') return { type: 'image', url: cam.url, label: cam.label };
    return { type: 'hls', url: cam.url, label: cam.label };
  };

  const accentClasses = {
    bg: `bg-${ctx.accentColor}-600`,
    bgHover: `hover:bg-${ctx.accentColor}-700`,
    bgLight: `bg-${ctx.accentColor}-100`,
    text: `text-${ctx.accentColor}-600`,
    textLight: `text-${ctx.accentColor}-400`,
    border: `border-${ctx.accentColor}-200`,
    gradientBg: `bg-gradient-to-r ${ctx.bgGradient}`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-black">{ctx.title}</h1>
            <span className={`${accentClasses.bg} text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase`}>Beta</span>
            {settings.isLive && (
              <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
              </span>
            )}
          </div>
          <p className="text-zinc-400 font-medium">{ctx.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Go Live button */}
          <button
            onClick={toggleLive}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              settings.isLive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : `${accentClasses.gradientBg} text-white hover:shadow-lg`
            }`}
          >
            <FaBroadcastTower className="text-sm" />
            {settings.isLive ? 'End Stream' : ctx.labels.goLive}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <FaCheckCircle className="text-emerald-400" />
            ) : (
              <FaSave />
            )}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Master toggle + sub-toggles */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-black text-lg">Enable {ctx.title}</h2>
            <p className="text-sm text-zinc-400 mt-1">When enabled, {ctx.labels.viewer.toLowerCase()} can see the stream on your storefront.</p>
          </div>
          <button onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))} className="text-4xl">
            {settings.enabled ? <FaToggleOn className={accentClasses.text} /> : <FaToggleOff className="text-zinc-300" />}
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {context === 'kitchen' && (
            <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-4">
              <div>
                <p className="font-bold text-black text-sm">Auto-start on order</p>
                <p className="text-xs text-zinc-400">Start stream when a customer orders</p>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, autoStartOnOrder: !s.autoStartOnOrder }))} className="text-2xl">
                {settings.autoStartOnOrder ? <FaToggleOn className={accentClasses.text} /> : <FaToggleOff className="text-zinc-300" />}
              </button>
            </div>
          )}
          <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-4">
            <div>
              <p className="font-bold text-black text-sm">Show on storefront</p>
              <p className="text-xs text-zinc-400">Display to visitors on your page</p>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, showOnStorefront: !s.showOnStorefront }))} className="text-2xl">
              {settings.showOnStorefront ? <FaToggleOn className={accentClasses.text} /> : <FaToggleOff className="text-zinc-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Camera list */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-black text-lg">Cameras ({settings.cameras.length})</h2>
          <button
            onClick={() => { setAddingCamera(true); setNewCamType(null); }}
            className={`flex items-center gap-2 px-4 py-2 ${accentClasses.bg} text-white rounded-full text-sm font-bold ${accentClasses.bgHover} transition-colors`}
          >
            <FaPlus className="text-xs" /> Add Camera
          </button>
        </div>

        {settings.cameras.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <FaVideo className="text-4xl mx-auto mb-3 text-zinc-300" />
            <p className="font-bold mb-1">No cameras configured</p>
            <p className="text-sm">Add a camera to get started — use your phone, laptop webcam, or IP camera.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {settings.cameras.map((cam, i) => {
              const typeInfo = CAMERA_TYPES.find(t => t.value === cam.type);
              const Icon = typeInfo?.icon || FaCamera;
              return (
                <motion.div
                  key={cam.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    cam.enabled ? 'bg-white border-zinc-200' : 'bg-zinc-50 border-zinc-100 opacity-60'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={`w-10 h-10 ${accentClasses.bgLight} rounded-full flex items-center justify-center shrink-0`}>
                    <Icon className={accentClasses.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black text-sm truncate">{cam.label}</p>
                    <p className="text-xs text-zinc-400 truncate">
                      {cam.type === 'browser' ? `Device camera · ${cam.facingMode === 'user' ? 'Front' : 'Rear'}` : cam.url || 'No URL'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setPreviewCam(previewCam === i ? null : i)} className="p-2 text-zinc-400 hover:text-black transition-colors" title="Preview">
                      <FaEye />
                    </button>
                    <button onClick={() => toggleCamera(cam.id)} className="text-xl">
                      {cam.enabled ? <FaToggleOn className="text-emerald-500" /> : <FaToggleOff className="text-zinc-300" />}
                    </button>
                    <button onClick={() => removeCamera(cam.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Remove">
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Camera Preview */}
      <AnimatePresence>
        {previewCam !== null && settings.cameras[previewCam] && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <h2 className="font-black text-black text-lg mb-4">
                Preview: {settings.cameras[previewCam].label}
              </h2>
              <ChefCameraStream
                source={camToSource(settings.cameras[previewCam])}
                businessId={businessId}
                isLive={settings.isLive}
                autoPlay
                muted
                className="max-w-2xl mx-auto"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Camera Modal */}
      <AnimatePresence>
        {addingCamera && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddingCamera(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-black mb-6">Add {ctx.labels.camera}</h2>

              {!newCamType ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-500 mb-4">What kind of camera are you connecting?</p>
                  {CAMERA_TYPES.map(ct => {
                    const CTIcon = ct.icon;
                    return (
                      <button
                        key={ct.value}
                        onClick={() => { setNewCamType(ct.value); if (ct.value === 'browser') detectDevices(); }}
                        className={`w-full flex items-center gap-4 p-4 border-2 border-zinc-200 rounded-xl hover:border-${ctx.accentColor}-500 hover:bg-${ctx.accentColor}-50 transition-all text-left`}
                      >
                        <div className={`w-10 h-10 ${accentClasses.bgLight} rounded-full flex items-center justify-center shrink-0`}>
                          <CTIcon className={accentClasses.text} />
                        </div>
                        <div>
                          <p className="font-bold text-black">{ct.label}</p>
                          <p className="text-xs text-zinc-400">{ct.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-5">
                  <button onClick={() => setNewCamType(null)} className="text-sm text-zinc-500 hover:text-black font-bold">
                    ← Change camera type
                  </button>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Camera Name</label>
                    <input
                      type="text"
                      value={newCamLabel}
                      onChange={e => setNewCamLabel(e.target.value)}
                      placeholder={ctx.labels.camera}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                    />
                  </div>

                  {newCamType === 'browser' && (
                    <>
                      {availableDevices.length > 0 && (
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Select Camera</label>
                          <select
                            value={selectedDeviceId}
                            onChange={e => setSelectedDeviceId(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                          >
                            <option value="">Auto-detect best camera</option>
                            {availableDevices.map(d => (
                              <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 8)}`}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Camera Direction</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'environment' as const, label: 'Rear Camera', desc: 'Points outward' },
                            { value: 'user' as const, label: 'Front Camera', desc: 'Selfie / face camera' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setNewCamFacing(opt.value)}
                              className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                                newCamFacing === opt.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                              }`}
                            >
                              {opt.label}
                              <p className="text-[10px] font-normal text-zinc-400">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {(newCamType === 'hls' || newCamType === 'mjpeg' || newCamType === 'image') && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                        {newCamType === 'hls' ? 'HLS Stream URL (.m3u8)' : newCamType === 'mjpeg' ? 'MJPEG Stream URL' : 'Snapshot URL'}
                      </label>
                      <input
                        type="url"
                        value={newCamUrl}
                        onChange={e => setNewCamUrl(e.target.value)}
                        placeholder={
                          newCamType === 'hls' ? 'https://stream.example.com/live/stream.m3u8'
                          : newCamType === 'mjpeg' ? 'http://192.168.1.100/video.mjpeg'
                          : 'http://192.168.1.100/snapshot.jpg'
                        }
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl font-mono text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setAddingCamera(false)}
                      className="flex-1 px-6 py-3 border-2 border-zinc-200 text-zinc-600 rounded-full font-bold hover:border-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addCamera}
                      disabled={newCamType !== 'browser' && !newCamUrl}
                      className={`flex-1 px-6 py-3 ${accentClasses.bg} text-white rounded-full font-bold ${accentClasses.bgHover} transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                      <FaPlus className="text-xs" /> Add Camera
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Exported context config for use elsewhere ───────────────

export { STREAM_CONTEXTS };
export type { ContextConfig };
