import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  X, 
  ArrowUpDown, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { CampusEvent, Category } from '../types/database';
import { EventCard } from '../components/events/EventCard';

interface ExploreEventsPageProps {
  events: CampusEvent[];
  categories: Category[];
  initialCategoryId?: string;
  onSelectEvent: (event: CampusEvent) => void;
}

export const ExploreEventsPage: React.FC<ExploreEventsPageProps> = ({
  events,
  categories,
  initialCategoryId = '',
  onSelectEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'date-asc' | 'quota-desc'>('newest');

  // Filter & Sort Logic
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Must be published for public/students
      if (!e.is_published) return false;

      // Search by name, description, location
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = e.name.toLowerCase().includes(q);
        const matchesDesc = e.description.toLowerCase().includes(q);
        const matchesLoc = e.location.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLoc) return false;
      }

      // Filter category
      if (selectedCategory && e.category_id !== selectedCategory) {
        return false;
      }

      // Filter status
      if (selectedStatus === 'active') {
        if (e.status !== 'active') return false;
      } else if (selectedStatus === 'completed') {
        if (e.status !== 'completed') return false;
      } else if (selectedStatus === 'cancelled') {
        if (e.status !== 'cancelled') return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
      } else if (sortBy === 'quota-desc') {
        return b.quota - a.quota;
      }
      return 0;
    });
  }, [events, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Bar */}
        <div className="mb-8">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            KATALOG KEGIATAN KAMPUS
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Jelajahi Event & Kegiatan Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Temukan seminar akademik, workshop skill, dan kompetisi inovasi yang sedang membuka pendaftaran.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama event, topik, atau lokasi..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Semua Status</option>
                <option value="active">Pendaftaran Buka</option>
                <option value="completed">Event Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="newest">Terbaru Ditambahkan</option>
                <option value="date-asc">Tanggal Terdekat</option>
                <option value="quota-desc">Kuota Terbanyak</option>
              </select>
            </div>

          </div>

          {/* Interactive Category Segmented Tabs (Permitted by Design Constitution for Functional Filter Controls) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({events.filter((e) => e.is_published).length})
            </button>
            {categories.map((cat) => {
              const count = events.filter((e) => e.category_id === cat.id && e.is_published).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
          <span className="font-medium">
            Menampilkan <strong className="text-slate-900 tabular-nums">{filteredEvents.length}</strong> event yang cocok
          </span>

          {(searchQuery || selectedCategory || selectedStatus !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Tidak Ada Event yang Sesuai
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Tidak ditemukan event yang cocok dengan kriteria pencarian atau filter yang Anda pilih saat ini.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Tampilkan Semua Event
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
