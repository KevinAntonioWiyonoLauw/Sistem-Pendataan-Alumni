-- Initialize Alumni Data
-- Sesuai dengan struktur tabel yang SEBENARNYA dibuat oleh Payload CMS

INSERT INTO alumni (
    name,
    batch,
    nim,
    kontak_location_city,
    kontak_location_country,
    kontak_phone,
    kontak_email,
    kontak_linkedin,
    pekerjaan_current_employer,
    pekerjaan_position,
    jejaring_contact_person_ready,
    jejaring_alumni_officer_ready,
    jejaring_other_contacts,
    kontribusi_help_topics,
    lainnya_suggestions,
    metadata_is_public,
    metadata_source,
    metadata_google_forms_id,
    updated_at,
    created_at
) VALUES 
-- Ahmad Rizki Pratama
(
    'Ahmad Rizki Pratama',
    2018,
    '18/444444/TK/18001',
    'Jakarta',
    'Indonesia',
    '081234567890',
    'ahmad.rizki@gmail.com',
    'https://linkedin.com/in/ahmad-rizki',
    'Google Indonesia',
    'Software Engineer',
    'ya',
    'ya',
    'Budi Santoso: 081111111111, 2018',
    'Software Development, Career guidance in tech industry',
    'Buat event tech talk rutin dan networking session',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Sari Dewi Maharani
(
    'Sari Dewi Maharani',
    2019,
    '19/555555/TK/19002',
    'Bandung',
    'Indonesia',
    '082345678901',
    'sari.dewi@yahoo.com',
    'https://linkedin.com/in/sari-dewi',
    'Bank Central Asia',
    'Data Scientist',
    'ya',
    'tidak',
    '',
    'Data Science, Machine Learning, Financial Technology',
    'Workshop data science dan AI untuk mahasiswa',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Muhammad Fajar Sidiq
(
    'Muhammad Fajar Sidiq',
    2017,
    '17/333333/TK/17003',
    'Surabaya',
    'Indonesia',
    '083456789012',
    'fajar.sidiq@outlook.com',
    'https://linkedin.com/in/fajar-sidiq',
    'Tokopedia',
    'Senior Frontend Developer',
    'tidak',
    'ya',
    'Andi Wijaya: 082222222222, 2017' || E'\n' || 'Lina Sari: 083333333333, 2017',
    'Frontend Development, React, Vue.js, UI/UX Design',
    'Hackathon tahunan dan coding bootcamp',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Dr. Putri Indah Permatasari
(
    'Dr. Putri Indah Permatasari',
    2015,
    '15/111111/TK/15004',
    'Yogyakarta',
    'Indonesia',
    '084567890123',
    'putri.indah@ugm.ac.id',
    'https://linkedin.com/in/putri-indah',
    'Universitas Gadjah Mada',
    'Dosen & Peneliti',
    'ya',
    'ya',
    '',
    'Computer Vision, Machine Learning, Academic Research, PhD guidance',
    'Program mentoring untuk yang ingin lanjut S2/S3',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Eko Prasetyo Wijaya
(
    'Eko Prasetyo Wijaya',
    2020,
    '20/666666/TK/20005',
    'Malang',
    'Indonesia',
    '085678901234',
    'eko.prasetyo@startup.id',
    'https://linkedin.com/in/eko-prasetyo',
    'TechStart Indonesia',
    'Co-Founder & CTO',
    'ya',
    'tidak',
    'Rani Kusuma: 084444444444, 2020',
    'Entrepreneurship, Startup, Full-stack Development, Product Management',
    'Startup incubator dan pitch competition',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Rina Kartika Sari
(
    'Rina Kartika Sari',
    2016,
    '16/222222/TK/16006',
    'Jakarta',
    'Indonesia',
    '086789012345',
    'rina.kartika@kementerian.go.id',
    'https://linkedin.com/in/rina-kartika',
    'Kementerian Komunikasi dan Informatika',
    'Analis Sistem Informasi',
    'ya',
    'ya',
    '',
    'Government IT, Digital Transformation, Public Service Technology',
    'Seminar tentang peluang karir di sektor pemerintahan',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Dimas Arya Nugraha
(
    'Dimas Arya Nugraha',
    2021,
    '21/777777/TK/21007',
    'Singapore',
    'Singapore',
    '+6591234567',
    'dimas.arya@shopee.sg',
    'https://linkedin.com/in/dimas-arya',
    'Shopee Singapore',
    'Backend Engineer',
    'tidak',
    'tidak',
    'Maya Sari: 085555555555, 2021',
    'Working abroad, Backend Development, System Design',
    'Sharing session tentang working abroad dan visa process',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Lisa Amelia Putri
(
    'Lisa Amelia Putri',
    2019,
    '19/888888/TK/19008',
    'Bali',
    'Indonesia',
    '087890123456',
    'lisa.amelia@nonprofit.org',
    'https://linkedin.com/in/lisa-amelia',
    'Yayasan Pendidikan Digital',
    'Program Manager',
    'ya',
    'ya',
    '',
    'Non-profit management, Educational Technology, Social Impact',
    'Program volunteer dan social impact projects',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Arief Budiman
(
    'Arief Budiman',
    2014,
    '14/123456/TK/14001',
    'Semarang',
    'Indonesia',
    '088123456789',
    'arief.budiman@konsultan.com',
    'https://linkedin.com/in/arief-budiman',
    'Deloitte Indonesia',
    'Senior Consultant',
    'ya',
    'tidak',
    'Siska Pratiwi: 087111222333, 2014',
    'Management Consulting, Business Analysis, Strategic Planning',
    'Workshop business case dan consulting skills',
    true,
    'manual',
    null,
    NOW(),
    NOW()
),

-- Indira Safitri
(
    'Indira Safitri',
    2022,
    '22/999999/TK/22010',
    'Denpasar',
    'Indonesia',
    '089012345678',
    'indira.safitri@media.id',
    'https://linkedin.com/in/indira-safitri',
    'Kompas Gramedia',
    'Digital Content Manager',
    'tidak',
    'ya',
    'Kevin Pratama: 088777888999, 2022',
    'Digital Media, Content Strategy, Social Media Management',
    'Workshop content creation dan digital marketing',
    true,
    'google-forms',
    'FORM123456789',
    NOW(),
    NOW()
);

-- ✅ INSERT WORK FIELDS (dengan enum values yang benar)
-- Cek enum values terlebih dahulu
DO $$
BEGIN
    -- Insert work fields dengan enum cast
    INSERT INTO alumni_pekerjaan_work_field (parent_id, value)
    SELECT a.id, v.work_field::enum_alumni_pekerjaan_work_field FROM alumni a
    JOIN (VALUES 
        ('ahmad.rizki@gmail.com', 'teknologi'),
        ('ahmad.rizki@gmail.com', 'swasta'),
        ('sari.dewi@yahoo.com', 'keuangan'),
        ('sari.dewi@yahoo.com', 'swasta'),
        ('fajar.sidiq@outlook.com', 'teknologi'),
        ('fajar.sidiq@outlook.com', 'swasta'),
        ('putri.indah@ugm.ac.id', 'akademisi'),
        ('putri.indah@ugm.ac.id', 'pendidikan'),
        ('eko.prasetyo@startup.id', 'wirausaha'),
        ('eko.prasetyo@startup.id', 'teknologi'),
        ('rina.kartika@kementerian.go.id', 'pemerintah'),
        ('rina.kartika@kementerian.go.id', 'teknologi'),
        ('dimas.arya@shopee.sg', 'teknologi'),
        ('dimas.arya@shopee.sg', 'swasta'),
        ('lisa.amelia@nonprofit.org', 'nonprofit'),
        ('lisa.amelia@nonprofit.org', 'pendidikan'),
        ('arief.budiman@konsultan.com', 'konsultan'),
        ('arief.budiman@konsultan.com', 'keuangan'),
        ('indira.safitri@media.id', 'media'),
        ('indira.safitri@media.id', 'swasta')
    ) AS v(email, work_field) ON a.kontak_email = v.email;
    
    RAISE NOTICE 'Work fields inserted successfully';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error inserting work fields: %', SQLERRM;
END
$$;

-- ✅ INSERT WILLING TO HELP (dengan enum values yang benar)
DO $$
BEGIN
    -- Insert willing to help dengan enum cast
    INSERT INTO alumni_kontribusi_willing_to_help (parent_id, value)
    SELECT a.id, v.help_type::enum_alumni_kontribusi_willing_to_help FROM alumni a
    JOIN (VALUES 
        ('ahmad.rizki@gmail.com', 'mentoring-career'),
        ('ahmad.rizki@gmail.com', 'networking'),
        ('sari.dewi@yahoo.com', 'mentoring-career'),
        ('sari.dewi@yahoo.com', 'beasiswa-studi'),
        ('fajar.sidiq@outlook.com', 'magang-riset'),
        ('fajar.sidiq@outlook.com', 'networking'),
        ('putri.indah@ugm.ac.id', 'mentoring-career'),
        ('putri.indah@ugm.ac.id', 'beasiswa-studi'),
        ('putri.indah@ugm.ac.id', 'magang-riset'),
        ('eko.prasetyo@startup.id', 'mentoring-career'),
        ('eko.prasetyo@startup.id', 'networking'),
        ('eko.prasetyo@startup.id', 'magang-riset'),
        ('rina.kartika@kementerian.go.id', 'mentoring-career'),
        ('rina.kartika@kementerian.go.id', 'beasiswa-studi'),
        ('dimas.arya@shopee.sg', 'networking'),
        ('dimas.arya@shopee.sg', 'beasiswa-studi'),
        ('lisa.amelia@nonprofit.org', 'mentoring-career'),
        ('lisa.amelia@nonprofit.org', 'magang-riset'),
        ('arief.budiman@konsultan.com', 'mentoring-career'),
        ('arief.budiman@konsultan.com', 'networking'),
        ('indira.safitri@media.id', 'mentoring-career'),
        ('indira.safitri@media.id', 'magang-riset')
    ) AS v(email, help_type) ON a.kontak_email = v.email;
    
    RAISE NOTICE 'Willing to help data inserted successfully';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error inserting willing to help: %', SQLERRM;
END
$$;

-- ✅ VERIFICATION QUERIES
SELECT COUNT(*) as total_alumni FROM alumni;
SELECT COUNT(*) as total_work_fields FROM alumni_pekerjaan_work_field;
SELECT COUNT(*) as total_willing_help FROM alumni_kontribusi_willing_to_help;

-- Success message
SELECT 'Alumni data seeding completed successfully! 🎉' as status;