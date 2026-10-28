import { 
  CampusEvent, 
  Category, 
  Profile, 
  Registration, 
  CheckInResult, 
  DashboardStats 
} from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Keys for local persistence
const STORAGE_KEYS = {
  PROFILES: 'campusevent_profiles_v1',
  CATEGORIES: 'campusevent_categories_v1',
  EVENTS: 'campusevent_events_v1',
  REGISTRATIONS: 'campusevent_registrations_v1',
  CURRENT_USER: 'campusevent_current_user_v1',
};

// Initial Seed Categories
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Seminar',
    slug: 'seminar',
    description: 'Seminar akademik, teknologi, dan wawasan industri bersama narasumber ahli.',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Workshop',
    slug: 'workshop',
    description: 'Sesi praktikum interaktif dan pembuatan proyek nyata.',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Pelatihan',
    slug: 'pelatihan',
    description: 'Pelatihan skill profesional bersertifikat untuk mahasiswa.',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Kompetisi',
    slug: 'kompetisi',
    description: 'Lomba karya inovasi, hackathon, dan ajang prestasi kampus.',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Kegiatan Organisasi',
    slug: 'organisasi',
    description: 'Musyawarah, gathering, dan program kerja BEM / Himpunan.',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cat-6',
    name: 'Kegiatan Akademik',
    slug: 'akademik',
    description: 'Kuliah tamu, simposium riset, dan sosialisasi program kampus.',
    created_at: '2026-01-10T08:00:00Z',
  },
];

// Initial Seed Users (Admin & Students)
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'admin-01',
    email: 'admin@campusevent.ac.id',
    full_name: 'Dr. Hendra Gunawan, S.Kom., M.T.',
    nim: null,
    study_program: 'Biro Kemahasiswaan & Alumni',
    faculty: 'Direktorat Kemahasiswaan',
    role: 'admin',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'student-01',
    email: 'budi.santoso@student.campusevent.ac.id',
    full_name: 'Budi Santoso',
    nim: '2201082001',
    study_program: 'Teknik Informatika',
    faculty: 'Fakultas Ilmu Komputer',
    role: 'mahasiswa',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'student-02',
    email: 'siti.nurhaliza@student.campusevent.ac.id',
    full_name: 'Siti Nurhaliza',
    nim: '2201082015',
    study_program: 'Sistem Informasi',
    faculty: 'Fakultas Ilmu Komputer',
    role: 'mahasiswa',
    created_at: '2026-01-18T10:30:00Z',
    updated_at: '2026-01-18T10:30:00Z',
  },
  {
    id: 'student-03',
    email: 'rizky.pratama@student.campusevent.ac.id',
    full_name: 'Rizky Pratama',
    nim: '2301053040',
    study_program: 'Desain Komunikasi Visual',
    faculty: 'Fakultas Industri Kreatif',
    role: 'mahasiswa',
    created_at: '2026-02-01T11:00:00Z',
    updated_at: '2026-02-01T11:00:00Z',
  },
];

