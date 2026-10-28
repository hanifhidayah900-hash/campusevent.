-- ====================================================================
-- CampusEvent — PostgreSQL Schema Migration for Supabase
-- Tabel: profiles, categories, events, registrations, attendance_logs
-- RLS (Row Level Security) and Stored Procedures for Atomic Check-in
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('mahasiswa', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('active', 'registration_closed', 'ongoing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('confirmed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    nim TEXT UNIQUE,
    study_program TEXT,
    faculty TEXT,
    role user_role NOT NULL DEFAULT 'mahasiswa',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for searching profiles
CREATE INDEX IF NOT EXISTS idx_profiles_nim ON public.profiles(nim);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    location TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    registration_open_at TIMESTAMPTZ NOT NULL,
    registration_close_at TIMESTAMPTZ NOT NULL,
    quota INTEGER NOT NULL CHECK (quota > 0),
    status event_status NOT NULL DEFAULT 'active',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_event_dates CHECK (end_at > start_at),
    CONSTRAINT chk_reg_dates CHECK (registration_close_at > registration_open_at)
);

CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);

-- 6. Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticket_token TEXT UNIQUE NOT NULL,
    status registration_status NOT NULL DEFAULT 'confirmed',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Unique constraint: A student can only register once per event
    CONSTRAINT uq_event_student UNIQUE (event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student ON public.registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket_token ON public.registrations(ticket_token);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read, users can update their own non-role columns
CREATE POLICY "Allow public read access to basic profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Categories: Anyone can read, only admin can insert/update/delete
CREATE POLICY "Public read categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admin manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Events: Anyone can read published events; Admins can see and manage all
CREATE POLICY "Public read published events" ON public.events
    FOR SELECT USING (is_published = true OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Registrations: Students can view their own registrations; Admins can view and manage all
CREATE POLICY "Students read own registrations" ON public.registrations
    FOR SELECT USING (student_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Students insert own registration" ON public.registrations
    FOR INSERT WITH CHECK (
        student_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_id
              AND e.status = 'active'
              AND e.is_published = true
              AND now() BETWEEN e.registration_open_at AND e.registration_close_at
              AND (
                  SELECT count(*) FROM public.registrations r 
                  WHERE r.event_id = e.id AND r.status = 'confirmed'
              ) < e.quota
        )
    );

CREATE POLICY "Admin check-in and manage registrations" ON public.registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Stored Procedure for Safe Atomic QR Code Check-In
CREATE OR REPLACE FUNCTION public.check_in_ticket(
    p_ticket_token TEXT,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role user_role;
    v_reg RECORD;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    -- Verify that invoker is admin
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role <> 'admin' THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNAUTHORIZED', 'message', 'Hanya admin yang berhak melakukan check-in peserta.');
    END IF;

    -- Lookup registration with row locking for atomic update
    SELECT r.*, e.name AS event_name, e.status AS event_status, p.full_name, p.nim
    INTO v_reg
    FROM public.registrations r
    JOIN public.events e ON e.id = r.event_id
    JOIN public.profiles p ON p.id = r.student_id
    WHERE upper(r.ticket_token) = upper(p_ticket_token)
    FOR UPDATE OF r;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'INVALID_TOKEN', 'message', 'Tiket tidak ditemukan dalam sistem.');
    END IF;

    IF v_reg.event_status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'code', 'EVENT_CANCELLED', 'message', 'Event telah dibatalkan.');
    END IF;

    IF v_reg.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'code', 'REGISTRATION_CANCELLED', 'message', 'Pendaftaran tiket ini telah dibatalkan.');
    END IF;

    IF v_reg.checked_in_at IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'ALREADY_CHECKED_IN', 
            'message', 'Peserta sudah pernah melakukan check-in.',
            'checked_in_at', v_reg.checked_in_at,
            'student_name', v_reg.full_name,
            'nim', v_reg.nim,
            'event_name', v_reg.event_name
        );
    END IF;

    -- Record check-in
    UPDATE public.registrations
    SET checked_in_at = v_now
    WHERE id = v_reg.id;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'VALID',
        'message', 'Check-in berhasil.',
        'checked_in_at', v_now,
        'student_name', v_reg.full_name,
        'nim', v_reg.nim,
        'event_name', v_reg.event_name,
        'ticket_token', v_reg.ticket_token
    );
END;
$$;
