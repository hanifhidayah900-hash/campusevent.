import React, { useState, useEffect } from 'react';
import { X, Calendar, Image, MapPin, Users, AlertCircle, Save } from 'lucide-react';
import { CampusEvent, Category, EventStatus } from '../../types/database';

interface AdminEventModalProps {
  isOpen: boolean;
  event: CampusEvent | null;
  categories: Category[];
  adminId: string;
  onClose: () => void;
  onSave: (eventData: Omit<CampusEvent, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => void;
}

export const AdminEventModal: React.FC<AdminEventModalProps> = ({
  isOpen,
  event,
  categories,
  adminId,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [regOpenAt, setRegOpenAt] = useState('');
  const [regCloseAt, setRegCloseAt] = useState('');
  const [quota, setQuota] = useState(100);
  const [status, setStatus] = useState<EventStatus>('active');
  const [isPublished, setIsPublished] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to format ISO to datetime-local input
  const toLocalInput = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (event) {
      setName(event.name);
      setSlug(event.slug);
      setCategoryId(event.category_id);
      setDescription(event.description);
      setBannerUrl(event.banner_url);
      setLocation(event.location);
      setStartAt(toLocalInput(event.start_at));
      setEndAt(toLocalInput(event.end_at));
      setRegOpenAt(toLocalInput(event.registration_open_at));
      setRegCloseAt(toLocalInput(event.registration_close_at));
      setQuota(event.quota);
      setStatus(event.status);
      setIsPublished(event.is_published);
    } else {
      setName('');
      setSlug('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setBannerUrl('/src/assets/images/campus_event_hero_1793162410963.jpg');
      setLocation('Auditorium Kampus Utama');
      
      const today = new Date();
      const inTwoWeeks = new Date(today.getTime() + 14 * 86400000);
      setRegOpenAt(toLocalInput(today.toISOString()));
      setRegCloseAt(toLocalInput(new Date(today.getTime() + 12 * 86400000).toISOString()));
      setStartAt(toLocalInput(inTwoWeeks.toISOString()));
      setEndAt(toLocalInput(new Date(inTwoWeeks.getTime() + 4 * 3600000).toISOString()));
      setQuota(100);
      setStatus('active');
      setIsPublished(true);
    }
    setErrorMessage(null);
  }, [event, isOpen, categories]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!event) {
      // Auto-generate slug
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !slug.trim() || !categoryId || !description.trim() || !location.trim()) {
      setErrorMessage('Harap isi semua kolom wajib.');
      return;
    }

    if (quota <= 0) {
      setErrorMessage('Kuota peserta minimal harus 1 orang.');
      return;
    }

    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    const regOpen = new Date(regOpenAt).getTime();
    const regClose = new Date(regCloseAt).getTime();

    if (end <= start) {
      setErrorMessage('Waktu selesai acara harus lebih lambat dari waktu mulai.');
      return;
    }

    if (regClose <= regOpen) {
      setErrorMessage('Waktu penutupan pendaftaran harus lebih lambat dari waktu pembukaan.');
      return;
    }

    onSave({
      id: event?.id,
      admin_id: event?.admin_id || adminId,
      category_id: categoryId,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      banner_url: bannerUrl.trim() || '/src/assets/images/campus_event_hero_1793162410963.jpg',
      location: location.trim(),
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      registration_open_at: new Date(regOpenAt).toISOString(),
      registration_close_at: new Date(regCloseAt).toISOString(),
      quota: Number(quota),
      status,
      is_published: isPublished,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">
              {event ? 'Edit Informasi Event' : 'Tambah Event Kampus Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Event *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Seminar Nasional AI & Robotics 2026"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slug URL Unik *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="seminar-ai-robotics-2026"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Event *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Event *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan agenda, narasumber, dan ketentuan peserta..."
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Acara *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Auditorium Rektorat Lt. 3"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas Kuota (Peserta) *
              </label>
              <input
                type="number"
                min={1}
                value={quota}
                onChange={(e) => setQuota(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums font-mono"
              />
            </div>
          </div>

          {/* Banner URL & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Banner Event
            </label>
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="/src/assets/images/campus_event_hero_..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
            />
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span>Preset Gambar:</span>
              <button
                type="button"
                onClick={() => setBannerUrl('/src/assets/images/event_ai_seminar_1793162410848.jpg')}
                className="text-blue-600 hover:underline"
              >
                AI & Tech
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setBannerUrl('/src/assets/images/event_web_workshop_1793162410730.jpg')}
                className="text-blue-600 hover:underline"
              >
                Coding Workshop
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setBannerUrl('/src/assets/images/event_design_masterclass_1793162411634.jpg')}
                className="text-blue-600 hover:underline"
              >
                Design
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setBannerUrl('/src/assets/images/campus_event_hero_1793162410963.jpg')}
                className="text-blue-600 hover:underline"
              >
                Auditorium Kampus
              </button>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Waktu Mulai Acara *
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Waktu Selesai Acara *
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Buka Pendaftaran *
              </label>
              <input
                type="datetime-local"
                value={regOpenAt}
                onChange={(e) => setRegOpenAt(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tutup Pendaftaran *
              </label>
              <input
                type="datetime-local"
                value={regCloseAt}
                onChange={(e) => setRegCloseAt(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Status & Publication */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Event
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="active">Aktif (Pendaftaran Dibuka)</option>
                <option value="registration_closed">Pendaftaran Ditutup</option>
                <option value="ongoing">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Publikasikan ke Mahasiswa (Aktif)
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Event</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