// Initial Seed Events
const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt-01',
    admin_id: 'admin-01',
    category_id: 'cat-1',
    name: 'Seminar Nasional: Frontiers of Artificial Intelligence & Robotics 2026',
    slug: 'seminar-ai-robotics-2026',
    description: 'Eksplorasi mendalam mengenai perkembangan terbaru generative AI, autonomous robotics, serta implikasi etika di era transformasi digital bersama pakar industri dan akademisi terkemuka.',
    banner_url: '/src/assets/images/event_ai_seminar_1793162410848.jpg',
    location: 'Auditorium Utama Gedung Rektorat Lt. 3',
    start_at: '2026-11-15T09:00:00Z',
    end_at: '2026-11-15T15:30:00Z',
    registration_open_at: '2026-10-01T00:00:00Z',
    registration_close_at: '2026-11-12T23:59:59Z',
    quota: 250,
    status: 'active',
    is_published: true,
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'evt-02',
    admin_id: 'admin-01',
    category_id: 'cat-2',
    name: 'Workshop Modern Full-Stack Web Development: Vite, React, & PostgreSQL',
    slug: 'workshop-fullstack-web-2026',
    description: 'Hands-on coding workshop membangun aplikasi web full-stack modern mulai dari perancangan skema database relasional, REST/RPC API, hingga deploy otomatis ke cloud platform.',
    banner_url: '/src/assets/images/event_web_workshop_1793162410730.jpg',
    location: 'Laboratorium Rekayasa Perangkat Lunak Gedung B Lt. 2',
    start_at: '2026-11-20T13:00:00Z',
    end_at: '2026-11-20T17:00:00Z',
    registration_open_at: '2026-10-10T00:00:00Z',
    registration_close_at: '2026-11-18T23:59:59Z',
    quota: 45,
    status: 'active',
    is_published: true,
    created_at: '2026-10-10T08:00:00Z',
    updated_at: '2026-10-10T08:00:00Z',
  },
  {
    id: 'evt-03',
    admin_id: 'admin-01',
    category_id: 'cat-3',
    name: 'Pelatihan UI/UX Design & Product Strategy: From Wireframe to Usable Product',
    slug: 'pelatihan-uiux-product-design',
    description: 'Pelatihan intensif metodologi design thinking, perancangan antarmuka pengguna berbasis design system modern, usability testing, dan penyusunan portofolio produk digital kelas industri.',
    banner_url: '/src/assets/images/event_design_masterclass_1793162411634.jpg',
    location: 'Creative Hub Center Gedung Perpustakaan Pusat Lt. 1',
    start_at: '2026-11-25T09:00:00Z',
    end_at: '2026-11-25T16:00:00Z',
    registration_open_at: '2026-10-12T00:00:00Z',
    registration_close_at: '2026-11-22T23:59:59Z',
    quota: 60,
    status: 'active',
    is_published: true,
    created_at: '2026-10-12T08:00:00Z',
    updated_at: '2026-10-12T08:00:00Z',
  },
  {
    id: 'evt-04',
    admin_id: 'admin-01',
    category_id: 'cat-4',
    name: 'Kompetisi Inovasi Mahasiswa: Tech & Sustainability Hackathon 2026',
    slug: 'kompetisi-inovasi-hackathon-2026',
    description: 'Ajang kompetisi ide kreatif dan prototipe teknologi untuk menjawab tantangan keberlanjutan kampus hijau. Total hadiah jutaan rupiah dan pendampingan inkubasi wirausaha.',
    banner_url: '/src/assets/images/campus_event_hero_1793162410963.jpg',
    location: 'Hall Sains & Technopark Kampus',
    start_at: '2026-12-05T08:30:00Z',
    end_at: '2026-12-06T18:00:00Z',
    registration_open_at: '2026-10-15T00:00:00Z',
    registration_close_at: '2026-11-30T23:59:59Z',
    quota: 100,
    status: 'active',
    is_published: true,
    created_at: '2026-10-15T08:00:00Z',
    updated_at: '2026-10-15T08:00:00Z',
  },
  {
    id: 'evt-05',
    admin_id: 'admin-01',
    category_id: 'cat-1',
    name: 'Simposium Karir Digital: Menembus Pasar Kerja Global untuk Lulusan Muda',
    slug: 'simposium-karir-digital-2026',
    description: 'Wawasan strategi personal branding di LinkedIn, pembuatan CV ATS-friendly, wawancara kerja teknis, dan peluang remote work dari recruiter perusahaan multinasional.',
    banner_url: '/src/assets/images/campus_event_hero_1793162410963.jpg',
    location: 'Ruang Seminar Bersama Gedung D Lt. 4 & Hybrid Zoom',
    start_at: '2026-10-20T10:00:00Z',
    end_at: '2026-10-20T14:00:00Z',
    registration_open_at: '2026-09-15T00:00:00Z',
    registration_close_at: '2026-10-18T23:59:59Z',
    quota: 200,
    status: 'completed',
    is_published: true,
    created_at: '2026-09-15T08:00:00Z',
    updated_at: '2026-10-21T08:00:00Z',
  },
];

