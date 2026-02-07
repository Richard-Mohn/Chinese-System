'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChefCameraStream, CameraSource } from '@/components/ChefCameraStream';
import {
  FaVideo, FaToggleOn, FaToggleOff, FaPlus, FaTrash,
  FaMobileAlt, FaCamera, FaDesktop, FaWifi, FaSave,
  FaCheckCircle, FaExclamationTriangle, FaEye, FaArrowRight,
} from 'react-icons/fa';

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

interface ChefCamSettings {
  enabled: boolean;
  cameras: CameraConfig[];
  autoStartOnOrder: boolean;
  showOnStorefront: boolean;
}

const DEFAULT_SETTINGS: ChefCamSettings = {
  enabled: false,
  cameras: [],
  autoStartOnOrder: true,
  showOnStorefront: true,
};

const CAMERA_TYPES: { value: CamType; label: string; icon: typeof FaCamera; desc: string }[] = [
  { value: 'browser', label: 'Phone / Laptop Camera', icon: FaMobileAlt, desc: 'Use this device\'s camera directly — phones, tablets, Surface Pro, webcams' },
  { value: 'hls', label: 'Streaming Software (OBS)', icon: FaDesktop, desc: 'Stream from OBS, Streamlabs, or other RTMP→HLS software' },
  { value: 'mjpeg', label: 'IP Camera (MJPEG)', icon: FaWifi, desc: 'Axis, Hikvision, Dahua, Reolink — use MJPEG stream URL' },
  { value: 'image', label: 'IP Camera (Snapshot)', icon: FaCamera, desc: 'Simple cameras that provide a snapshot URL — refreshes every 2s' },
];

