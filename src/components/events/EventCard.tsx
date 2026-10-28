import React, { useState } from 'react';
import { Calendar, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { CampusEvent } from '../../types/database';

interface EventCardProps {
  event: CampusEvent;
  onSelect: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  const startDate = new Date(event.start_at);
  const formattedDate = startDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const registered = event.registered_count || 0;
  const remaining = Math.max(0, event.quota - registered);
  const isFull = remaining <= 0;
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';

  return (
    <div
      onClick={() => onSelect(event)}
      className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Banner Media with Resilient Fallback */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        {!imageError && event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-xs font-semibold text-white line-clamp-1">{event.name}</span>
          </div>
        )}

        {/* Status Overlay when special state occurs */}
        {isCancelled && (
          <div className="absolute inset-0 bg-red-950/70 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
            <span className="text-white font-bold text-xs uppercase tracking-wider bg-red-600 px-2.5 py-1 rounded">
              Dibatalkan
            </span>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-medium px-2 py-0.5 rounded">
            Selesai
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Metadata Bar (Zero-Pill Discipline: unboxed text with middle dots) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2.5">
            <span className="text-blue-600 font-semibold">{event.category?.name || 'Kegiatan Kampus'}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedTime} WIB</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug">
            {event.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {event.description}
          </p>
        </div>

        {/* Card Footer: Location & Quota Info */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="tabular-nums">
                {isFull ? (
                  <span className="text-amber-600 font-medium">Kuota Penuh ({event.quota}/{event.quota})</span>
                ) : (
                  <span>Sisa kuota: <strong className="text-slate-900">{remaining}</strong> dari {event.quota}</span>
                )}
              </span>
            </div>

            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              Detail <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
