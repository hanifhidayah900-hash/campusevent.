import React, { useState } from 'react';
import { X, Lock, Mail, User, GraduationCap, Building2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { CampusEventDB } from '../../services/db';
import { Profile } from '../../types/database';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: Profile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [nim, setNim] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [faculty, setFaculty] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Harap masukkan alamat email Anda.');
      return;
    }

    setLoading(true);
    try {
      const result = await CampusEventDB.login(loginEmail, loginPassword);
      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
      } else {
        setErrorMessage(result.error || 'Login gagal. Periksa email atau password Anda.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat mencoba masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !regEmail.trim() || !nim.trim() || !studyProgram.trim()) {
      setErrorMessage('Harap lengkapi semua kolom wajib bertanda bintang (*).');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setErrorMessage('Format email tidak valid.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password minimal harus 6 karakter.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const result = await CampusEventDB.registerStudent({
        fullName,
        email: regEmail,
        nim,
        studyProgram,
        faculty: faculty || 'Fakultas Umum',
        password: regPassword,
      });

      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
      } else {
        setErrorMessage(result.error || 'Pendaftaran gagal. NIM atau Email mungkin sudah terdaftar.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role: 'student' | 'admin') => {
    setMode('login');
    setErrorMessage(null);
    if (role === 'student') {
      setLoginEmail('budi.santoso@student.campusevent.ac.id');
      setLoginPassword('password123');
    } else {
      setLoginEmail('admin@campusevent.ac.id');
      setLoginPassword('password123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">
              {mode === 'login' ? 'Masuk ke CampusEvent' : 'Pendaftaran Akun Mahasiswa'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick Selector Bar */}
        <div className="bg-blue-50/80 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs">
          <span className="text-blue-900 font-medium">Uji Coba Cepat:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('student')}
              className="px-2 py-1 rounded bg-white text-blue-700 border border-blue-200 hover:bg-blue-100 font-medium transition-colors"
            >
              Demo Mahasiswa
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="px-2 py-1 rounded bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 font-medium transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@student.campusevent.ac.id"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIM Mahasiswa *
                  </label>
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="2201082001"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program Studi *
                  </label>
                  <input
                    type="text"
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    placeholder="Teknik Informatika"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fakultas
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="Fakultas Ilmu Komputer"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Mahasiswa *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@student.campusevent.ac.id"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Konfirmasi *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Pendaftaran publik otomatis terdaftar dengan role Mahasiswa untuk keamanan hak akses.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Switch Mode Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            {mode === 'login' ? (
              <p>
                Belum memiliki akun mahasiswa?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('register');
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Daftar di sini
                </button>
              </p>
            ) : (
              <p>
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('login');
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
