import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Keyboard, 
  RefreshCw,
  User,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { CampusEventDB } from '../../services/db';
import { CheckInResult, CampusEvent } from '../../types/database';

interface QrScannerModalProps {
  isOpen: boolean;
  events: CampusEvent[];
  selectedEventId?: string;
  onClose: () => void;
  onCheckInCompleted: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  events,
  selectedEventId,
  onClose,
  onCheckInCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [targetEventId, setTargetEventId] = useState(selectedEventId || '');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    if (selectedEventId) {
      setTargetEventId(selectedEventId);
    }
  }, [selectedEventId]);

  // Start Camera
  const startScanner = async () => {
    setCameraError(null);
    setCheckInResult(null);

    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (_) {}
      }

      const qrScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Ignore frequent frame scan errors
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Silakan berikan izin akses kamera di browser Anda, atau gunakan tab "Input Kode Manual" di bawah.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        console.warn('Camera stop error:', e);
      }
      html5QrCodeRef.current = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab]);

  const handleScanSuccess = (token: string) => {
    if (processing) return;
    setProcessing(true);

    try {
      const result = CampusEventDB.validateAndCheckIn(token, targetEventId || undefined);
      setCheckInResult(result);
      if (result.success) {
        onCheckInCompleted();
      }
    } finally {
      setTimeout(() => {
        setProcessing(false);
      }, 1500);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setProcessing(true);
    try {
      const result = CampusEventDB.validateAndCheckIn(manualCode.trim(), targetEventId || undefined);
      setCheckInResult(result);
      if (result.success) {
        setManualCode('');
        onCheckInCompleted();
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Pemindai Tiket QR & Check-In</h3>
              <p className="text-xs text-slate-400">Verifikasi kehadiran peserta secara instan</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Scope Filter Selector */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Validasi untuk Event Tertentu (Opsional)
          </label>
          <select
            value={targetEventId}
            onChange={(e) => setTargetEventId(e.target.value)}
            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Event (Deteksi Otomatis dari Tiket)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.category?.name})
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'camera'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Kamera Pemindai QR</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'manual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Input Kode Manual</span>
          </button>
        </div>

        {/* Scanner Content Area */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {activeTab === 'camera' ? (
            <div className="flex flex-col items-center">
              <div
                id={scannerContainerId}
                className="w-full max-w-sm aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-300 relative shadow-inner"
              />
              
              {cameraError && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-semibold">Izin Kamera Diperlukan</p>
                    <p>{cameraError}</p>
                    <button
                      onClick={startScanner}
                      className="mt-2 text-blue-700 underline font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
                    </button>
                  </div>
                </div>
              )}

              <p className="mt-2 text-xs text-slate-500 text-center">
                Arahkan kamera ke QR Code tiket mahasiswa untuk memvalidasi kehadiran secara otomatis.
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masukkan Kode Tiket Peserta
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Contoh: TK-SEMI-8201-9X2F"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono uppercase"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Kode tiket tertera tepat di bawah gambar QR Code pada e-tiket mahasiswa.
                </p>
              </div>

              <button
                type="submit"
                disabled={processing || !manualCode.trim()}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? 'Memeriksa...' : 'Validasi Tiket & Catat Kehadiran'}
              </button>
            </form>
          )}

          {/* Validation Result Box */}
          {checkInResult && (
            <div
              className={`p-4 rounded-xl border animate-scale-up ${
                checkInResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : checkInResult.code === 'ALREADY_CHECKED_IN'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {checkInResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : checkInResult.code === 'ALREADY_CHECKED_IN' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1 text-xs">
                  <p className="font-bold text-sm">{checkInResult.message}</p>
                  
                  {checkInResult.registration && (
                    <div className="pt-2 border-t border-slate-200/60 mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold">
                          {checkInResult.registration.student?.full_name} ({checkInResult.registration.student?.nim || '-'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{checkInResult.registration.event?.name}</span>
                      </div>
                      {checkInResult.checkedInAt && (
                        <p className="font-mono text-[11px] text-slate-600 pt-1">
                          Waktu Kehadiran: {new Date(checkInResult.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Validasi Database PostgreSQL & Token Hash
          </span>
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
