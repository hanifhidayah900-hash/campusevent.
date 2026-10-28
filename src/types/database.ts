export type UserRole = 'mahasiswa' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  nim: string | null;
  study_program: string | null;
  faculty: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export type EventStatus = 'active' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';

export interface CampusEvent {
  id: string;
  admin_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  banner_url: string;
  location: string;
  start_at: string;
  end_at: string;
  registration_open_at: string;
  registration_close_at: string;
  quota: number;
  status: EventStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Computed/joined fields
  category?: Category;
  registered_count?: number;
  attended_count?: number;
}

export type RegistrationStatus = 'confirmed' | 'cancelled';

export interface Registration {
  id: string;
  event_id: string;
  student_id: string;
  ticket_token: string;
  status: RegistrationStatus;
  registered_at: string;
  checked_in_at: string | null;
  created_at: string;
  // Computed/joined fields
  event?: CampusEvent;
  student?: Profile;
}

export interface CheckInResult {
  success: boolean;
  code: 'VALID' | 'ALREADY_CHECKED_IN' | 'INVALID_TOKEN' | 'EVENT_CANCELLED' | 'REGISTRATION_CANCELLED';
  message: string;
  registration?: Registration;
  checkedInAt?: string;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalStudents: number;
  totalRegistrations: number;
  totalAttended: number;
  attendanceRate: number;
}
