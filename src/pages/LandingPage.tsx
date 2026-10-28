import React, { useState } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Ticket, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  GraduationCap, 
  QrCode,
  Layers,
  Award
} from 'lucide-react';
import { CampusEvent, Category, DashboardStats } from '../types/database';
import { EventCard } from '../components/events/EventCard';

interface LandingPageProps {
  stats: DashboardStats;
  events: CampusEvent[];
  categories: Category[];
  onNavigate: (view: string, filterCategoryId?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectEvent: (event: CampusEvent) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  stats,
  events,
  categories,
  onNavigate,
  onOpenAuth,
  onSelectEvent,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredEvents = events
    .filter((e) => e.status === 'active' && e.is_published)
    .slice(0, 3);

  const faqs = [
    {
      q: 'Bagaimana cara mendaftar event di CampusEvent?',
      a: 'Mahasiswa cukup membuat akun menggunakan NIM dan email kampus yang valid, memilih event yang diminati di halaman Jelajahi Event, lalu menekan tombol "Daftar Event". Sistem akan secara otomatis memverifikasi ketersediaan kuota dan menerbitkan e-tiket digital.',
    },
    {
      q: 'Apakah saya akan langsung mendapatkan tiket dengan QR Code?',
      a: 'Ya! Setiap pendaftaran yang berhasil diverifikasi langsung mendapatkan tiket digital unik yang dilengkapi kode token aman dan QR Code. Tiket ini dapat dibuka kapan saja melalui menu "Tiket Saya" di Dashboard Mahasiswa atau dicetak sebagai PDF.',
    },
    {
      q: 'Bagaimana proses check-in kehadiran di lokasi acara?',
      a: 'Saat tiba di lokasi acara, tunjukkan QR Code pada e-tiket Anda kepada administrator atau panitia di meja registrasi. Admin akan memindai QR Code tersebut secara langsung menggunakan pemindai kamera untuk memvalidasi kehadiran Anda secara instan.',
    },
    {
      q: 'Apa yang terjadi jika kuota pendaftaran event sudah penuh?',
      a: 'Sistem CampusEvent menerapkan kontrol kuota transaksi atomik. Jika kuota telah terpenuhi, tombol pendaftaran akan otomatis dinonaktifkan dan menampilkan informasi bahwa kuota penuh untuk mencegah kelebihan kapasitas.',
    },
    {
      q: 'Apakah saya bisa membatalkan pendaftaran event?',
      a: 'Jika Anda berhalangan hadir, Anda dapat menghubungi admin kampus melalui saluran layanan informasi yang tersedia di bagian footer agar kuota dapat dialokasikan kembali untuk mahasiswa lain.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Unboxed clean metadata kicker (anti-slop) */}
              <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold tracking-wide">
                <span>PORTAL RESMI EVENT KAMPUS</span>
                <span aria-hidden="true">·</span>
                <span>TERVERIFIKASI RISTEK & KEMAHASISWAAN</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
                Temukan Event Kampus, Perluas Pengalamanmu.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Jelajahi seminar, workshop, pelatihan, dan berbagai kegiatan kampus. Daftar dengan mudah dan simpan tiket digitalmu dalam satu platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('explore')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Jelajahi Event</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>E-Tiket & QR Code Otomatis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Check-in Cepat & Akurat</span>
                </div>
              </div>

            </div>

            {/* Right Media Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-800 aspect-[4/3] group">
                <img
                  src="/src/assets/images/campus_event_hero_1793162410963.jpg"
                  alt="Kegiatan Mahasiswa di Kampus"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
                
                {/* Floating Preview Ticket Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 text-white shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Tiket Digital Terintegrasi</p>
                      <p className="text-[11px] text-slate-400">Cukup tunjukkan kode QR saat check-in</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                    TERVERIFIKASI
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS SECTION (Database Grounded) */}
      <section className="bg-slate-800/90 border-y border-slate-700 py-8 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono tabular-nums">
                {stats.totalEvents}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Total Event Kampus</p>
            </div>

            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                {stats.totalStudents}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Mahasiswa Terdaftar</p>
            </div>

            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">
                {stats.totalRegistrations}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Pendaftaran Berhasil</p>
            </div>

            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono tabular-nums">
                {stats.completedEvents}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Event Telah Selesai</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED EVENTS SECTION */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                PILIHAN TERBAIK MINGGU INI
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Event Kampus Unggulan
              </h2>
            </div>
            
            <button
              onClick={() => onNavigate('explore')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Lihat Semua ({events.length}) Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={onSelectEvent}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Belum Ada Event Aktif</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Admin sedang menyiapkan jadwal event menarik berikutnya. Silakan cek kembali dalam waktu dekat.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* 4. CATEGORIES SECTION */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kategori Kegiatan Kampus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Pilih kategori kegiatan yang sesuai dengan minat dan pengembangan karir akademikmu.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const count = events.filter((e) => e.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('explore', cat.id)}
                  className="flex flex-col items-center text-center p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-slate-600 mt-1 font-mono tabular-nums">
                    {count} Event
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CARA KERJA (3 LANGKAH MUDAH) */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              PROSES SEDERHANA & CEPAT
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cara Mengikuti Event di Kampus
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Hanya butuh tiga langkah mudah untuk mendaftar dan hadir di acara impianmu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-start space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                01
              </div>
              <h3 className="text-base font-bold text-white">Temukan Event yang Menarik</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Jelajahi berbagai seminar, workshop teknologi, dan kompetisi bergengsi. Periksa jadwal, lokasi, narasumber, dan kapasitas kuota.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-start space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                02
              </div>
              <h3 className="text-base font-bold text-white">Daftar dengan Akun Mahasiswa</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Masuk menggunakan akun mahasiswa ber-NIM resmi. Klik daftar dalam satu sentuhan, dan e-tiket digitalmu otomatis diterbitkan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-start space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                03
              </div>
              <h3 className="text-base font-bold text-white">Tunjukkan QR Code saat Check-in</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tunjukkan QR Code pada smartphone Anda saat tiba di lokasi. Panitia memindai kode dalam hitungan detik dan kehadiranmu langsung tercatat.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. TENTANG PLATFORM */}
      <section id="tentang" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                TENTANG CAMPUSEVENT
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                Platform Terpadu Kegiatan Mahasiswa Modern
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                CampusEvent dirancang untuk mendigitalkan seluruh ekosistem kegiatan di kampus. Menggantikan proses registrasi manual yang rentan antrean dan kekeliruan data dengan sistem tiket digital ber-QR Code, kontrol kuota real-time, dan pelaporan berbasis PostgreSQL.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mencegah pendaftaran ganda & kelebihan kuota secara atomik</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Validasi kehadiran offline & online dengan kamera QR</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pemisahan hak akses ketat: Mahasiswa & Admin</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Dirancang Khusus untuk Kampus</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aplikasi ini hanya memiliki 2 role: <strong>Mahasiswa</strong> untuk pendaftaran dan tiket, serta <strong>Admin</strong> untuk seluruh manajemen event, peserta, pemindaian QR check-in, dan ekspor laporan ke CSV.
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-medium">
                Tip: Penguji atau pengembang dapat mencoba login langsung menggunakan opsi Demo Mahasiswa atau Demo Admin di menu masuk.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Informasi lengkap seputar pendaftaran, e-tiket, kuota, dan check-in kehadiran.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
