-- ====================================================================
-- CampusEvent — Seed Data Initializer
-- Jalankan file ini di Supabase SQL Editor setelah schema.sql
-- ====================================================================

-- 1. Insert Kategori
INSERT INTO public.categories (id, name, slug, description)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Seminar', 'seminar', 'Seminar akademik, teknologi, dan wawasan industri bersama narasumber ahli.'),
    ('c2222222-2222-2222-2222-222222222222', 'Workshop', 'workshop', 'Sesi praktikum interaktif dan pembuatan proyek nyata.'),
    ('c3333333-3333-3333-3333-333333333333', 'Pelatihan', 'pelatihan', 'Pelatihan skill profesional bersertifikat untuk mahasiswa.'),
    ('c4444444-4444-4444-4444-444444444444', 'Kompetisi', 'kompetisi', 'Lomba karya inovasi, hackathon, dan ajang prestasi kampus.'),
    ('c5555555-5555-5555-5555-555555555555', 'Kegiatan Organisasi', 'organisasi', 'Musyawarah, gathering, dan program kerja BEM / Himpunan.'),
    ('c6666666-6666-6666-6666-666666666666', 'Kegiatan Akademik', 'akademik', 'Kuliah tamu, simposium riset, dan sosialisasi program kampus.')
ON CONFLICT (slug) DO NOTHING;

-- Catatan untuk Akun Admin Pertama:
-- Buat akun admin melalui Supabase Auth Dashboard (Authentication > Users > Add User)
-- dengan email 'admin@campusevent.ac.id'.
-- Kemudian ubah role-nya menjadi 'admin' dengan query berikut:
--
-- UPDATE public.profiles
-- SET role = 'admin', full_name = 'Dr. Hendra Gunawan, M.T.'
-- WHERE email = 'admin@campusevent.ac.id';
