import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Layers, 
  Users, 
  QrCode, 
  FileText, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Database,
  User,
  LogOut,
  Building2,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  CampusEvent, 
  Category, 
  Profile, 
  Registration, 
  DashboardStats 
} from '../types/database';
import { CampusEventDB } from '../services/db';

interface AdminDashboardProps {
  currentUser: Profile;
  stats: DashboardStats;
  events: CampusEvent[];
  categories: Category[];
  registrations: Registration[];
  students: Profile[];
  onLogout: () => void;
  onRefreshData: () => void;
  onOpenEventModal: (event?: CampusEvent) => void;
  onOpenCategoryModal: (cat?: Category) => void;
  onOpenQrScanner: (eventId?: string) => void;
  onOpenDbSettings: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  stats,
  events,
  categories,
  registrations,
  students,
  onLogout,
  onRefreshData,
  onOpenEventModal,
  onOpenCategoryModal,
  onOpenQrScanner,
  onOpenDbSettings,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'events' | 'categories' | 'students' | 'registrations' | 'reports' | 'profile'
  >('overview');

  // Search & Filter States
  const [eventSearch, setEventSearch] = useState('');
  const [eventCatFilter, setEventCatFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [regSearch, setRegSearch] = useState('');
  const [regEventFilter, setRegEventFilter] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('all');

  // Event participant drill-down modal state
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState<CampusEvent | null>(null);

  // Notifications
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // --- CHART DATA COMPUTATIONS ---

  // 1. Attendance & Registration per Event
  const eventAttendanceChartData = useMemo(() => {
    return events.slice(0, 6).map((e) => {
      const confirmed = registrations.filter((r) => r.event_id === e.id && r.status === 'confirmed');
      const attended = confirmed.filter((r) => Boolean(r.checked_in_at));
      return {
        name: e.name.length > 20 ? e.name.substring(0, 18) + '...' : e.name,
        terdaftar: confirmed.length,
        hadir: attended.length,
        kuota: e.quota,
      };
    });
  }, [events, registrations]);

  // 2. Events by Category Pie Chart
  const categoryChartData = useMemo(() => {
    const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#1e40af'];
    return categories.map((c, i) => {
      const count = events.filter((e) => e.category_id === c.id).length;
      return {
        name: c.name,
        value: count,
        color: COLORS[i % COLORS.length],
      };
    }).filter((item) => item.value > 0);
  }, [categories, events]);

  // --- ACTIONS ---

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;
    const res = CampusEventDB.deleteEvent(eventId);
    if (res.success) {
      showNotice('success', 'Event berhasil dihapus.');
      onRefreshData();
    } else {
      showNotice('error', res.error || 'Gagal menghapus event.');
    }
  };

  const handleToggleCancelEvent = (event: CampusEvent) => {
    const newStatus = event.status === 'cancelled' ? 'active' : 'cancelled';
    const actionLabel = newStatus === 'cancelled' ? 'membatalkan' : 'mengaktifkan kembali';
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} event "${event.name}"?`)) return;

    const res = CampusEventDB.updateEventStatus(event.id, newStatus);
    if (res.success) {
      showNotice('success', `Status event berhasil diubah menjadi: ${newStatus}`);
      onRefreshData();
    } else {
      showNotice('error', res.error || 'Gagal mengubah status event.');
    }
  };

  const handleDeleteCategory = (catId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    const res = CampusEventDB.deleteCategory(catId);
    if (res.success) {
      showNotice('success', 'Kategori berhasil dihapus.');
      onRefreshData();
    } else {
      showNotice('error', res.error || 'Gagal menghapus kategori.');
    }
  };

  // CSV Export for Reports
  const handleExportCSV = () => {
    const filteredRegs = registrations.filter((r) => {
      if (regEventFilter && r.event_id !== regEventFilter) return false;
      if (regStatusFilter === 'attended' && !r.checked_in_at) return false;
      if (regStatusFilter === 'not-attended' && r.checked_in_at) return false;
      return true;
    });

    const headers = [
      'ID Pendaftaran',
      'Kode Tiket',
      'Nama Peserta',
      'NIM',
      'Email',
      'Program Studi',
      'Nama Event',
      'Tanggal Event',
      'Waktu Pendaftaran',
      'Status Kehadiran',
      'Waktu Check-In',
    ];

    const rows = filteredRegs.map((r) => [
      `"${r.id}"`,
      `"${r.ticket_token}"`,
      `"${r.student?.full_name || '-'}"`,
      `"${r.student?.nim || '-'}"`,
      `"${r.student?.email || '-'}"`,
      `"${r.student?.study_program || '-'}"`,
      `"${r.event?.name || '-'}"`,
      `"${r.event ? new Date(r.event.start_at).toLocaleDateString('id-ID') : '-'}"`,
      `"${new Date(r.registered_at).toLocaleString('id-ID')}"`,
      `"${r.checked_in_at ? 'Hadir' : 'Belum Hadir'}"`,
      `"${r.checked_in_at ? new Date(r.checked_in_at).toLocaleString('id-ID') : '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_CampusEvent_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0">
        
