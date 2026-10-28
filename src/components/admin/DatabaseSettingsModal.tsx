import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  ExternalLink, 
  RotateCcw, 
  Copy, 
  Check, 
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured, saveSupabaseConfig, clearSupabaseConfig } from '../../lib/supabase';
import { CampusEventDB } from '../../services/db';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(supabaseUrl);
  const [anonKey, setAnonKey] = useState(supabaseAnonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg('URL dan Anon Key Supabase wajib diisi untuk menghubungkan.');
      return;
    }
    saveSupabaseConfig(url, anonKey);
  };

  const handleDisconnect = () => {
    if (confirm('Kembalikan koneksi ke database lokal demo?')) {
      clearSupabaseConfig();
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data simulasi ke kondisi awal? Seluruh perubahan lokal akan dikembalikan.')) {
      CampusEventDB.resetDemoDatabase();
    }
  };

  const copySqlNotice = () => {
    setCopiedSql(true);
    navigator.clipboard.writeText('-- Silakan gunakan file /supabase/schema.sql dan /supabase/seed.sql di proyek ini');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Koneksi Database & Arsitektur Supabase</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">
                {isSupabaseConfigured ? 'Supabase Live Connected' : 'Database Offline-First / Local Storage Aktif'}
              </p>
              <p className="mt-1 leading-relaxed text-slate-600">
                {isSupabaseConfigured
                  ? 'Aplikasi terhubung ke instance Supabase PostgreSQL Anda. Data disinkronkan secara real-time.'
                  : 'Aplikasi berjalan menggunakan database lokal dengan persistensi lengkap, integritas relasional, dan validasi atomik. Anda dapat menghubungkan proyek Supabase asli kapan saja.'}
              </p>
            </div>
          </div>

          {/* Form to connect custom Supabase */}
          <form onSubmit={handleSave} className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Konfigurasi Supabase Project</span>
            </h4>

            {statusMsg && (
              <p className="text-red-600 font-semibold">{statusMsg}</p>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Anon Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSupabaseConfigured ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-red-600 hover:underline font-semibold"
                >
                  Putuskan Koneksi Supabase
                </button>
              ) : (
                <span className="text-slate-500 text-[11px]">Dapatkan URL & Key dari Supabase Settings &gt; API</span>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
              >
                Simpan & Sambungkan
              </button>
            </div>
          </form>

          {/* SQL Migration & Seed Files Info */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>File SQL Migration & Seed Siap Pakai</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Skema database lengkap (tabel <code>profiles</code>, <code>categories</code>, <code>events</code>, <code>registrations</code>, kebijakan RLS, serta fungsi atomik <code>check_in_ticket</code>) telah disediakan dalam direktori proyek:
            </p>
            <ul className="list-disc pl-5 font-mono text-slate-700 space-y-1">
              <li>/supabase/schema.sql (Struktur tabel, relasi, RLS, & prosedur)</li>
              <li>/supabase/seed.sql (Data awal kategori & admin setup)</li>
            </ul>
          </div>

          {/* Reset Demo Data Action */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-slate-500">Uji coba ulang data simulasi?</span>
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Data Demo Awal</span>
            </button>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
