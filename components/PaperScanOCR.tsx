'use client';

import { useState, useRef } from 'react';
import { FaCamera, FaUpload, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import Tesseract from 'tesseract.js';

interface ExtractedData {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dob?: string;
  ssn?: string;
  experience?: string;
  references?: string;
}

interface Props {
  onDataExtracted: (data: ExtractedData) => void;
  onClose: () => void;
}

export default function PaperScanOCR({ onDataExtracted, onClose }: Props) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setUseCamera(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Please grant camera access to scan documents');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(blob => {
      if (blob) {
        processImage(blob);
      }
    }, 'image/jpeg', 0.9);

    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = async (imageFile: Blob | File) => {
    setScanning(true);
    setProgress(0);
    setExtractedText('');
    setExtractedData(null);

    try {
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      setExtractedText(text);

      // Parse extracted text into structured data
      const parsed = parseApplicationData(text);
      setExtractedData(parsed);

    } catch (error) {
      console.error('OCR failed:', error);
      alert('Failed to scan document. Please try again or enter information manually.');
    } finally {
      setScanning(false);
    }
  };

  const parseApplicationData = (text: string): ExtractedData => {
    const data: ExtractedData = {};

    // Name extraction (first non-empty line, or after "Name:")
    const nameMatch = text.match(/Name[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i) ||
                      text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m);
    if (nameMatch) data.fullName = nameMatch[1].trim();

    // Email extraction
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) data.email = emailMatch[1];

    // Phone extraction (various formats)
    const phoneMatch = text.match(/(?:Phone|Tel|Cell)[:\s]*(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i) ||
                       text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) data.phone = phoneMatch[1].replace(/[^\d]/g, '');

    // Address extraction
    const addressMatch = text.match(/Address[:\s]+(.+?)(?:\n|City|State|Zip)/is);
    if (addressMatch) data.address = addressMatch[1].trim();

    // City extraction
    const cityMatch = text.match(/City[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (cityMatch) data.city = cityMatch[1].trim();

    // State extraction
    const stateMatch = text.match(/State[:\s]+([A-Z]{2})/i) ||
                       text.match(/\b([A-Z]{2})\s+\d{5}/);
    if (stateMatch) data.state = stateMatch[1].toUpperCase();

    // ZIP code extraction
    const zipMatch = text.match(/(?:Zip|ZIP|Postal)[:\s]*(\d{5}(?:-\d{4})?)/i) ||
                     text.match(/\b(\d{5}(?:-\d{4})?)\b/);
    if (zipMatch) data.zipCode = zipMatch[1];

    // Date of Birth extraction
    const dobMatch = text.match(/(?:DOB|Date of Birth|Birth Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (dobMatch) data.dob = dobMatch[1];

    // SSN extraction (last 4 digits for security)
    const ssnMatch = text.match(/(?:SSN|Social Security)[:\s]*\d{3}-\d{2}-(\d{4})/i);
    if (ssnMatch) data.ssn = `***-**-${ssnMatch[1]}`;

    // Experience extraction
    const experienceMatch = text.match(/Experience[:\s]+(.+?)(?:\n\n|References|Education)/is);
    if (experienceMatch) data.experience = experienceMatch[1].trim();

    // References extraction
    const referencesMatch = text.match(/References[:\s]+(.+?)$/is);
    if (referencesMatch) data.references = referencesMatch[1].trim();

    return data;
  };

  const handleConfirm = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Scan Paper Application</h2>
            <p className="text-indigo-100 text-sm font-medium">
              Upload or photograph a paper application to auto-fill the form
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!useCamera && !scanning && !extractedData && (
            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full py-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-xl transition-all"
              >
                <FaCamera className="text-2xl" />
                Use Camera
              </button>

              <div className="text-center text-zinc-400 font-bold">OR</div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 bg-zinc-100 text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all"
              >
                <FaUpload className="text-2xl" />
                Upload Photo
              </button>

              <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800 font-bold">
                  📸 <strong>Tips for best results:</strong>
                </p>
                <ul className="text-xs text-amber-700 mt-2 space-y-1 ml-4 list-disc">
                  <li>Ensure good lighting</li>
                  <li>Keep paper flat and fully visible</li>
                  <li>Avoid shadows and glare</li>
                  <li>Use high contrast (dark text on white paper)</li>
                </ul>
              </div>
            </div>
          )}

          {useCamera && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-2xl bg-black"
              />
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-black hover:bg-emerald-600 transition-colors"
                >
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-4 bg-zinc-200 text-black rounded-xl font-bold hover:bg-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {scanning && (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-6xl text-indigo-500 mx-auto mb-6" />
              <p className="text-2xl font-black text-black mb-2">Scanning Document...</p>
              <div className="max-w-xs mx-auto bg-zinc-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-zinc-500 font-bold mt-2">{progress}%</p>
            </div>
          )}

          {extractedData && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <FaCheck className="text-2xl text-emerald-600" />
                <div>
                  <p className="font-black text-emerald-900">Scan Complete!</p>
                  <p className="text-sm text-emerald-700">Review the extracted data below</p>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-black text-black mb-4">Extracted Information</h3>
                
                {Object.entries(extractedData).map(([key, value]) => (
                  value && (
                    <div key={key} className="border-b border-zinc-200 pb-3">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-black font-bold">{value}</p>
                    </div>
                  )
                ))}

                {Object.keys(extractedData).length === 0 && (
                  <p className="text-center text-zinc-400 py-4">No data extracted. Try again with better lighting.</p>
                )}
              </div>

              <details className="bg-zinc-100 rounded-xl p-4">
                <summary className="font-bold text-zinc-600 cursor-pointer">View Raw OCR Text</summary>
                <pre className="mt-3 text-xs text-zinc-500 whitespace-pre-wrap">{extractedText}</pre>
              </details>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={Object.keys(extractedData).length === 0}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-black hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use This Data
                </button>
                <button
                  onClick={() => {
                    setExtractedData(null);
                    setExtractedText('');
                  }}
                  className="px-6 py-4 bg-zinc-200 text-black rounded-xl font-bold hover:bg-zinc-300 transition-colors"
                >
                  Scan Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
