import React from 'react';
import { Calendar, Mail, MapPin, Phone, Shield } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CampusEvent</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem pendaftaran kegiatan dan seminar kampus terintegrasi berbasis tiket digital QR Code, validasi kehadiran instan, dan pelaporan terpadu.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Sistem Aktif & Terlindungi RLS</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-blue-400 transition-colors">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-blue-400 transition-colors">
                  Jelajahi Event
                </button>
              </li>
              <li>
                <a href="#tentang" className="hover:text-blue-400 transition-colors">
                  Tentang Platform
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-400 transition-colors">
                  Pusat Bantuan & FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Kategori Event</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Seminar & Konferensi</li>
              <li>Workshop & Praktikum</li>
              <li>Pelatihan Sertifikasi</li>
              <li>Kompetisi Mahasiswa</li>
              <li>Kegiatan Organisasi & Ormawa</li>
            </ul>
          </div>

          {/* Contact / Helpdesk */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Layanan Informasi</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Gedung Pusat Layanan Kemahasiswaan & Administrasi Kampus</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>event-support@campusevent.ac.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>(021) 7890-1234 ext. 402</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusEvent. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Keamanan Data & Privasi Mahasiswa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