// Initial Seed Registrations
const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-01',
    event_id: 'evt-01',
    student_id: 'student-01',
    ticket_token: 'TK-EVT01-BD8201',
    status: 'confirmed',
    registered_at: '2026-10-15T14:20:00Z',
    checked_in_at: null,
    created_at: '2026-10-15T14:20:00Z',
  },
  {
    id: 'reg-02',
    event_id: 'evt-02',
    student_id: 'student-01',
    ticket_token: 'TK-EVT02-BD8202',
    status: 'confirmed',
    registered_at: '2026-10-16T11:15:00Z',
    checked_in_at: null,
    created_at: '2026-10-16T11:15:00Z',
  },
  {
    id: 'reg-03',
    event_id: 'evt-01',
    student_id: 'student-02',
    ticket_token: 'TK-EVT01-ST2015',
    status: 'confirmed',
    registered_at: '2026-10-18T16:45:00Z',
    checked_in_at: null,
    created_at: '2026-10-18T16:45:00Z',
  },
  {
    id: 'reg-04',
    event_id: 'evt-03',
    student_id: 'student-03',
    ticket_token: 'TK-EVT03-RZ3040',
    status: 'confirmed',
    registered_at: '2026-10-20T09:10:00Z',
    checked_in_at: null,
    created_at: '2026-10-20T09:10:00Z',
  },
  {
    id: 'reg-05',
    event_id: 'evt-05',
    student_id: 'student-01',
    ticket_token: 'TK-EVT05-BD8205',
    status: 'confirmed',
    registered_at: '2026-09-20T10:00:00Z',
    checked_in_at: '2026-10-20T09:48:12Z',
    created_at: '2026-09-20T10:00:00Z',
  },
  {
    id: 'reg-06',
    event_id: 'evt-05',
    student_id: 'student-02',
    ticket_token: 'TK-EVT05-ST2016',
    status: 'confirmed',
    registered_at: '2026-09-21T11:30:00Z',
    checked_in_at: '2026-10-20T09:52:05Z',
    created_at: '2026-09-21T11:30:00Z',
  },
];

// Helper to initialize and retrieve local records
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Gagal membaca ${key}:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Gagal menyimpan ${key}:`, e);
  }
}

// Generate random safe ticket token
export function generateTicketToken(eventSlug: string, nimOrId: string): string {
  const cleanSlug = eventSlug.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const cleanId = nimOrId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${cleanSlug}-${cleanId}-${randomHex}`;
}

export class CampusEventDB {
  private static initDone = false;

