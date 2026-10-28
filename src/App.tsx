import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { EventDetailModal } from './components/events/EventDetailModal';
import { TicketModal } from './components/tickets/TicketModal';
import { AdminEventModal } from './components/admin/AdminEventModal';
import { AdminCategoryModal } from './components/admin/AdminCategoryModal';
import { QrScannerModal } from './components/admin/QrScannerModal';
import { DatabaseSettingsModal } from './components/admin/DatabaseSettingsModal';
import { LandingPage } from './pages/LandingPage';
import { ExploreEventsPage } from './pages/ExploreEventsPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CampusEventDB } from './services/db';
import { 
  CampusEvent, 
  Category, 
  Profile, 
  Registration, 
  DashboardStats 
} from './types/database';

export function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<'landing' | 'explore' | 'student-dashboard' | 'admin-dashboard'>('landing');
  const [exploreInitialCategoryId, setExploreInitialCategoryId] = useState<string>('');

  // Core Data States
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    totalStudents: 0,
    totalRegistrations: 0,
    totalAttended: 0,
    attendanceRate: 0,
  });

  // Modals
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CampusEvent | null>(null);
  const [selectedRegistrationForTicket, setSelectedRegistrationForTicket] = useState<Registration | null>(null);
  
  // Admin Modals
  const [adminEventModal, setAdminEventModal] = useState<{ isOpen: boolean; event: CampusEvent | null }>({
    isOpen: false,
    event: null,
  });
  const [adminCategoryModal, setAdminCategoryModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  });
  const [qrScannerModal, setQrScannerModal] = useState<{ isOpen: boolean; eventId?: string }>({
    isOpen: false,
  });
  const [dbSettingsModalOpen, setDbSettingsModalOpen] = useState(false);

  // Load and refresh state from database layer
  const loadData = useCallback(() => {
    CampusEventDB.initialize();
    const user = CampusEventDB.getCurrentUser();
    setCurrentUser(user);

    const evs = CampusEventDB.getEvents(true);
    setEvents(evs);

    const cats = CampusEventDB.getCategories();
    setCategories(cats);

    const regs = CampusEventDB.getRegistrations();
    setRegistrations(regs);

    const stds = CampusEventDB.getStudents();
    setStudents(stds);

    const st = CampusEventDB.getDashboardStats();
    setStats(st);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Navigation with Role Protection
  const handleNavigate = (view: string, filterCategoryId?: string) => {
    if (view === 'admin-dashboard') {
      if (!currentUser) {
        setAuthModal({ isOpen: true, mode: 'login' });
        return;
      }
      if (currentUser.role !== 'admin') {
        alert('Akses Ditolak: Halaman ini hanya dapat diakses oleh Administrator Kampus.');
        setCurrentView('student-dashboard');
        return;
      }
    }

    if (view === 'student-dashboard') {
      if (!currentUser) {
        setAuthModal({ isOpen: true, mode: 'login' });
        return;
      }
      if (currentUser.role === 'admin') {
        setCurrentView('admin-dashboard');
        return;
      }
    }

    if (filterCategoryId !== undefined) {
      setExploreInitialCategoryId(filterCategoryId);
    }

    setCurrentView(view as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Handlers
  const handleAuthSuccess = (user: Profile) => {
    setCurrentUser(user);
    loadData();
    if (user.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('student-dashboard');
    }
  };

  const handleLogout = () => {
    CampusEventDB.logout();
    setCurrentUser(null);
    setCurrentView('landing');
    loadData();
  };

  // Registration Success Handler
  const handleRegistrationSuccess = (reg: Registration) => {
    loadData();
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (_) {}

    setSelectedEventForDetail(null);
    // Automatically open ticket modal
    setSelectedRegistrationForTicket(reg);
  };

  // Admin Event Save Handler
  const handleSaveEvent = (eventData: any) => {
    const res = CampusEventDB.saveEvent(eventData);
    if (res.success) {
      setAdminEventModal({ isOpen: false, event: null });
      loadData();
    }
  };

  // Admin Category Save Handler
  const handleSaveCategory = (catData: any) => {
    const res = CampusEventDB.saveCategory(catData);
    if (res.success) {
      setAdminCategoryModal({ isOpen: false, category: null });
      loadData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        onLogout={handleLogout}
        onOpenDbSettings={() => setDbSettingsModalOpen(true)}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            stats={stats}
            events={events}
            categories={categories}
            onNavigate={handleNavigate}
            onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
            onSelectEvent={(ev) => setSelectedEventForDetail(ev)}
          />
        )}

        {currentView === 'explore' && (
          <ExploreEventsPage
            events={events}
            categories={categories}
            initialCategoryId={exploreInitialCategoryId}
            onSelectEvent={(ev) => setSelectedEventForDetail(ev)}
          />
        )}

        {currentView === 'student-dashboard' && currentUser && (
          <StudentDashboard
            currentUser={currentUser}
            registrations={registrations}
            events={events}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onSelectEvent={(ev) => setSelectedEventForDetail(ev)}
            onViewTicket={(reg) => setSelectedRegistrationForTicket(reg)}
            onProfileUpdated={(updated) => {
              setCurrentUser(updated);
              loadData();
            }}
          />
        )}

        {currentView === 'admin-dashboard' && currentUser && currentUser.role === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            stats={stats}
            events={events}
            categories={categories}
            registrations={registrations}
            students={students}
            onLogout={handleLogout}
            onRefreshData={loadData}
            onOpenEventModal={(event) => setAdminEventModal({ isOpen: true, event: event || null })}
            onOpenCategoryModal={(cat) => setAdminCategoryModal({ isOpen: true, category: cat || null })}
            onOpenQrScanner={(eventId) => setQrScannerModal({ isOpen: true, eventId })}
            onOpenDbSettings={() => setDbSettingsModalOpen(true)}
          />
        )}
      </div>

      {/* Footer (Rendered on public pages) */}
      {(currentView === 'landing' || currentView === 'explore') && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* MODALS */}

      {/* 1. Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onSuccess={handleAuthSuccess}
      />

      {/* 2. Event Detail Modal */}
      <EventDetailModal
        event={selectedEventForDetail}
        currentUser={currentUser}
        userRegistrations={registrations.filter((r) => r.student_id === currentUser?.id)}
        onClose={() => setSelectedEventForDetail(null)}
        onOpenAuth={(mode) => {
          setSelectedEventForDetail(null);
          setAuthModal({ isOpen: true, mode });
        }}
        onRegistrationSuccess={handleRegistrationSuccess}
        onViewTicket={(reg) => setSelectedRegistrationForTicket(reg)}
      />

      {/* 3. Ticket Digital Modal */}
      <TicketModal
        registration={selectedRegistrationForTicket}
        onClose={() => setSelectedRegistrationForTicket(null)}
      />

      {/* 4. Admin Event Modal */}
      <AdminEventModal
        isOpen={adminEventModal.isOpen}
        event={adminEventModal.event}
        categories={categories}
        adminId={currentUser?.id || 'admin-01'}
        onClose={() => setAdminEventModal({ isOpen: false, event: null })}
        onSave={handleSaveEvent}
      />

      {/* 5. Admin Category Modal */}
      <AdminCategoryModal
        isOpen={adminCategoryModal.isOpen}
        category={adminCategoryModal.category}
        onClose={() => setAdminCategoryModal({ isOpen: false, category: null })}
        onSave={handleSaveCategory}
      />

      {/* 6. Admin QR Scanner Modal */}
      <QrScannerModal
        isOpen={qrScannerModal.isOpen}
        events={events}
        selectedEventId={qrScannerModal.eventId}
        onClose={() => setQrScannerModal({ isOpen: false })}
        onCheckInCompleted={loadData}
      />

      {/* 7. Database Settings Modal */}
      <DatabaseSettingsModal
        isOpen={dbSettingsModalOpen}
        onClose={() => setDbSettingsModalOpen(false)}
      />

    </div>
  );
}

export default App;
