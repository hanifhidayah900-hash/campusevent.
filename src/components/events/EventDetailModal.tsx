import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Ticket, 
  Building, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { CampusEvent, Profile, Registration } from '../../types/database';
import { CampusEventDB } from '../../services/db';

interface EventDetailModalProps {
  event: CampusEvent | null;
  currentUser: Profile | null;
  userRegistrations: Registration[];
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onRegistrationSuccess: (reg: Registration) => void;
  onViewTicket: (reg: Registration) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  currentUser,
  userRegistrations,
  onClose,
  onOpenAuth,
  onRegistrationSuccess,
  onViewTicket,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!event) return null;

  const existingReg = currentUser
    ? userRegistrations.find((r) => r.event_id === event.id && r.status === 'confirmed')
    : undefined;

  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);
  const openDate = new Date(event.registration_open_at);
  const closeDate = new Date(event.registration_close_at);
  const now = new Date();

  const isRegistrationNotOpenYet = now < openDate;
  const isRegistrationClosed = now > closeDate || event.status === 'registration_closed';
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';

  const registeredCount = event.registered_count || 0;
  const remainingQuota = Math.max(0, event.quota - registeredCount);
  const isFull = remainingQuota <= 0;

  const handleRegister = async () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }

    if (currentUser.role === 'admin') {
      setErrorMessage('Akun Admin tidak dapat mendaftar sebagai peserta event.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = CampusEventDB.registerForEvent(currentUser.id, event.id);
      if (result.success && result.registration) {
        onRegistrationSuccess(result.registration);
      } else {
        setErrorMessage(result.error || 'Pendaftaran gagal diproses.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Banner Media & Close Button */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={event.banner_url}
            alt={event.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-full backdrop-blur transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              {event.category?.name || 'Kegiatan Kampus'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {event.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Key Facts Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Waktu Pelaksanaan</p>
                <p>
                  {startDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-slate-500 font-mono">
                  {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Lokasi Acara</p>
                <p className="text-slate-600">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Batas Pendaftaran</p>
                <p className="text-slate-600">
                  s.d. {closeDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} (23:59 WIB)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Kapasitas Kuota</p>
                <p className="tabular-nums font-mono text-slate-600">
                  {registeredCount} terdaftar / {event.quota} kuota ({remainingQuota} kursi tersisa)
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Deskripsi Lengkap Acara</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Special Status Notices */}
          {isCancelled && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold">Event Dibatalkan</p>
                <p className="text-red-700">Acara ini telah dibatalkan oleh pihak kampus. Pendaftaran tidak lagi diterima.</p>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>Event ini telah selesai diselenggarakan. Terima kasih atas partisipasi peserta.</span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-3">
            {/* If user is already registered */}
            {existingReg ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewTicket(existingReg);
                }}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                <span>Lihat Tiket QR Code Saya</span>
              </button>
            ) : isCancelled ? (
              <span className="text-xs text-red-600 font-semibold">Event Dibatalkan</span>
            ) : isCompleted ? (
              <span className="text-xs text-slate-500 font-semibold">Event Telah Selesai</span>
            ) : isRegistrationNotOpenYet ? (
              <span className="text-xs text-amber-600 font-medium">
                Pendaftaran buka {openDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            ) : isRegistrationClosed ? (
              <span className="text-xs text-slate-500 font-semibold">Pendaftaran Telah Ditutup</span>
            ) : isFull ? (
              <span className="text-xs text-amber-700 font-semibold">Kuota Sudah Terpenuhi</span>
            ) : !currentUser ? (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors"
              >
                <span>Masuk untuk Mendaftar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleRegister}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Memproses...' : 'Daftar Event Ini Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