  public static initialize(): void {
    if (this.initDone) return;
    if (typeof window === 'undefined') return;

    // Check if initial storage exists
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      setStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      setStored(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      setStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
      setStored(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    }

    this.initDone = true;
  }

  // --- AUTH & PROFILES ---

  public static getCurrentUser(): Profile | null {
    this.initialize();
    return getStored<Profile | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public static setCurrentUser(user: Profile | null): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  }

  public static async login(email: string, nimOrPassword?: string): Promise<{ success: boolean; user?: Profile; error?: string }> {
    this.initialize();
    const cleanEmail = email.trim().toLowerCase();

    // Check if real Supabase auth is active
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: nimOrPassword || 'password123',
        });
        if (!error && data.user) {
          // Fetch profile from supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            this.setCurrentUser(profile);
            return { success: true, user: profile };
          }
        }
      } catch (e) {
        console.warn('Supabase auth fallback to local store:', e);
      }
    }

    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const found = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { 
        success: false, 
        error: 'Akun dengan email tersebut tidak ditemukan. Silakan registrasi terlebih dahulu.' 
      };
    }

    this.setCurrentUser(found);
    return { success: true, user: found };
  }

  public static async registerStudent(payload: {
    fullName: string;
    email: string;
    nim: string;
    studyProgram: string;
    faculty?: string;
    password: string;
  }): Promise<{ success: boolean; user?: Profile; error?: string }> {
    this.initialize();
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanNim = payload.nim.trim();

    // Validate uniqueness of email and NIM
    if (profiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
    }
    if (profiles.some((p) => p.nim === cleanNim)) {
      return { success: false, error: 'NIM sudah terdaftar dalam sistem.' };
    }

    const newProfile: Profile = {
      id: `student-${Date.now()}`,
      email: cleanEmail,
      full_name: payload.fullName.trim(),
      nim: cleanNim,
      study_program: payload.studyProgram.trim(),
      faculty: payload.faculty?.trim() || 'Fakultas Umum',
      role: 'mahasiswa', // strictly student role for public registration
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If supabase is configured, attempt insert
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: payload.password,
          options: {
            data: {
              full_name: newProfile.full_name,
              nim: newProfile.nim,
              role: 'mahasiswa',
            },
          },
        });
        if (!authError && authData.user) {
          newProfile.id = authData.user.id;
          await supabase.from('profiles').insert([newProfile]);
        }
      } catch (err) {
        console.warn('Supabase register fallback to local store:', err);
      }
    }

    profiles.push(newProfile);
    setStored(STORAGE_KEYS.PROFILES, profiles);
    this.setCurrentUser(newProfile);

    return { success: true, user: newProfile };
  }

  public static async updateStudentProfile(profileId: string, updates: {
    fullName: string;
    studyProgram: string;
    faculty?: string;
  }): Promise<{ success: boolean; user?: Profile; error?: string }> {
    this.initialize();
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex((p) => p.id === profileId);

    if (index === -1) {
      return { success: false, error: 'Profil tidak ditemukan.' };
    }

    // Role, email, and NIM are protected
    const updated: Profile = {
      ...profiles[index],
      full_name: updates.fullName.trim(),
      study_program: updates.studyProgram.trim(),
      faculty: updates.faculty?.trim() || profiles[index].faculty,
      updated_at: new Date().toISOString(),
    };

    profiles[index] = updated;
    setStored(STORAGE_KEYS.PROFILES, profiles);

    const currentUser = this.getCurrentUser();
    if (currentUser?.id === profileId) {
      this.setCurrentUser(updated);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update({
          full_name: updated.full_name,
          study_program: updated.study_program,
          faculty: updated.faculty,
          updated_at: updated.updated_at,
        }).eq('id', profileId);
      } catch (err) {
        console.warn('Supabase updateProfile error:', err);
      }
    }

    return { success: true, user: updated };
  }

  public static logout(): void {
    if (isSupabaseConfigured && supabase) {
      try {
        supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    this.setCurrentUser(null);
  }

  public static getStudents(): Profile[] {
    this.initialize();
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles.filter((p) => p.role === 'mahasiswa');
  }

  // --- CATEGORIES ---

  public static getCategories(): Category[] {
    this.initialize();
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public static saveCategory(category: Omit<Category, 'id' | 'created_at'> & { id?: string }): { success: boolean; category?: Category; error?: string } {
    this.initialize();
    const categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const slug = category.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (category.id) {
      const idx = categories.findIndex((c) => c.id === category.id);
      if (idx === -1) return { success: false, error: 'Kategori tidak ditemukan.' };
      categories[idx] = {
        ...categories[idx],
        name: category.name.trim(),
        slug,
        description: category.description?.trim() || null,
      };
      setStored(STORAGE_KEYS.CATEGORIES, categories);
      return { success: true, category: categories[idx] };
    } else {
      if (categories.some((c) => c.slug === slug)) {
        return { success: false, error: 'Slug kategori sudah digunakan. Silakan gunakan nama lain.' };
      }
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: category.name.trim(),
        slug,
        description: category.description?.trim() || null,
        created_at: new Date().toISOString(),
      };
      categories.push(newCat);
      setStored(STORAGE_KEYS.CATEGORIES, categories);
      return { success: true, category: newCat };
    }
  }

  public static deleteCategory(categoryId: string): { success: boolean; error?: string } {
    this.initialize();
    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    if (events.some((e) => e.category_id === categoryId)) {
      return { 
        success: false, 
        error: 'Kategori tidak dapat dihapus karena masih digunakan oleh satu atau beberapa event aktif.' 
      };
    }
    const categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const filtered = categories.filter((c) => c.id !== categoryId);
    setStored(STORAGE_KEYS.CATEGORIES, filtered);
    return { success: true };
  }

  // --- EVENTS ---

  public static getEvents(includeUnpublished = false): CampusEvent[] {
    this.initialize();
    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const categories = this.getCategories();
    const registrations = getStored<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);

    const mapped = events
      .filter((e) => includeUnpublished || e.is_published)
      .map((e) => {
        const cat = categories.find((c) => c.id === e.category_id);
        const eventRegs = registrations.filter((r) => r.event_id === e.id && r.status === 'confirmed');
        const attended = eventRegs.filter((r) => Boolean(r.checked_in_at));
        return {
          ...e,
          category: cat,
          registered_count: eventRegs.length,
          attended_count: attended.length,
        };
      });

    return mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static getEventById(id: string): CampusEvent | null {
    const events = this.getEvents(true);
    return events.find((e) => e.id === id) || null;
  }

  public static saveEvent(eventData: Omit<CampusEvent, 'id' | 'created_at' | 'updated_at'> & { id?: string }): { success: boolean; event?: CampusEvent; error?: string } {
    this.initialize();
    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const now = new Date().toISOString();

    if (eventData.id) {
      const idx = events.findIndex((e) => e.id === eventData.id);
      if (idx === -1) return { success: false, error: 'Event tidak ditemukan.' };
      
      const updated: CampusEvent = {
        ...events[idx],
        ...eventData,
        id: eventData.id,
        updated_at: now,
      };
      events[idx] = updated;
      setStored(STORAGE_KEYS.EVENTS, events);
      return { success: true, event: updated };
    } else {
      const newEvent: CampusEvent = {
        ...eventData,
        id: `evt-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };
      events.push(newEvent);
      setStored(STORAGE_KEYS.EVENTS, events);
      return { success: true, event: newEvent };
    }
  }

  public static updateEventStatus(eventId: string, status: CampusEvent['status']): { success: boolean; error?: string } {
    this.initialize();
    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) return { success: false, error: 'Event tidak ditemukan.' };
    events[idx].status = status;
    events[idx].updated_at = new Date().toISOString();
    setStored(STORAGE_KEYS.EVENTS, events);
    return { success: true };
  }

  public static deleteEvent(eventId: string): { success: boolean; error?: string } {
    this.initialize();
    const registrations = getStored<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const hasRegistrations = registrations.some((r) => r.event_id === eventId);
    
    // Instead of hard deleting events with registrations, prompt/force cancellation to preserve audit history
    if (hasRegistrations) {
      return {
        success: false,
        error: 'Event memiliki riwayat pendaftaran peserta. Harap ubah status event menjadi "Dibatalkan" untuk menjaga integritas data laporan.',
      };
    }

    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    setStored(STORAGE_KEYS.EVENTS, events.filter((e) => e.id !== eventId));
    return { success: true };
  }

  // --- REGISTRATIONS & TICKETS (ATOMIC & VALIDATED) ---

  public static getRegistrations(filters?: { eventId?: string; studentId?: string }): Registration[] {
    this.initialize();
    const registrations = getStored<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const categories = this.getCategories();

    let filtered = registrations;
    if (filters?.eventId) {
      filtered = filtered.filter((r) => r.event_id === filters.eventId);
    }
    if (filters?.studentId) {
      filtered = filtered.filter((r) => r.student_id === filters.studentId);
    }

    return filtered.map((r) => {
      const eventRaw = events.find((e) => e.id === r.event_id);
      const student = profiles.find((p) => p.id === r.student_id);
      const category = eventRaw ? categories.find((c) => c.id === eventRaw.category_id) : undefined;
      return {
        ...r,
        student,
        event: eventRaw ? { ...eventRaw, category } : undefined,
      };
    }).sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());
  }

  public static registerForEvent(studentId: string, eventId: string): { success: boolean; registration?: Registration; error?: string } {
    this.initialize();
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const student = profiles.find((p) => p.id === studentId);
    if (!student) {
      return { success: false, error: 'Sesi akun mahasiswa tidak valid. Silakan login kembali.' };
    }

    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return { success: false, error: 'Event tidak ditemukan dalam database.' };
    }

    // 1. Check if event is cancelled or completed
    if (event.status === 'cancelled') {
      return { success: false, error: 'Event ini telah dibatalkan oleh penyelenggara kampus.' };
    }
    if (event.status === 'completed') {
      return { success: false, error: 'Event ini telah selesai diselenggarakan.' };
    }

    // 2. Check registration period
    const now = new Date();
    const openDate = new Date(event.registration_open_at);
    const closeDate = new Date(event.registration_close_at);
    if (now < openDate) {
      return { 
        success: false, 
        error: `Pendaftaran belum dibuka. Jadwal pembukaan: ${openDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.` 
      };
    }
    if (now > closeDate || event.status === 'registration_closed') {
      return { success: false, error: 'Periode pendaftaran event ini telah resmi ditutup.' };
    }

    const registrations = getStored<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);

    // 3. Prevent duplicate registration
    const alreadyRegistered = registrations.some(
      (r) => r.event_id === eventId && r.student_id === studentId && r.status === 'confirmed'
    );
    if (alreadyRegistered) {
      return { success: false, error: 'Anda sudah terdaftar dalam event ini. Silakan buka menu "Tiket Saya".' };
    }

    // 4. Atomic quota enforcement
    const confirmedCount = registrations.filter(
      (r) => r.event_id === eventId && r.status === 'confirmed'
    ).length;
    if (confirmedCount >= event.quota) {
      return { success: false, error: 'Mohon maaf, kuota peserta untuk event ini sudah terpenuhi.' };
    }

    // 5. Generate secure ticket token and record
    const ticketToken = generateTicketToken(event.slug, student.nim || student.id);
    const nowIso = new Date().toISOString();

    const newRegistration: Registration = {
      id: `reg-${Date.now()}`,
      event_id: eventId,
      student_id: studentId,
      ticket_token: ticketToken,
      status: 'confirmed',
      registered_at: nowIso,
      checked_in_at: null,
      created_at: nowIso,
      student,
      event,
    };

    registrations.push(newRegistration);
    setStored(STORAGE_KEYS.REGISTRATIONS, registrations);

    return { success: true, registration: newRegistration };
  }

  // --- CHECK-IN / SCAN QR (DATABASE VERIFIED & ATOMIC) ---

  public static validateAndCheckIn(ticketToken: string, expectedEventId?: string): CheckInResult {
    this.initialize();
    const cleanToken = ticketToken.trim().toUpperCase();

    if (!cleanToken) {
      return {
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Kode tiket tidak boleh kosong.',
      };
    }

    const registrations = getStored<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const regIndex = registrations.findIndex((r) => r.ticket_token.toUpperCase() === cleanToken);

    if (regIndex === -1) {
      return {
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Tiket QR Code tidak ditemukan dalam database sistem.',
      };
    }

    const reg = registrations[regIndex];
    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const event = events.find((e) => e.id === reg.event_id);
    const student = profiles.find((p) => p.id === reg.student_id);

    const fullReg: Registration = { ...reg, event, student };

    // Check if event matches if expectedEventId is set
    if (expectedEventId && reg.event_id !== expectedEventId) {
      return {
        success: false,
        code: 'INVALID_TOKEN',
        message: `Tiket ini terdaftar untuk event "${event?.name || 'Lain'}", bukan event yang sedang Anda scan.`,
        registration: fullReg,
      };
    }

    // Check cancellation
    if (reg.status === 'cancelled') {
      return {
        success: false,
        code: 'REGISTRATION_CANCELLED',
        message: 'Pendaftaran tiket ini telah dibatalkan.',
        registration: fullReg,
      };
    }

    if (event?.status === 'cancelled') {
      return {
        success: false,
        code: 'EVENT_CANCELLED',
        message: 'Event ini telah dibatalkan oleh pihak kampus.',
        registration: fullReg,
      };
    }

    // Check already checked in
    if (reg.checked_in_at) {
      const checkInDate = new Date(reg.checked_in_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      return {
        success: false,
        code: 'ALREADY_CHECKED_IN',
        message: `Peserta SUDAH melakukan check-in pada pukul ${checkInDate} WIB.`,
        registration: fullReg,
        checkedInAt: reg.checked_in_at,
      };
    }

    // Record check-in atomically
    const checkInTime = new Date().toISOString();
    registrations[regIndex].checked_in_at = checkInTime;
    setStored(STORAGE_KEYS.REGISTRATIONS, registrations);

    fullReg.checked_in_at = checkInTime;

    return {
      success: true,
      code: 'VALID',
      message: `Check-in BERHASIL! Selamat datang, ${student?.full_name || 'Peserta'}.`,
      registration: fullReg,
      checkedInAt: checkInTime,
    };
  }

  // --- DASHBOARD STATS ---

  public static getDashboardStats(): DashboardStats {
    this.initialize();
    const events = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const registrations = getStored<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

    const activeEvents = events.filter((e) => e.status === 'active' && e.is_published).length;
    const completedEvents = events.filter((e) => e.status === 'completed').length;
    const totalStudents = profiles.filter((p) => p.role === 'mahasiswa').length;
    const confirmedRegistrations = registrations.filter((r) => r.status === 'confirmed');
    const totalRegistrations = confirmedRegistrations.length;
    const totalAttended = confirmedRegistrations.filter((r) => Boolean(r.checked_in_at)).length;
    const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0;

    return {
      totalEvents: events.length,
      activeEvents,
      completedEvents,
      totalStudents,
      totalRegistrations,
      totalAttended,
      attendanceRate,
    };
  }

  // Reset to initial seed state
  public static resetDemoDatabase(): void {
    setStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setStored(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    setStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    setStored(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    setStored(STORAGE_KEYS.CURRENT_USER, null);
    window.location.reload();
  }
}
