import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Building, 
  User, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Registration } from '../../types/database';

interface TicketModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ registration, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (!registration) return;

    if (canvasRef.current) {
      // Generate standard high-contrast QR Code with safe token only
      QRCode.toCanvas(
        canvasRef.current,
        registration.ticket_token,
        {
          width: 180,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) {
            console.error('Gagal generate QR Code:', error);
          } else {
            setQrGenerated(true);
          }
        }
      );
    }
  }, [registration]);

  if (!registration) return null;

  const event = registration.event;
  const student = registration.student;

  const startDate = event ? new Date(event.start_at) : null;
  const isCheckedIn = Boolean(registration.checked_in_at);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Modal Top Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide uppercase">E-Tiket Resmi Terverifikasi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div id="printable-ticket" className="p-6 bg-slate-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            
            {/* Header Ticket Strip */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] tracking-wider uppercase font-semibold text-blue-200">
                  CampusEvent · E-Ticket
                </span>
                <span className="text-xs font-mono font-bold tracking-wider text-blue-200">
                  {registration.ticket_token}
                </span>
              </div>
              <h3 className="text-lg font-bold leading-tight line-clamp-2">
                {event?.name || 'Tiket Acara Kampus'}
              </h3>
              <p className="text-xs text-blue-200 mt-1">
                {event?.category?.name || 'Kegiatan Kampus'}
              </p>
            </div>

            {/* Perforated Divider Styling */}
            <div className="relative flex items-center justify-between px-4 py-2 border-y border-dashed border-slate-200 bg-slate-50">
              <div className="w-4 h-4 rounded-full bg-slate-50 -ml-6 border-r border-slate-200" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                Tunjukkan QR Code ini di meja check-in
              </span>
              <div className="w-4 h-4 rounded-full bg-slate-50 -mr-6 border-l border-slate-200" />
            </div>

            {/* Ticket Content Grid */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-inner">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded" />
                <p className="mt-2 text-[10px] font-mono text-slate-500 font-semibold text-center">
                  {registration.ticket_token}
                </p>
              </div>

              {/* Attendee Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Nama Peserta</span>
                  <p className="font-bold text-slate-900 text-sm">{student?.full_name || 'Mahasiswa'}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">NIM / Program Studi</span>
                  <p className="font-mono text-slate-700">{student?.nim || '-'} · {student?.study_program || '-'}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Waktu Acara</span>
                  <p className="font-medium text-slate-800">
                    {startDate ? startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                  <p className="text-slate-500 font-mono">
                    {startDate ? startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Lokasi</span>
                  <p className="text-slate-700 leading-snug line-clamp-2">{event?.location || 'Kampus'}</p>
                </div>

                {/* Status Attendance Badge */}
                <div className="pt-1">
                  {isCheckedIn ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sudah Check-in ({new Date(registration.checked_in_at!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Menunggu Check-in</span>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Bottom Security Note */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
              <span>Status: Terkonfirmasi</span>
              <span>ID: {registration.id.slice(0, 10)}</span>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls (Hidden during print) */}
        <div className="no-print p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Simpan screenshot atau cetak tiket untuk dibawa ke lokasi acara.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
