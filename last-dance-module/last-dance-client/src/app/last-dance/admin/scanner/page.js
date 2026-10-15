'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Camera, CameraOff, CheckCircle2, XCircle, 
  AlertTriangle, Volume2, VolumeX, RefreshCw, Search, 
  Sparkles, ShieldCheck, Clock, User, ArrowRight, RotateCcw,
  UploadCloud, Zap
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Web Audio API Sound Synthesizer (Zero-latency sound effects without external audio files)
const playSoundEffect = (type, isMuted) => {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'valid') {
      // Pleasant double high-pitch success chime (880Hz -> 1760Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // Low dual warning buzzer (220Hz -> 140Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};

export default function AdminGateScannerPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [autoResumeSec, setAutoResumeSec] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionStats, setSessionStats] = useState({ admitted: 0, rejected: 0, total: 0 });
  const [scanHistory, setScanHistory] = useState([]);

  const html5QrCodeRef = useRef(null);
  const isScanningLocked = useRef(false);

  // Initialize or Cleanup Camera Scanner
  const startCamera = async () => {
    setCameraError('');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {}
      }

      const qrScanner = new Html5Qrcode('qr-reader-viewport');
      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await qrScanner.start(
        { facingMode: 'environment' }, // Default to rear camera for phone screens/tickets
        config,
        (decodedText) => {
          if (!isScanningLocked.current) {
            handleTicketVerification(decodedText);
          }
        },
        () => {} // Silent frame errors
      );

      setScannerActive(true);
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or enter ticket code manually.');
      setScannerActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && scannerActive) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Stop camera error:', e);
      }
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  // Handle Ticket Scan / Verification Request
  const handleTicketVerification = async (rawCode) => {
    if (!rawCode || isVerifying || isScanningLocked.current) return;
    
    isScanningLocked.current = true;
    setIsVerifying(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.post(
        `${API_BASE_URL}/last-dance/admin/tickets/scan`,
        { code: rawCode, autoCheckIn: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      setScanResult(data);

      if (data.valid) {
        playSoundEffect('valid', !soundEnabled);
        setSessionStats(prev => ({ ...prev, admitted: prev.admitted + 1, total: prev.total + 1 }));
        addToHistory({
          code: data.ticket?.ticketCode || rawCode,
          name: data.buyer?.name || 'Attendee',
          status: 'ADMITTED',
          timestamp: new Date()
        });
      } else {
        playSoundEffect('invalid', !soundEnabled);
        setSessionStats(prev => ({ ...prev, rejected: prev.rejected + 1, total: prev.total + 1 }));
        addToHistory({
          code: data.ticket?.ticketCode || rawCode,
          name: data.buyer?.name || 'Unknown',
          status: data.alreadyScanned ? 'DUPLICATE' : 'INVALID',
          timestamp: new Date()
        });
      }

      // Auto resume countdown after 4 seconds
      startAutoResumeCountdown();

    } catch (err) {
      console.error('Scan error:', err);
      const errorData = err.response?.data || {
        valid: false,
        message: 'Invalid or unrecognised ticket code.'
      };
      setScanResult(errorData);
      playSoundEffect('invalid', !soundEnabled);
      setSessionStats(prev => ({ ...prev, rejected: prev.rejected + 1, total: prev.total + 1 }));
      addToHistory({
        code: rawCode,
        name: 'Unrecognized',
        status: 'INVALID',
        timestamp: new Date()
      });
      startAutoResumeCountdown();
    } finally {
      setIsVerifying(false);
    }
  };

  const startAutoResumeCountdown = () => {
    setAutoResumeSec(4);
  };

  useEffect(() => {
    if (autoResumeSec === null) return;
    if (autoResumeSec <= 0) {
      resumeScanning();
      return;
    }

    const timer = setTimeout(() => {
      setAutoResumeSec(prev => (prev ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoResumeSec]);

  const resumeScanning = () => {
    setAutoResumeSec(null);
    setScanResult(null);
    setManualCode('');
    isScanningLocked.current = false;
  };

  const addToHistory = (entry) => {
    setScanHistory(prev => [entry, ...prev.slice(0, 9)]);
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (!manualCode.trim()) return;
    handleTicketVerification(manualCode.trim());
  };

  // Reset scan status for the current ticket
  const handleResetScan = async (code) => {
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      await axios.post(
        `${API_BASE_URL}/last-dance/admin/tickets/reset-scan`,
        { ticketCode: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resumeScanning();
    } catch (err) {
      console.error('Reset scan error:', err);
    }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-black/[0.08] pb-6">
        <div>
          <p className="text-[12px] font-medium text-[#762e99] uppercase tracking-wider">
            Gate Control &amp; Admission
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-normal tracking-[-0.02em] text-black mt-1">
            Ticket Gate Scanner
          </h1>
          <p className="text-[13px] text-black/50 mt-0.5">
            Scan attendee QR codes, verify authentic tickets, prevent duplicate admissions, and check in guests
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
            title={soundEnabled ? 'Mute sound chimes' : 'Unmute sound chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#762e99]" /> : <VolumeX className="w-4 h-4 text-black/40" />}
          </button>

          {!scannerActive ? (
            <button
              onClick={startCamera}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white text-[12px] font-semibold hover:opacity-95 shadow-sm transition"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera Scanner</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[12px] font-medium transition"
            >
              <CameraOff className="w-4 h-4" />
              <span>Pause Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl space-y-1 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Admitted Today
          </p>
          <p className="text-[28px] font-normal tracking-tight text-emerald-600 leading-none">
            {sessionStats.admitted}
          </p>
          <p className="text-[11px] text-black/40">Verified &amp; checked in passes</p>
        </div>

        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl space-y-1 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Duplicate / Rejected
          </p>
          <p className="text-[28px] font-normal tracking-tight text-rose-600 leading-none">
            {sessionStats.rejected}
          </p>
          <p className="text-[11px] text-black/40">Prevented unauthorized entries</p>
        </div>

        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl space-y-1 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Total Gate Scans
          </p>
          <p className="text-[28px] font-normal tracking-tight text-[#762e99] leading-none">
            {sessionStats.total}
          </p>
          <p className="text-[11px] text-black/40">Gate turnstile transactions</p>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Viewfinder or Scan Result Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white border border-black/[0.08] rounded-3xl p-6 shadow-sm overflow-hidden relative min-h-[380px] flex flex-col justify-center">
            
            {/* 1. Camera Viewfinder */}
            <div className={`${scanResult ? 'hidden' : 'block'} space-y-4`}>
              
              <div className="relative mx-auto w-full max-w-sm rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-black/10 shadow-inner">
                
                {/* HTML5 QR Code Mount Element */}
                <div id="qr-reader-viewport" className="w-full h-full" />

                {/* Laser Overlay when active */}
                {scannerActive && !isVerifying && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-lg">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/60 px-3 py-1 rounded-full mt-3">
                      Align QR Code within box
                    </span>
                  </div>
                )}

                {/* Inactive State Prompt */}
                {!scannerActive && (
                  <div className="text-center p-6 space-y-3 z-10">
                    <div className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto">
                      <QrCode className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-[14px] font-medium text-white">Camera Scanner Idle</p>
                    <p className="text-[11px] text-white/50 max-w-xs mx-auto">
                      Click below to turn on the camera, or enter the ticket code manually using the keyboard.
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white text-[12px] font-semibold hover:opacity-95 shadow-md transition"
                    >
                      Activate Camera
                    </button>
                  </div>
                )}

                {/* Loading / Verifying Indicator */}
                {isVerifying && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-20 space-y-2 text-white">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                    <p className="text-[13px] font-medium">Validating ticket pass...</p>
                  </div>
                )}

              </div>

              {cameraError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[12px] text-amber-800 text-center">
                  {cameraError}
                </div>
              )}
            </div>

            {/* 2. Verification HUD Result (Replaces camera view upon scan) */}
            {scanResult && (
              <div className="space-y-6 animate-scale-up text-center py-4">
                
                {/* Result Icon & Status Banner */}
                {scanResult.valid ? (
                  <div className="space-y-2">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Admission Granted &bull; Admit One
                    </span>
                    <h2 className="text-[26px] font-bold text-black tracking-tight">
                      {scanResult.buyer?.name || 'Valid Pass'}
                    </h2>
                  </div>
                ) : scanResult.alreadyScanned ? (
                  <div className="space-y-2">
                    <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                      <AlertTriangle className="w-12 h-12" />
                    </div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      Duplicate Scan &bull; Deny Entry
                    </span>
                    <h2 className="text-[24px] font-bold text-rose-600 tracking-tight">
                      Ticket Already Used!
                    </h2>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                      <XCircle className="w-12 h-12" />
                    </div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Invalid Admission
                    </span>
                    <h2 className="text-[22px] font-bold text-black tracking-tight">
                      {scanResult.message || 'Ticket Unrecognized'}
                    </h2>
                  </div>
                )}

                {/* Details Card */}
                <div className="bg-[#f7f7f7] border border-black/[0.06] rounded-2xl p-5 max-w-md mx-auto text-left text-[12px] space-y-2.5">
                  <div className="flex justify-between border-b border-black/[0.06] pb-2">
                    <span className="text-black/50">Ticket Code</span>
                    <span className="font-mono font-bold text-black">
                      {scanResult.ticket?.ticketCode || manualCode}
                    </span>
                  </div>
                  {scanResult.buyer?.name && (
                    <div className="flex justify-between border-b border-black/[0.06] pb-2">
                      <span className="text-black/50">Attendee</span>
                      <span className="font-semibold text-black">{scanResult.buyer.name}</span>
                    </div>
                  )}
                  {scanResult.buyer?.receipt && (
                    <div className="flex justify-between border-b border-black/[0.06] pb-2">
                      <span className="text-black/50">M-Pesa Receipt</span>
                      <span className="font-mono font-bold text-emerald-700">{scanResult.buyer.receipt}</span>
                    </div>
                  )}
                  {scanResult.scannedAt && (
                    <div className="flex justify-between">
                      <span className="text-black/50">Check-in Timestamp</span>
                      <span className="font-medium text-black">
                        {new Date(scanResult.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={resumeScanning}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white text-[12px] font-semibold hover:opacity-95 shadow-md transition"
                  >
                    <span>Scan Next Ticket</span>
                    {autoResumeSec !== null && (
                      <span className="ml-1 opacity-75">({autoResumeSec}s)</span>
                    )}
                  </button>

                  {scanResult.alreadyScanned && scanResult.ticket?.ticketCode && (
                    <button
                      onClick={() => handleResetScan(scanResult.ticket.ticketCode)}
                      title="Reset scan status for testing or supervisor authorization"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Status</span>
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Manual Entry Form / Barcode Gun Input */}
          <div className="bg-white border border-black/[0.08] rounded-3xl p-5 shadow-sm">
            <form onSubmit={handleManualSubmit} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-black/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter ticket code (e.g. LD-2026-1CBE4726) or M-Pesa receipt..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  disabled={isVerifying}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#f7f7f7] border border-black/[0.08] rounded-full text-[12px] font-mono focus:outline-none focus:border-[#762e99] focus:bg-white transition"
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying || !manualCode.trim()}
                className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-black/85 text-[12px] font-medium transition disabled:opacity-40"
              >
                Validate
              </button>
            </form>
            <p className="text-[10px] text-black/40 mt-2 px-3">
              Tip: Gate marshals using handheld USB or Bluetooth barcode scanner guns can scan directly into this input.
            </p>
          </div>

        </div>

        {/* Right Column: Gate Scanning Guidelines & Live Scan Log (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick Guide Card */}
          <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#762e99]" />
              <h3 className="font-semibold text-[13px] text-black">Gate Scanning Protocol</h3>
            </div>
            <ul className="text-[11.5px] text-black/55 space-y-2 pl-4 list-disc">
              <li>Guests can present the QR code on their smartphone screen or the printed offline pass.</li>
              <li>Each QR code can only be scanned once. Subsequent attempts trigger a duplicate warning.</li>
              <li>Verify the attendee's name against their Student ID or National ID if requested.</li>
            </ul>
          </div>

          {/* Recent Scans Feed */}
          <div className="bg-white border border-black/[0.08] rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <span className="font-semibold text-[13px] text-black">Live Activity Feed</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-black/40">Recent 10</span>
            </div>

            {scanHistory.length === 0 ? (
              <div className="py-8 text-center text-black/35 text-[12px]">
                No scans recorded in this session yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {scanHistory.map((item, idx) => {
                  const isAdmitted = item.status === 'ADMITTED';
                  const isDuplicate = item.status === 'DUPLICATE';

                  return (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#f7f7f7] border border-black/[0.04] text-[12px]"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-black">{item.name}</p>
                        <p className="font-mono text-[10px] text-black/40">{item.code}</p>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className={`inline-block text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isAdmitted 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : isDuplicate
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                        <p className="text-[10px] text-black/35">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