export default function ChefCamSetup() {
  const { user, currentBusiness, loading, isOwner } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<ChefCamSettings>(DEFAULT_SETTINGS);
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

  useEffect(() => {
    if (!loading && (!user || !isOwner())) router.push('/login');
  }, [user, loading, isOwner, router]);

  // Load settings from Firestore
  useEffect(() => {
    if (!currentBusiness) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'businesses', currentBusiness.businessId, 'config', 'chefCam'));
        if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.data() as ChefCamSettings });
      } catch (err) { console.error('Failed to load chef cam settings:', err); }
    };
    load();
  }, [currentBusiness]);

  // Enumerate browser cameras
  const detectDevices = useCallback(async () => {
    try {
      // Request permission first so labels are populated
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(t => t.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAvailableDevices(devices.filter(d => d.kind === 'videoinput'));
    } catch (err) { console.error('Camera enumeration failed:', err); }
  }, []);

  const saveSettings = async () => {
    if (!currentBusiness) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'businesses', currentBusiness.businessId, 'config', 'chefCam'), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error('Failed to save chef cam settings:', err); }
    finally { setSaving(false); }
  };

  const addCamera = () => {
    if (!newCamType) return;
    const cam: CameraConfig = {
      id: `cam-${Date.now()}`,
      label: newCamLabel || `Camera ${settings.cameras.length + 1}`,
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

  const camToSource = (cam: CameraConfig): CameraSource => {
    if (cam.type === 'browser') return { type: 'browser', deviceId: cam.deviceId, label: cam.label, facingMode: cam.facingMode };
    if (cam.type === 'mjpeg') return { type: 'mjpeg', url: cam.url, label: cam.label };
    if (cam.type === 'image') return { type: 'image', url: cam.url, label: cam.label };
    return { type: 'hls', url: cam.url, label: cam.label };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-black">Chef&apos;s Eye</h1>
            <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Beta</span>
          </div>
          <p className="text-zinc-400 font-medium">Live camera feeds for your kitchen, workshop, bakery, or storefront.</p>
        </div>
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
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Master Toggle */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-black text-lg">Enable Chef&apos;s Eye</h2>
            <p className="text-sm text-zinc-400 mt-1">When enabled, customers can watch live feeds on your storefront.</p>
          </div>
          <button onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))} className="text-4xl">
            {settings.enabled ? <FaToggleOn className="text-orange-600" /> : <FaToggleOff className="text-zinc-300" />}
          </button>
        </div>

        {/* Sub-toggles */}
        <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-4">
            <div>
              <p className="font-bold text-black text-sm">Auto-start on order</p>
              <p className="text-xs text-zinc-400">Start stream when a customer orders</p>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, autoStartOnOrder: !s.autoStartOnOrder }))} className="text-2xl">
              {settings.autoStartOnOrder ? <FaToggleOn className="text-orange-600" /> : <FaToggleOff className="text-zinc-300" />}
            </button>
          </div>
          <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-4">
            <div>
              <p className="font-bold text-black text-sm">Show on storefront</p>
              <p className="text-xs text-zinc-400">Display camera feed to customers</p>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, showOnStorefront: !s.showOnStorefront }))} className="text-2xl">
              {settings.showOnStorefront ? <FaToggleOn className="text-orange-600" /> : <FaToggleOff className="text-zinc-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Camera List */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-black text-lg">Cameras ({settings.cameras.length})</h2>
          <button
            onClick={() => { setAddingCamera(true); setNewCamType(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-bold hover:bg-orange-700 transition-colors"
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
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <Icon className="text-orange-600" />
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <h2 className="font-black text-black text-lg mb-4">
                Preview: {settings.cameras[previewCam].label}
              </h2>
              <ChefCameraStream
                source={camToSource(settings.cameras[previewCam])}
                businessId={currentBusiness?.businessId || ''}
                isLive
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
              <h2 className="text-2xl font-black text-black mb-6">Add Camera</h2>

              {/* Step 1: Choose type */}
              {!newCamType && (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-500 mb-4">What kind of camera are you connecting?</p>
                  {CAMERA_TYPES.map(ct => {
                    const CTIcon = ct.icon;
                    return (
                      <button
                        key={ct.value}
                        onClick={() => {
                          setNewCamType(ct.value);
                          if (ct.value === 'browser') detectDevices();
                        }}
                        className="w-full flex items-center gap-4 p-4 border-2 border-zinc-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                          <CTIcon className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-bold text-black">{ct.label}</p>
                          <p className="text-xs text-zinc-400">{ct.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Configure */}
              {newCamType && (
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
                      placeholder={`e.g. Kitchen Cam, Front Counter, Workshop`}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
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
                            className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
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
                                newCamFacing === opt.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                              }`}
                            >
                              {opt.label}
                              <p className="text-[10px] font-normal text-zinc-400">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-800 text-sm">
                          <strong>💡 Tip:</strong> Open this page on your phone or Surface Pro and add the camera.
                          The device&apos;s camera will be used directly — no extra software needed!
                        </p>
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
                          newCamType === 'hls' ? 'https://stream.example.com/live/kitchen.m3u8'
                          : newCamType === 'mjpeg' ? 'http://192.168.1.100/video.mjpeg'
                          : 'http://192.168.1.100/snapshot.jpg'
                        }
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl font-mono text-sm focus:border-orange-500 focus:outline-none"
                      />

                      {newCamType === 'mjpeg' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
                          <p className="text-amber-800 text-sm">
                            <strong>IP Camera URLs:</strong><br />
                            Axis: <code className="bg-amber-100 px-1 rounded">http://IP/axis-cgi/mjpg/video.cgi</code><br />
                            Hikvision: <code className="bg-amber-100 px-1 rounded">http://IP/ISAPI/Streaming/channels/1/httpPreview</code><br />
                            Dahua: <code className="bg-amber-100 px-1 rounded">http://IP/cgi-bin/mjpg/video.cgi</code><br />
                            Reolink: <code className="bg-amber-100 px-1 rounded">http://IP/cgi-bin/api.cgi?cmd=Snap</code>
                          </p>
                        </div>
                      )}

                      {newCamType === 'hls' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3">
                          <p className="text-blue-800 text-sm">
                            <strong>OBS Studio setup:</strong> Settings → Stream → Server: your RTMP ingest URL.
                            Use an RTMP→HLS relay (e.g., nginx-rtmp) to convert the stream to an HLS URL.
                          </p>
                        </div>
                      )}
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
                      className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

      {/* Setup Guide */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6">
        <h2 className="font-black text-orange-800 mb-3 flex items-center gap-2">
          <FaVideo /> Quick Setup Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/60 rounded-xl p-4">
            <p className="font-black text-black mb-1">📱 Phone / Tablet</p>
            <p className="text-zinc-600">Open this page on your phone, add a &quot;Browser Camera&quot;, and mount the phone where you want video. Works instantly!</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="font-black text-black mb-1">📡 IP Camera</p>
            <p className="text-zinc-600">Get the MJPEG stream URL from your camera&apos;s web interface. Most cameras show it under &quot;Live View&quot; or &quot;Streaming&quot; settings.</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="font-black text-black mb-1">💻 Surface Pro / Laptop</p>
            <p className="text-zinc-600">Add a &quot;Browser Camera&quot; and select your built-in webcam or external USB camera. Great for demonstrations!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