        {/* Brand & Admin Badge */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.full_name}</p>
              <p className="text-xs text-blue-400 font-medium">Administrator Kampus</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Akses Otoritas:</span>
            <span className="font-mono text-emerald-400">Full System CRUD</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Statistik</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4" />
              <span>Manajemen Event</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" />
              <span>Kategori Event</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Data Mahasiswa</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('registrations')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'registrations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4" />
              <span>Pendaftaran Peserta</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {registrations.length}
            </span>
          </button>

          {/* Direct Scan QR Button */}
          <div className="pt-2 pb-2">
            <button
              onClick={() => onOpenQrScanner()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Check-In</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Laporan & Ekspor CSV</span>
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
            <span>Profil Admin</span>
          </button>
        </nav>

        {/* Sidebar Footer with DB Config & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={onOpenDbSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Koneksi Supabase SQL</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun Admin</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Flash Notice */}
          {actionNotice && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {actionNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">{actionNotice.text}</span>
              </div>
              <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW & STATS & CHARTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    PANEL PUSAT KONTROL ADMIN
                  </p>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Statistik & Metrik Kegiatan Kampus
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data real-time terhubung langsung dengan tabel PostgreSQL database.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onOpenQrScanner()}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan Check-In</span>
                  </button>
                  <button
                    onClick={() => onOpenEventModal()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Event Baru</span>
                  </button>
                </div>
              </div>

              {/* 6 Key Performance Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500">Total Event</span>
                  <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                    {stats.totalEvents}
                  </p>
                  <span className="text-[10px] text-slate-600 mt-1 block">Tercatat di sistem</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500">Event Aktif</span>
                  <p className="text-2xl font-extrabold text-blue-600 font-mono tabular-nums mt-1">
                    {stats.activeEvents}
                  </p>
                  <span className="text-[10px] text-blue-700 mt-1 block">Buka pendaftaran</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500">Mahasiswa</span>
                  <p className="text-2xl font-extrabold text-slate-800 font-mono tabular-nums mt-1">
                    {stats.totalStudents}
                  </p>
                  <span className="text-[10px] text-slate-600 mt-1 block">Akun terdaftar</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500">Pendaftaran</span>
                  <p className="text-2xl font-extrabold text-indigo-600 font-mono tabular-nums mt-1">
                    {stats.totalRegistrations}
                  </p>
                  <span className="text-[10px] text-slate-600 mt-1 block">Tiket terbit</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500">Peserta Hadir</span>
                  <p className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums mt-1">
                    {stats.totalAttended}
                  </p>
                  <span className="text-[10px] text-emerald-700 mt-1 block">Scan QR tervalidasi</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500">% Kehadiran</span>
                  <p className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums mt-1">
                    {stats.attendanceRate}%
                  </p>
                  <span className="text-[10px] text-slate-600 mt-1 block">Rasio kehadiran</span>
                </div>
              </div>

              {/* Recharts Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Chart 1: Registrations & Attendance Per Event */}
                <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Peserta & Kehadiran per Event</h3>
                      <p className="text-[11px] text-slate-500">Perbandingan kuota, pendaftar, dan kehadiran nyata</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventAttendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="terdaftar" name="Terdaftar" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Category Distribution */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Distribusi Kategori Event</h3>
                    <p className="text-[11px] text-slate-500">Komposisi tema kegiatan yang diselenggarakan</p>
                  </div>

                  <div className="h-52 w-full my-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px]">
                    {categoryChartData.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="truncate max-w-[140px]">{c.name}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900">{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MANAJEMEN EVENT (CRUD LENGKAP) */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Event Kampus</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Kelola seluruh jadwal acara, kuota peserta, dan status publikasi.</p>
                </div>

                <button
                  onClick={() => onOpenEventModal()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Event Baru</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Cari event berdasarkan judul atau lokasi..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <select
                  value={eventCatFilter}
                  onChange={(e) => setEventCatFilter(e.target.value)}
                  className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Event Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Nama Event</th>
                        <th className="px-5 py-3.5">Kategori</th>
                        <th className="px-5 py-3.5">Jadwal Acara</th>
                        <th className="px-5 py-3.5">Kuota / Pendaftar</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {events
                        .filter((e) => {
                          if (eventCatFilter && e.category_id !== eventCatFilter) return false;
                          if (eventSearch.trim() && !e.name.toLowerCase().includes(eventSearch.toLowerCase())) return false;
                          return true;
                        })
                        .map((ev) => {
                          const regCount = ev.registered_count || 0;
                          const isFull = regCount >= ev.quota;

                          return (
                            <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-4 max-w-xs">
                                <p className="font-bold text-slate-900 line-clamp-1">{ev.name}</p>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{ev.location}</p>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <span className="font-semibold text-blue-600">{ev.category?.name || '-'}</span>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <p className="font-medium">
                                  {new Date(ev.start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {new Date(ev.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                </p>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap font-mono tabular-nums">
                                <span className={isFull ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                                  {regCount} / {ev.quota}
                                </span>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                {ev.status === 'active' ? (
                                  <span className="text-emerald-700 font-medium">Buka</span>
                                ) : ev.status === 'completed' ? (
                                  <span className="text-slate-500 font-medium">Selesai</span>
                                ) : ev.status === 'cancelled' ? (
                                  <span className="text-red-600 font-bold">Dibatalkan</span>
                                ) : (
                                  <span className="text-slate-600 font-medium">{ev.status}</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                                <button
                                  onClick={() => setSelectedEventForParticipants(ev)}
                                  title="Lihat daftar peserta terdaftar"
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                                >
                                  Peserta ({regCount})
                                </button>
                                <button
                                  onClick={() => onOpenEventModal(ev)}
                                  title="Edit informasi event"
                                  className="p-1 rounded text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleCancelEvent(ev)}
                                  title={ev.status === 'cancelled' ? 'Aktifkan Kembali' : 'Batalkan Event'}
                                  className="p-1 rounded text-amber-600 hover:bg-amber-50"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  title="Hapus event"
                                  className="p-1 rounded text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MANAJEMEN KATEGORI */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Kategori Kegiatan</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Kelola kategori dan klasifikasi tema acara kampus.</p>
                </div>

                <button
                  onClick={() => onOpenCategoryModal()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kategori</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c) => {
                  const usedCount = events.filter((e) => e.category_id === c.id).length;

                  return (
                    <div key={c.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-400">/{c.slug}</span>
                          <span className="text-[11px] font-mono tabular-nums bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {usedCount} Event Terkait
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-2">{c.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {c.description || 'Tidak ada deskripsi'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenCategoryModal(c)}
                          className="px-2.5 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="px-2.5 py-1 text-xs rounded text-red-600 hover:bg-red-50 font-semibold"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 4: DATA MAHASISWA */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Data Akun Mahasiswa</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Daftar mahasiswa terdaftar, NIM, program studi, dan keikutsertaan event.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Cari nama, NIM, atau email..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Nama & NIM Mahasiswa</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Program Studi / Fakultas</th>
                        <th className="px-5 py-3.5">Event Diikuti</th>
                        <th className="px-5 py-3.5">Tanggal Terdaftar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {students
                        .filter((s) => {
                          if (!studentSearch.trim()) return true;
                          const q = studentSearch.toLowerCase();
                          return (
                            s.full_name.toLowerCase().includes(q) ||
                            (s.nim && s.nim.toLowerCase().includes(q)) ||
                            s.email.toLowerCase().includes(q)
                          );
                        })
                        .map((st) => {
                          const userRegs = registrations.filter((r) => r.student_id === st.id && r.status === 'confirmed');

                          return (
                            <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-4">
                                <p className="font-bold text-slate-900">{st.full_name}</p>
                                <p className="text-[11px] text-blue-600 font-mono mt-0.5">{st.nim || '-'}</p>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                                {st.email}
                              </td>
                              <td className="px-5 py-4">
                                <p className="font-medium text-slate-800">{st.study_program || '-'}</p>
                                <p className="text-[11px] text-slate-400">{st.faculty || '-'}</p>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap font-mono tabular-nums">
                                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                  {userRegs.length} Event
                                </span>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                                {new Date(st.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: PENDAFTARAN PESERTA & TIKET */}
          {activeTab === 'registrations' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pendaftaran & Tiket Peserta</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Seluruh tiket digital yang terbit, kode token unik, dan status kehadiran.</p>
                </div>

                <button
                  onClick={() => onOpenQrScanner()}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors self-start"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR Check-In</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    placeholder="Cari token tiket, nama peserta, atau NIM..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <select
                  value={regEventFilter}
                  onChange={(e) => setRegEventFilter(e.target.value)}
                  className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Semua Event</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <select
                  value={regStatusFilter}
                  onChange={(e) => setRegStatusFilter(e.target.value)}
                  className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">Semua Status Hadir</option>
                  <option value="attended">Sudah Check-In</option>
                  <option value="not-attended">Belum Check-In</option>
                </select>
              </div>

              {/* Registrations Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Token Tiket</th>
                        <th className="px-5 py-3.5">Nama & NIM Peserta</th>
                        <th className="px-5 py-3.5">Event Kampus</th>
                        <th className="px-5 py-3.5">Waktu Daftar</th>
                        <th className="px-5 py-3.5">Status Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {registrations
                        .filter((r) => {
                          if (regEventFilter && r.event_id !== regEventFilter) return false;
                          if (regStatusFilter === 'attended' && !r.checked_in_at) return false;
                          if (regStatusFilter === 'not-attended' && r.checked_in_at) return false;
                          if (regSearch.trim()) {
                            const q = regSearch.toLowerCase();
                            const matchToken = r.ticket_token.toLowerCase().includes(q);
                            const matchName = r.student?.full_name.toLowerCase().includes(q);
                            const matchNim = r.student?.nim && r.student.nim.toLowerCase().includes(q);
                            if (!matchToken && !matchName && !matchNim) return false;
                          }
                          return true;
                        })
                        .map((reg) => (
                          <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                {reg.ticket_token}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900">{reg.student?.full_name || 'Mahasiswa'}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{reg.student?.nim || '-'} · {reg.student?.study_program || '-'}</p>
                            </td>
                            <td className="px-5 py-4 max-w-xs">
                              <p className="font-medium text-slate-800 line-clamp-1">{reg.event?.name || '-'}</p>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                              {new Date(reg.registered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ({new Date(reg.registered_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              {reg.checked_in_at ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Hadir ({new Date(reg.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-slate-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  Belum Check-In
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: LAPORAN & EKSPOR CSV */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Laporan Pendaftaran & Kehadiran</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Rekapitulasi resmi tingkat partisipasi mahasiswa dan ekspor data ke spreadsheet CSV.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Laporan</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ekspor CSV</span>
                  </button>
                </div>
              </div>

              {/* Event Attendance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((ev) => {
                  const evRegs = registrations.filter((r) => r.event_id === ev.id && r.status === 'confirmed');
                  const attended = evRegs.filter((r) => Boolean(r.checked_in_at)).length;
                  const rate = evRegs.length > 0 ? Math.round((attended / evRegs.length) * 100) : 0;

                  return (
                    <div key={ev.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                          {ev.category?.name}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{ev.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(ev.start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Pendaftar / Kuota:</span>
                          <span className="font-mono font-bold text-slate-900">{evRegs.length} / {ev.quota}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Peserta Hadir:</span>
                          <span className="font-mono font-bold text-emerald-600">{attended} ({rate}%)</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 7: PROFIL ADMIN */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-xl">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Profil Administrator</h2>
                <p className="text-xs text-slate-500 mt-0.5">Identitas otoritas pengelola sistem kegiatan kampus.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Nama Administrator</span>
                  <p className="text-sm font-bold text-slate-900">{currentUser.full_name}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Email Akun Admin</span>
                  <p className="font-mono text-slate-700">{currentUser.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Unit Pengelola</span>
                  <p className="text-slate-800">{currentUser.study_program || 'Biro Kemahasiswaan'}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Role Keamanan</span>
                  <p className="font-mono text-emerald-700 font-bold uppercase">{currentUser.role}</p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Sesuai prinsip keamanan sistem CampusEvent, akun admin pertama dibuat melalui mekanisme administrasi tepercaya (seed/migrasi) dan tidak dapat didaftarkan lewat form registrasi publik.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Drill-down Participant Modal for a Specific Event */}
      {selectedEventForParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <h3 className="text-sm font-bold">Daftar Peserta: {selectedEventForParticipants.name}</h3>
                <p className="text-[11px] text-slate-400">Total terdaftar: {selectedEventForParticipants.registered_count || 0} orang</p>
              </div>
              <button
                onClick={() => setSelectedEventForParticipants(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                const eventRegs = registrations.filter((r) => r.event_id === selectedEventForParticipants.id && r.status === 'confirmed');
                if (eventRegs.length === 0) {
                  return (
                    <p className="text-xs text-slate-500 text-center py-8">
                      Belum ada peserta yang mendaftar pada event ini.
                    </p>
                  );
                }

                return (
                  <div className="divide-y divide-slate-100 text-xs">
                    {eventRegs.map((reg, idx) => (
                      <div key={reg.id} className="py-3 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">
                            {idx + 1}. {reg.student?.full_name || 'Mahasiswa'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            NIM: {reg.student?.nim || '-'} · {reg.student?.study_program || '-'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Token: {reg.ticket_token}
                          </p>
                        </div>
                        <div className="text-right">
                          {reg.checked_in_at ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Hadir ({new Date(reg.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Belum Check-In
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedEventForParticipants(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
