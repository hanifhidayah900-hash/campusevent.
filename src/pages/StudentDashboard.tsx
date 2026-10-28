import React, { useState } from 'react';
import { 
  Calendar, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  GraduationCap, 
  Mail, 
  LogOut, 
  ExternalLink, 
  QrCode, 
  MapPin, 
  ArrowRight,
  Save,
  AlertCircle
} from 'lucide-react';
import { Profile, Registration, CampusEvent } from '../types/database';
import { CampusEventDB } from '../services/db';

interface StudentDashboardProps {
  currentUser: Profile;
  registrations: Registration[];
  events: CampusEvent[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onSelectEvent: (event: CampusEvent) => void;
  onViewTicket: (reg: Registration) => void;
  onProfileUpdated: (updatedUser: Profile) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  registrations,
  events,
  onNavigate,
  onLogout,
  onSelectEvent,
  onViewTicket,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'my-events' | 'tickets' | 'profile'>('overview');

  // Profile Edit State
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [studyProgram, setStudyProgram] = useState(currentUser.study_program || '');
  const [faculty, setFaculty] = useState(currentUser.faculty || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Student specific registrations
  const studentRegs = registrations.filter((r) => r.student_id === currentUser.id && r.status === 'confirmed');

  // Metrics
  const now = new Date();
  const attendedCount = studentRegs.filter((r) => Boolean(r.checked_in_at)).length;
  const upcomingEvents = studentRegs.filter((r) => {
    if (!r.event) return false;
    return new Date(r.event.start_at) >= now && r.event.status !== 'completed' && r.event.status !== 'cancelled';
  });
  const completedEvents = studentRegs.filter((r) => {
    if (!r.event) return false;
    return new Date(r.event.end_at) < now || r.event.status === 'completed';
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);

    try {
      const res = await CampusEventDB.updateStudentProfile(currentUser.id, {
        fullName,
        studyProgram,
        faculty,
      });

      if (res.success && res.user) {
        onProfileUpdated(res.user);
        setProfileMsg({ type: 'success', text: 'Data profil mahasiswa berhasil diperbarui.' });
      } else {
        setProfileMsg({ type: 'error', text: res.error || 'Gagal menyimpan pembaruan profil.' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0">
        
        {/* User Badge in Sidebar */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.full_name}</p>
              <p className="text-xs text-slate-400 font-mono">{currentUser.nim || 'Mahasiswa'}</p>
            </div>
          </div>
          <div className="mt-3 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Role:</span>
            <span className="font-semibold text-blue-400 capitalize">{currentUser.role}</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-3 space-y-1 flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Ringkasan</span>
          </button>

          <button
            onClick={() => setActiveTab('my-events')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'my-events'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4" />
              <span>Event Saya</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {studentRegs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'tickets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-4 h-4" />
              <span>Tiket Saya</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {studentRegs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Saya</span>
          </button>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('explore')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Jelajahi Event Lain</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>

      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-5 sm:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  PORTAL MAHASISWA
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Halo, {currentUser.full_name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Selamat datang di dashboard kemahasiswaan Anda. Pantau event terdaftar dan tiket digital di sini.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Event Diikuti</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                    {studentRegs.length}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Event Akan Datang</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tabular-nums mt-1">
                    {upcomingEvents.length}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Event Selesai</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-700 font-mono tabular-nums mt-1">
                    {completedEvents.length}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Kehadiran</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums mt-1">
                    {attendedCount}
                  </p>
                </div>
              </div>

              {/* Upcoming Event Preview or Empty State */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Event Terdaftar Mendatang</h3>
                  {studentRegs.length > 0 && (
                    <button
                      onClick={() => setActiveTab('my-events')}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Lihat Semua
                    </button>
                  )}
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((reg) => {
                      const ev = reg.event;
                      if (!ev) return null;
                      return (
                        <div
                          key={reg.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 gap-4"
                        >
                          <div>
                            <span className="text-[11px] font-semibold text-blue-600 block mb-0.5">
                              {ev.category?.name || 'Kegiatan'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{ev.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span>{new Date(ev.start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span>·</span>
                              <span>{ev.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => onViewTicket(reg)}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>E-Tiket</span>
                            </button>
                            <button
                              onClick={() => onSelectEvent(ev)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold transition-colors"
                            >
                              Detail
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Belum ada event mendatang yang terdaftar</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                      Temukan workshop dan seminar bermanfaat untuk mengisi portofolio Anda.
                    </p>
                    <button
                      onClick={() => onNavigate('explore')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      Jelajahi Event Sekarang
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MY EVENTS */}
          {activeTab === 'my-events' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Event Saya</h2>
                <p className="text-xs text-slate-500 mt-0.5">Daftar seluruh kegiatan kampus yang telah Anda daftarkan.</p>
              </div>

              {studentRegs.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-5 py-3.5">Nama Event & Kategori</th>
                          <th className="px-5 py-3.5">Waktu Pelaksanaan</th>
                          <th className="px-5 py-3.5">Lokasi</th>
                          <th className="px-5 py-3.5">Kehadiran</th>
                          <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {studentRegs.map((reg) => {
                          const ev = reg.event;
                          if (!ev) return null;
                          const isAttended = Boolean(reg.checked_in_at);

                          return (
                            <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-4 max-w-xs">
                                <p className="font-bold text-slate-900 line-clamp-1">{ev.name}</p>
                                <p className="text-[11px] text-blue-600 mt-0.5">{ev.category?.name || 'Kegiatan'}</p>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <p className="font-medium">
                                  {new Date(ev.start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {new Date(ev.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                </p>
                              </td>
                              <td className="px-5 py-4 max-w-[180px] truncate">
                                {ev.location}
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                {isAttended ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Hadir
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-500">
                                    <Clock className="w-3.5 h-3.5" /> Belum
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                                <button
                                  onClick={() => onViewTicket(reg)}
                                  className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
                                >
                                  Tiket QR
                                </button>
                                <button
                                  onClick={() => onSelectEvent(ev)}
                                  className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
                                >
                                  Detail
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">Belum Ada Event Terdaftar</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Jelajahi berbagai kegiatan menarik di kampus dan daftarkan diri Anda sekarang.
                  </p>
                  <button
                    onClick={() => onNavigate('explore')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Buka Katalog Event
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY TICKETS (Digital Ticket Grid) */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Tiket Digital Saya</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik tiket untuk melihat QR Code beresolusi tinggi, mencetak, atau menyimpan e-tiket.
                </p>
              </div>

              {studentRegs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentRegs.map((reg) => {
                    const ev = reg.event;
                    if (!ev) return null;
                    const isAttended = Boolean(reg.checked_in_at);

                    return (
                      <div
                        key={reg.id}
                        onClick={() => onViewTicket(reg)}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                              {ev.category?.name || 'Tiket Acara'}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {reg.ticket_token}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                            {ev.name}
                          </h3>

                          <div className="mt-3 space-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(ev.start_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          {isAttended ? (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Check-in
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-600" /> Siap Digunakan
                            </span>
                          )}

                          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                            Buka QR <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">Belum Ada Tiket</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Tiket digital akan otomatis diterbitkan begitu Anda mendaftar event kampus.
                  </p>
                  <button
                    onClick={() => onNavigate('explore')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Daftar Event Pertama
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-xl">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Profil Mahasiswa</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui informasi kontak dan data studi yang tertera pada e-tiket kegiatan Anda.
                </p>
              </div>

              {profileMsg && (
                <div
                  className={`mb-5 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NIM (Terkunci Sesuai Akun)
                    </label>
                    <input
                      type="text"
                      value={currentUser.nim || '-'}
                      disabled
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Role Pengguna
                    </label>
                    <input
                      type="text"
                      value={currentUser.role}
                      disabled
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-500 capitalize cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Mahasiswa (Terkunci Autentikasi)
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Program Studi *
                  </label>
                  <input
                    type="text"
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fakultas
                  </label>
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

    </div>
  );
};
