'use client';

import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { runBackgroundCheck } from '@/lib/backgroundCheck';
import {
  FaTimes, FaIdCard, FaCamera, FaShieldAlt, FaCheck, FaExclamationTriangle,
  FaSpinner, FaDownload, FaEye
} from 'react-icons/fa';
import Image from 'next/image';

interface ApplicationDocument {
  type: 'id' | 'license' | 'selfie';
  url: string;
  uploadedAt: string;
  verified?: boolean;
}

interface Application {
  id: string;
  candidate?: {
    fullName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    dob?: string;
  };
  roleSlug: string;
  roleTitle: string;
  answers?: Record<string, any>;
  documents?: ApplicationDocument[];
  hrReview?: {
    backgroundCheckStatus?: string;
    backgroundCheckResult?: any;
    idVerified?: boolean;
    selfieVerified?: boolean;
  };
}

interface Props {
  application: Application;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ApplicationReviewModal({ application, onClose, onUpdate }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const documents = application.documents || [];
  const idDoc = documents.find(d => d.type === 'id');
  const licenseDoc = documents.find(d => d.type === 'license');
  const selfieDoc = documents.find(d => d.type === 'selfie');

  const handleFileUpload = async (type: 'id' | 'license', file: File) => {
    if (!file) return;
    
    setUploading(type);
    try {
      const storageRef = ref(storage, `applications/${application.id}/${type}_${Date.now()}.${file.name.split('.').pop()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const newDoc: ApplicationDocument = {
        type,
        url,
        uploadedAt: new Date().toISOString(),
        verified: false,
      };

      const updatedDocs = [...documents.filter(d => d.type !== type), newDoc];

      await updateDoc(doc(db, 'careerApplications', application.id), {
        documents: updatedDocs,
        'hrReview.documentsUploadedAt': serverTimestamp(),
      });

      onUpdate();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const handleCaptureSelfie = async () => {
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const storageRef = ref(storage, `applications/${application.id}/selfie_${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        const newDoc: ApplicationDocument = {
          type: 'selfie',
          url,
          uploadedAt: new Date().toISOString(),
          verified: false,
        };

        const updatedDocs = [...documents.filter(d => d.type !== 'selfie'), newDoc];

        await updateDoc(doc(db, 'careerApplications', application.id), {
          documents: updatedDocs,
          'hrReview.selfieUploadedAt': serverTimestamp(),
        });

        setCapturing(false);
        onUpdate();
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Selfie capture failed:', err);
      alert('Failed to capture selfie. Please ensure camera permissions are granted.');
      setCapturing(false);
    }
  };

  const handleRunBackgroundCheck = async () => {
    if (!application.candidate?.fullName) {
      alert('Applicant name is required to run background check');
      return;
    }

    // TODO: Add tier checking once business tier is accessible
    // For now, allow all background checks
    // if (!hasFeatureAccess(businessTier, 'background-checks')) {
    //   alert('Background checks require Professional tier or higher');
    //   return;
    // }

    setRunningCheck(true);
    try {
      const [firstName, ...rest] = application.candidate.fullName.split(' ');
      const lastName = rest.join(' ');

      const result = await runBackgroundCheck({
        firstName,
        lastName,
        state: application.candidate.state || 'VA',
        dob: application.candidate.dob,
        purpose: 'employment_screening',
      });

      setCheckResult(result);

      await updateDoc(doc(db, 'careerApplications', application.id), {
        'hrReview.backgroundCheckStatus': result.risk === 'clear' ? 'clear' : result.risk === 'review' ? 'review' : 'failed',
        'hrReview.backgroundCheckResult': result,
        'hrReview.backgroundProvider': result.provider,
        'hrReview.backgroundReference': result.reference,
        'hrReview.backgroundCheckedAt': serverTimestamp(),
      });

      onUpdate();
    } catch (err: any) {
      console.error('Background check failed:', err);
      alert(err.message || 'Failed to run background check');
    } finally {
      setRunningCheck(false);
    }
  };

  const handleVerifyDocument = async (type: 'id' | 'license' | 'selfie') => {
    const updatedDocs = documents.map(d => 
      d.type === type ? { ...d, verified: true } : d
    );

    await updateDoc(doc(db, 'careerApplications', application.id), {
      documents: updatedDocs,
      [`hrReview.${type}Verified`]: true,
      [`hrReview.${type}VerifiedAt`]: serverTimestamp(),
    });

    onUpdate();
  };

  const bgStatus = application.hrReview?.backgroundCheckStatus;
  const bgResult = application.hrReview?.backgroundCheckResult || checkResult;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{application.candidate?.fullName}</h2>
            <p className="text-indigo-100 text-sm font-medium">
              {application.roleTitle} • {application.candidate?.city}, {application.candidate?.state}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contact Info */}
          <div className="bg-zinc-50 rounded-xl p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">Contact Information</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 font-medium mb-1">Email</p>
                <p className="text-black font-bold">{application.candidate?.email}</p>
              </div>
              <div>
                <p className="text-zinc-500 font-medium mb-1">Phone</p>
                <p className="text-black font-bold">{application.candidate?.phone}</p>
              </div>
              <div>
                <p className="text-zinc-500 font-medium mb-1">DOB</p>
                <p className="text-black font-bold">{application.candidate?.dob || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Document Upload & Verification */}
          <div>
            <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2">
              <FaIdCard /> Identity Verification
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {/* ID Upload */}
              <div className="border-2 border-zinc-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black">Government ID</h4>
                  {idDoc?.verified && <FaCheck className="text-emerald-500" />}
                </div>
                {idDoc ? (
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedImage(idDoc.url)}
                      className="w-full aspect-video bg-zinc-100 rounded-lg overflow-hidden relative"
                    >
                      <Image src={idDoc.url} alt="ID" fill className="object-cover" />
                    </button>
                    <button
                      onClick={() => handleVerifyDocument('id')}
                      className="w-full py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600"
                    >
                      Verify ID
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('id', e.target.files[0])}
                      className="hidden"
                      disabled={!!uploading}
                    />
                    <div className="w-full aspect-video bg-zinc-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                      {uploading === 'id' ? (
                        <FaSpinner className="animate-spin text-2xl text-zinc-400" />
                      ) : (
                        <>
                          <FaIdCard className="text-3xl text-zinc-400 mb-2" />
                          <p className="text-xs text-zinc-500 font-bold">Upload ID</p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* License Upload */}
              <div className="border-2 border-zinc-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black">Driver's License</h4>
                  {licenseDoc?.verified && <FaCheck className="text-emerald-500" />}
                </div>
                {licenseDoc ? (
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedImage(licenseDoc.url)}
                      className="w-full aspect-video bg-zinc-100 rounded-lg overflow-hidden relative"
                    >
                      <Image src={licenseDoc.url} alt="License" fill className="object-cover" />
                    </button>
                    <button
                      onClick={() => handleVerifyDocument('license')}
                      className="w-full py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600"
                    >
                      Verify License
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('license', e.target.files[0])}
                      className="hidden"
                      disabled={!!uploading}
                    />
                    <div className="w-full aspect-video bg-zinc-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                      {uploading === 'license' ? (
                        <FaSpinner className="animate-spin text-2xl text-zinc-400" />
                      ) : (
                        <>
                          <FaIdCard className="text-3xl text-zinc-400 mb-2" />
                          <p className="text-xs text-zinc-500 font-bold">Upload License</p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Selfie Capture */}
              <div className="border-2 border-zinc-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black">Verification Selfie</h4>
                  {selfieDoc?.verified && <FaCheck className="text-emerald-500" />}
                </div>
                {selfieDoc ? (
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedImage(selfieDoc.url)}
                      className="w-full aspect-video bg-zinc-100 rounded-lg overflow-hidden relative"
                    >
                      <Image src={selfieDoc.url} alt="Selfie" fill className="object-cover" />
                    </button>
                    <button
                      onClick={() => handleVerifyDocument('selfie')}
                      className="w-full py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600"
                    >
                      Verify Selfie
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCaptureSelfie}
                    disabled={capturing}
                    className="w-full aspect-video bg-zinc-100 rounded-lg flex flex-col items-center justify-center hover:bg-zinc-200 transition-colors"
                  >
                    {capturing ? (
                      <FaSpinner className="animate-spin text-2xl text-zinc-400" />
                    ) : (
                      <>
                        <FaCamera className="text-3xl text-zinc-400 mb-2" />
                        <p className="text-xs text-zinc-500 font-bold">Capture Selfie</p>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Background Check */}
          <div>
            <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2">
              <FaShieldAlt /> Background Check
            </h3>
            
            {bgResult ? (
              <div className={`border-2 rounded-xl p-6 ${
                bgResult.risk === 'clear' ? 'border-emerald-200 bg-emerald-50' :
                bgResult.risk === 'review' ? 'border-amber-200 bg-amber-50' :
                'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-black flex items-center gap-2">
                    {bgResult.risk === 'clear' && <><FaCheck className="text-emerald-600" /> Clear</>}
                    {bgResult.risk === 'review' && <><FaExclamationTriangle className="text-amber-600" /> Needs Review</>}
                    {bgResult.risk === 'high_risk' && <><FaTimes className="text-red-600" /> High Risk</>}
                  </h4>
                  <span className="text-xs text-zinc-500 font-medium">
                    {bgResult.provider} • {bgResult.reference}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-black">{bgResult.recordCount}</p>
                    <p className="text-xs text-zinc-500 font-bold">Total Records</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-black">{bgResult.summary.criminalRecords}</p>
                    <p className="text-xs text-zinc-500 font-bold">Criminal</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-black">{bgResult.summary.trafficViolations}</p>
                    <p className="text-xs text-zinc-500 font-bold">Traffic</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-black">{bgResult.summary.warrants}</p>
                    <p className="text-xs text-zinc-500 font-bold">Warrants</p>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-600">
                  Checked: {new Date(bgResult.checkedAt).toLocaleString()} • 
                  Expires: {new Date(bgResult.expiresAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <button
                onClick={handleRunBackgroundCheck}
                disabled={runningCheck || !idDoc}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {runningCheck ? (
                  <><FaSpinner className="animate-spin" /> Running Background Check...</>
                ) : (
                  <><FaShieldAlt /> Run Background Check</>
                )}
              </button>
            )}
            
            {!idDoc && !bgResult && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                Upload and verify applicant's ID before running background check
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-[90vh] relative">
            <Image src={selectedImage} alt="Document" width={800} height={600} className="object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
