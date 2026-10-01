/**
 * Kamus terjemahan UI: kunci = teks Indonesia yang tampil, nilai = padanan EN.
 *
 * Sumber resmi: PAIRS index.html + `pairs` pelatihan.html + `pairs` detail-kursus.html
 * situs lama (diadaptasi dari pola HTML ke teks React); sisanya terjemahan baru
 * untuk halaman yang tidak ada di situs lama (Berita, Dokumentasi, dsb.).
 * String tanpa entri tetap tampil Indonesia (fallback eksplisit di i18n.tsx).
 */
export const kamusBahasa: Record<string, string> = {
  // — Header & navigasi ————————————————————————————————————————
  Beranda: 'Home',
  Layanan: 'Services',
  Konten: 'Content',
  Tim: 'Team',
  'Tentang Kami': 'About Us',
  Kontak: 'Contact',
  'Hubungi Kami': 'Contact Us',
  'AI Center Ubaya beranda': 'AI Center Ubaya home',
  'Navigasi utama': 'Main navigation',
  'Submenu konten': 'Content submenu',
  'Navigasi seluler': 'Mobile navigation',
  'Buka menu': 'Open menu',
  'Tutup menu': 'Close menu',
  'Lewati ke konten': 'Skip to content',

  // — Footer ——————————————————————————————————————————————————
  'Tentang AI Center': 'About AI Center',
  'Halaman Populer': 'Popular Pages',
  'Halaman populer': 'Popular pages',
  'Layanan AI Center': 'AI Center Services',
  'Pusat riset dan layanan kecerdasan artifisial Universitas Surabaya.':
    'Research center and artificial intelligence services of the University of Surabaya.',
  'Gedung Fakultas Teknik · TA 1.2': 'Engineering Building · TA 1.2',

  // — Umum / halaman ——————————————————————————————————————————
  'Memuat halaman…': 'Loading page…',
  'Kembali ke katalog kursus': 'Back to the course catalog',
  '← Kembali ke katalog kursus': '← Back to the course catalog',
  '404 — Halaman tidak ditemukan': '404 — Page not found',
  'Alamat yang kamu tuju tidak tersedia.': 'The address you requested is unavailable.',
  'Kembali ke Beranda': 'Back to Home',

  // — Halaman Berita ————————————————————————————————————————————
  'Kabar terbaru dan informasi terkini dari AI Center.':
    'The latest news and current information from AI Center.',
  'Cari berita': 'Search news',
  'Cari berita…': 'Search news…',
  'Tidak ada berita yang cocok.': 'No news matches your search.',
  'Berita tidak ditemukan': 'News not found',
  '← Kembali ke daftar berita': '← Back to news list',

  // — Halaman Dokumentasi ————————————————————————————————————————
  Dokumentasi: 'Documentation',
  'Dokumentasi kegiatan, workshop, dan kolaborasi AI Center.':
    'Documentation of AI Center activities, workshops, and collaborations.',
  'Cari dokumentasi': 'Search documentation',
  'Cari dokumentasi…': 'Search documentation…',
  'Tidak ada dokumentasi yang cocok.': 'No documentation matches your search.',
  'Dokumentasi tidak ditemukan': 'Documentation not found',
  '← Kembali ke daftar dokumentasi': '← Back to documentation list',

  // — Beranda: hero ————————————————————————————————————————————
  // (slide hero — teks slide dari backend via GET /api/hero-slides di Beranda)

  // — Beranda: hero (data hero.ts) ————————————————————————————————
  'Jadwalkan Konsultasi AI': 'Schedule an AI Consultation',
  'Mulai Transformasi Bisnis Anda': 'Start Your Business Transformation',
  'Pusat Riset & Layanan': 'Research & Services Center',
  'Kecerdasan Artifisial': 'Artificial Intelligence',
  'Kursus AI/ML dan inference solution untuk sivitas akademika serta mitra industri.':
    'AI/ML courses and inference solutions for academic communities and industry partners.',
  'Lihat Berita': 'View News',
  'Riset · Pelatihan · Layanan': 'Research · Training · Services',
  'Akselerasi Riset dan Produk': 'Research and Product Acceleration',
  'untuk Kebutuhan Nyata': 'for Real-World Needs',
  'Kembangkan dan deploy model Anda sebagai layanan inference dengan pendampingan AI Center.':
    'Develop and deploy your models as inference services with guidance from the AI Center.',
  'Lihat Dokumentasi': 'View Documentation',
  'Tim Kami': 'Our Team',
  'Integrasi model + dukungan teknis': 'Model integration + technical support',
  'Sorotan AI Center': 'AI Center Highlights',
  'Pilih slide': 'Choose slide',

  // — Beranda: layanan ——————————————————————————————————————————
  Pelatihan: 'Training',
  'Belajar AI untuk membuat dampak nyata.': 'Learn AI to create real impact.',
  'Solusi deployment model untuk kebutuhan industri.':
    'Model deployment solutions for industrial needs.',
  'Pilih Jalur Kolaborasimu': 'Choose Your Collaboration Path',
  'Pelatihan dan inference solution untuk kebutuhan nyata.':
    'Training and inference solutions for real-world needs.',
  'Detail Layanan →': 'Service Details →',

  // — Beranda: kontak ———————————————————————————————————————————
  'Sapa kami lewat kanal favoritmu.': 'Reach us through your favorite channel.',
  'Email AI Center': 'AI Center email',
  'WhatsApp AI Center': 'AI Center WhatsApp',
  'Instagram AI Center': 'AI Center Instagram',

  // — Beranda: tentang singkat ———————————————————————————————————
  'Siapa Kami': 'Who We Are',
  'Selengkapnya →': 'Learn More →',

  // — Beranda: portofolio (migrasi index.html) ————————————————————
  'Karya Kami': 'Our Work',
  'Portofolio produk AI': 'AI product portfolio',
  'Sebagian solusi AI yang telah dikembangkan Ubaya AI Center untuk berbagai bidang.':
    'A selection of AI solutions Ubaya AI Center has developed across various fields.',
  'Kesehatan · Computer Vision 3D': 'Healthcare · Computer Vision 3D',
  'Rekomendasi Implan Gigi Otomatis': 'Automated Dental Implant Recommendation',
  'Menganalisis citra CBCT 3D untuk merekomendasikan ukuran, posisi, dan sudut implan gigi secara otomatis.':
    'Analyzes 3D CBCT scans to automatically recommend dental implant size, position, and angle.',
  'Lingkungan · Klasifikasi Citra': 'Environment · Image Classification',
  'Algae Finder': 'Algae Finder',
  'Mendeteksi dan menghitung jenis mikroalga di perairan (mis. Thalassiosira & Nannochloropsis) dari citra mikroskop.':
    'Detects and counts microalgae species in water (e.g. Thalassiosira & Nannochloropsis) from microscope images.',
  'Aksesibilitas · Gesture AI Translator': 'Accessibility · Gesture AI Translator',
  'Translator Bahasa Isyarat': 'Sign Language Translator',
  'Menerjemahkan gerakan bahasa isyarat menjadi teks secara real-time melalui kamera, lengkap dengan skor keyakinan.':
    'Translates sign-language gestures into text in real time via camera, with confidence scores.',
  'Industri · Object Detection': 'Industry · Object Detection',
  'Deteksi Cacat Las (Welding)': 'Weld Defect Detection (Welding)',
  'Menilai kualitas hasil pengelasan — Good Weld, Bad Weld, atau Defect — langsung dari foto sambungan las.':
    'Assesses weld quality — Good Weld, Bad Weld, or Defect — directly from photos of the weld joint.',
  'Kesehatan · Medical Imaging': 'Healthcare · Medical Imaging',
  'Klasifikasi X-Ray Pneumonia': 'X-Ray Pneumonia Classification',
  'Mengklasifikasi citra rontgen dada untuk indikasi pneumonia menggunakan ResNet152V2 + SVM.':
    'Classifies chest X-ray images for pneumonia indication using ResNet152V2 + SVM.',
  'Pangan · Mobile AI': 'Food · Mobile AI',
  'Deteksi Kesegaran Ikan': 'Fish Freshness Detection',
  'Mengenali jenis ikan dan tingkat kesegarannya dari foto, langsung dari ponsel, beserta informasi nutrisi.':
    'Identifies fish species and freshness from a photo, right on your phone, with nutrition info.',
  'Ingin membangun solusi AI seperti ini untuk organisasi Anda?':
    'Want to build AI solutions like these for your organization?',
  'Hubungi kami →': 'Contact us →',

  // — Beranda: fasilitas (migrasi index.html) ————————————————————
  'Lihat Ruangnya': 'Take a Look Inside',
  'Fasilitas yang dirancang untuk berkarya': 'Facilities designed for great work',
  'Ruang demo, ruang pelatihan, dan ruang diskusi — dilengkapi untuk presentasi, kelas, dan kerja tim.':
    'Demo, training, and discussion rooms — equipped for presentations, classes, and teamwork.',
  'Ruang Demo': 'Demo Room',
  'Demo 1 & Demo 2': 'Demo 1 & Demo 2',
  'Ruang berdinding kaca untuk memperagakan produk dan solusi AI kepada mitra dan tamu.':
    'Glass-walled rooms to showcase AI products and solutions to partners and guests.',
  'Ruang Pelatihan': 'Training Room',
  'Kelas & Workshop': 'Class & Workshop',
  'Dilengkapi layar besar dan panel akustik — siap untuk pelatihan, bootcamp, dan sesi praktik.':
    'Equipped with a large screen and acoustic panels — ready for training, bootcamps, and hands-on sessions.',
  'Ruang Diskusi': 'Discussion Room',
  'Meja Kolaborasi': 'Collaboration Table',
  'Ruang diskusi dengan meja bundar dan layar presentasi untuk brainstorming dan rapat tim.':
    'A discussion space with a round table and presentation screen for brainstorming and team meetings.',

  // — Beranda: klien ———————————————————————————————————————————
  'Klien Kami': 'Our Clients',
  Dipercaya: 'Trusted',
  'Mitra yang berkolaborasi dengan AI Center.': 'Partners collaborating with AI Center.',

  // — Beranda: dokumentasi / testimoni / berita ————————————————————
  Kegiatan: 'Activities',
  'Dokumentasi Kegiatan': 'Activity Documentation',
  'Sorotan kegiatan terbaru AI Center.': 'Highlights from the AI Center’s latest activities.',
  'Lihat Semua →': 'View All →',
  Testimoni: 'Testimonials',
  'Apa Kata Mereka?': 'What They Say?',
  'Cerita peserta dan mitra AI Center.': 'Stories from AI Center participants and partners.',
  Berita: 'News',
  'Berita Terkini': 'Latest News',
  'Kabar terbaru AI Center.': 'The latest news from AI Center.',
  'Baca selengkapnya →': 'Read more →',
  'Lihat detail →': 'View details →',
  'Belum ada testimoni.': 'No testimonials yet.',
  'Testimoni sebelumnya': 'Previous testimonial',
  'Testimoni berikutnya': 'Next testimonial',
  '← Sebelumnya': '← Previous',
  'Berikutnya →': 'Next →',

  // — Tentang Kami: visi & misi resmi (migrasi index.html) ————————————
  Tentang: 'About',
  'Layanan utama kami adalah pelatihan AI/ML dan inference solution untuk sivitas akademika serta mitra industri.':
    'Our main services are AI/ML training and inference solutions for academic communities and industry partners.',
  'Visi & Misi': 'Vision & Mission',
  'Arah Kami': 'Our Direction',
  Visi: 'Vision',
  Misi: 'Mission',
  'Misi belum tersedia.': 'Mission not available yet.',
  'Komitmen kami membangun ekosistem kecerdasan buatan yang inovatif, aplikatif, dan berdampak.':
    'Our commitment to building an AI ecosystem that is innovative, applicable, and impactful.',
  'Menjadi AI Solution Factory terdepan': 'To become a leading AI Solution Factory',
  'Menghasilkan produk, menjadi pusat riset, serta meningkatkan kapasitas sumber daya manusia di bidang AI yang memberikan dampak nyata bagi akademik, industri, dan masyarakat.':
    'Creating products, serving as a research hub, and building human-resource capacity in AI that delivers real impact for academia, industry, and society.',
  'Mendorong riset AI yang inovatif dan aplikatif.': 'Drive innovative and applicable AI research.',
  'Menghasilkan produk dan solusi AI yang siap digunakan.':
    'Deliver ready-to-use AI products and solutions.',
  'Mengembangkan talenta AI yang kompeten.': 'Develop competent AI talent.',
  'Membangun kolaborasi strategis dengan pemerintah dan industri.':
    'Build strategic collaboration with government and industry.',
  'Menciptakan ekosistem inovasi dan startup berbasis AI.':
    'Create an AI-based innovation and startup ecosystem.',

  // — Halaman Tim ————————————————————————————————————————————————
  'Struktur tim AI Center Universitas Surabaya.':
    'The team structure of AI Center, Universitas Surabaya.',
  'Cari anggota tim': 'Search team members',
  'Cari anggota tim…': 'Search team members…',
  'Tidak ada anggota tim yang cocok.': 'No team members match your search.',

  // — Halaman Layanan & katalog pelatihan ————————————————————————————
  'Layanan tidak ditemukan': 'Service not found',
  '← Kembali ke daftar layanan': '← Back to services list',
  'Yang Anda dapatkan': 'What You Get',
  '← Semua Layanan': '← All Services',
  'Instruktur:': 'Instructor:',
  'Lihat rincian modul': 'View module details',
  'Lihat detail kursus': 'View course details',
  'Filter kategori kursus': 'Course category filter',
  'Katalog kursus': 'Course catalog',
  'Belajar sesuai tujuan Anda': 'Learn according to your goals',
  'Pilih kursus yang relevan, ikuti materi secara bertahap, dan terapkan AI untuk kebutuhan akademik maupun profesional.':
    'Choose a relevant course, follow the material step by step, and apply AI for academic and professional needs.',
  'Belum ada program untuk kategori ini.': 'No programs in this category yet.',
  'Semua program': 'All programs',
  'Target peserta': 'Target participants',
  'Berbasis proyek': 'Project-based',
  'Online & tatap muka': 'Online & in-person',
  // Panel hero "Cara belajar di sini" + tombol hero (pelatihan.html aside .hero-panel & .hero-actions)
  'Cara belajar di sini': 'How to learn here',
  'Materi yang dekat dengan kebutuhan Anda.': 'Learning built around your needs.',
  'Setiap program dirancang bersama praktisi dan pengajar agar peserta tidak hanya mengenal tools, tetapi mampu menerapkannya dalam pekerjaan nyata.':
    'Each program is designed with practitioners and educators so learners can apply tools to real work.',
  'Jelajahi katalog': 'Browse the catalog',
  'Rancang pelatihan untuk tim': 'Design training for your team',
  'Program praktis dari Ubaya AI Center untuk mahasiswa, dosen, guru, profesional, dan masyarakat umum yang ingin menggunakan AI secara kritis, produktif, dan bertanggung jawab.':
    'A practical program from Ubaya AI Center for students, lecturers, teachers, professionals, and the general public who want to use AI critically, productively, and responsibly.',
  'Workshop & bootcamp terjadwal': 'Scheduled workshops & bootcamps',
  'Pelatihan kustom sesuai kebutuhan': 'Custom training to fit your needs',
  'Sertifikat setelah menyelesaikan program': 'Certificate after completing the program',
  'Layanan deployment model machine learning menjadi solusi inference siap pakai untuk mitra industri, didampingi tim AI Center dari integrasi sampai berjalan di infrastruktur Anda.':
    'Deploy machine learning models into ready-to-use inference solutions for industry partners, guided by the AI Center team from integration to running on your infrastructure.',
  'Deployment model menjadi API layanan': 'Model deployment as a service API',
  'Pendampingan integrasi infrastruktur': 'Infrastructure integration support',
  'Dokumentasi teknis yang jelas': 'Clear technical documentation',
  'Dukungan purna implementasi': 'Post-implementation support',
  // Inference Solution — panel penjelasan, alur kerja, & contoh penerapan (teks baru,
  // disusun dari pemahaman layanan inference; bukan salinan situs lama)
  'Apa itu Inference Solution?': 'What is an Inference Solution?',
  'Inference adalah tahap menjalankan model machine learning untuk memprediksi data baru — bagian yang membuat model benar-benar dipakai, bukan sekadar dilatih. Inference Solution adalah layanan Ubaya AI Center yang mengubah model Anda menjadi layanan siap pakai — biasanya berupa API — sehingga aplikasi, website, atau sistem internal Anda dapat memanggil prediksi kapan pun dibutuhkan, diinfrastruktur yang terkelola dan didampingi tim kami.':
    'Inference is the stage of running a machine learning model to predict new data — the part that puts a model to real use, not just training it. Inference Solution is Ubaya AI Center’s service that turns your model into a ready-to-use service — usually an API — so your application, website, or internal system can call predictions whenever needed, on managed infrastructure guided by our team.',
  'Kapan Anda membutuhkannya?': 'When do you need it?',
  'Model riset atau prototipe sudah jadi, tetapi belum bisa dipakai tim lain':
    'Your research or prototype model is ready but other teams cannot use it yet',
  'Butuh fitur AI di aplikasi atau website tanpa membangun infrastruktur ML sendiri':
    'You need AI features in your app or website without building your own ML infrastructure',
  'Perlu prediksi otomatis yang konsisten untuk gambar, teks, atau data':
    'You need consistent automatic predictions for images, text, or data',
  'Ingin hasil model tetap andal performanya saat dipakai banyak pengguna':
    'You want the model to stay reliable in performance when used by many users',
  'Bagaimana cara kerjanya?': 'How does it work?',
  'Konsultasi & audit kebutuhan': 'Consultation & needs audit',
  'Kami memetakan use case, data, dan model yang sudah — atau yang perlu disiapkan — bersama tim Anda.':
    'We map out the use case, data, and existing model — or what needs to be prepared — with your team.',
  'Persiapan model': 'Model preparation',
  'Model dioptimalkan dan dibungkus agar siap dijalankan di server, termasuk preprocessing dan versi yang terkendali.':
    'The model is optimized and packaged so it is ready to run on the server, including preprocessing and version control.',
  'Deployment sebagai API': 'Deployment as an API',
  'Model dijalankan sebagai endpoint layanan (API) yang stabil, lengkap dengan dokumentasi pemakaian.':
    'The model runs as a stable service endpoint (API), complete with usage documentation.',
  'Integrasi & pengujian': 'Integration & testing',
  'API disambungkan ke aplikasi Anda lalu diuji pada data nyata: akurasi, latensi, dan perilakunya.':
    'The API is connected to your application and tested on real data: accuracy, latency, and behavior.',
  'Operasional & purna implementasi': 'Operations & post-implementation',
  'Monitoring, pembaruan model, dan dukungan teknis agar layanan tetap andal setelah berjalan.':
    'Monitoring, model updates, and technical support to keep the service reliable after launch.',
  'Contoh penerapan': 'Application examples',
  'Beberapa produk AI Center yang menjalankan prediksi model secara langsung:':
    'Several AI Center products that run model predictions directly:',
  'Lihat portofolio lengkap': 'See the full portfolio',
  'Diskusikan kebutuhan Anda': 'Discuss your needs',
  // Modul unggulan (pelatihan.html #unggulan)
  'Modul unggulan · R01': 'Featured module · R01',
  'AI untuk mencari referensi jurnal': 'AI for finding journal references',
  'Program ini membantu peserta membangun kebiasaan riset yang lebih terarah, mulai dari merumuskan pertanyaan hingga menyusun pustaka yang dapat dipertanggungjawabkan.':
    'This program helps participants build a more focused research habit, from formulating questions to compiling a defensible bibliography.',
  'Merumuskan kata kunci dan query akademik': 'Formulate keywords and academic queries',
  'Mencari jurnal dengan Semantic Scholar dan Google Scholar':
    'Find journals with Semantic Scholar and Google Scholar',
  'Menguji relevansi menggunakan Consensus dan Elicit': 'Test relevance using Consensus and Elicit',
  'Meringkas jurnal tanpa kehilangan konteks': 'Summarize journals without losing context',
  'Mengenali halusinasi dan referensi palsu': 'Identify hallucinations and fake references',
  'Mengelola sitasi dengan Zotero atau Mendeley': 'Manage citations with Zotero or Mendeley',
  'Materi lengkap tersedia setelah pendaftaran.': 'Full materials are available after registration.',
  'Preview modul dapat dilihat publik. Video, PDF, latihan, dan kuis akan terbuka setelah pembayaran terverifikasi.':
    'Module previews are public. Videos, PDFs, exercises, and quizzes will open after payment is verified.',
  'Tanyakan program ini': 'Ask about this program',
  // Untuk institusi (pelatihan.html)
  'Untuk institusi': 'For institutions',
  'Butuh pelatihan yang sesuai kebutuhan tim?': 'Need training tailored to your team?',
  'Ubaya AI Center dapat menyusun workshop, bootcamp, atau pendampingan khusus untuk sekolah, kampus, komunitas, dan organisasi.':
    'Ubaya AI Center can design workshops, bootcamps, or tailored mentoring for schools, universities, communities, and organizations.',
  'Diskusikan kebutuhan': 'Discuss your needs',
  // Kursus R01 (detail-kursus.html pairs)
  'AI untuk Mencari dan Mengelola Referensi Jurnal':
    'AI for Finding and Managing Journal References',
  'Bangun alur kerja riset yang lebih terarah dengan bantuan AI, mulai dari menemukan jurnal hingga mengelola sitasi secara bertanggung jawab.':
    'Build a more focused research workflow with AI, from finding journals to managing citations responsibly.',
  'Kursus praktis untuk mahasiswa, dosen, dan masyarakat umum yang ingin memakai AI sebagai alat bantu riset tanpa mengabaikan akurasi, etika, dan integritas akademik.':
    'A practical course for students, lecturers, and the public who want to use AI as a research aid without compromising accuracy, ethics, and academic integrity.',
  'Menguji relevansi sumber dengan tools AI': 'Test source relevance with AI tools',
  'Mengelola sitasi dengan rapi': 'Manage citations neatly',
  'Pengajar dan praktisi riset AI': 'AI research educator and practitioner',
  'Merumuskan pertanyaan dan kata kunci riset': 'Formulate research questions and keywords',
  'Ubah topik menjadi pertanyaan riset dan query akademik yang terarah.':
    'Turn a topic into focused research questions and academic queries.',
  'Mencari jurnal ilmiah dengan Semantic Scholar': 'Find scientific journals with Semantic Scholar',
  'Temukan sumber primer, telusuri sitasi, dan buat daftar bacaan awal.':
    'Find primary sources, trace citations, and build an initial reading list.',
  'Menguji relevansi dengan Consensus dan Elicit': 'Test relevance with Consensus and Elicit',
  'Bandingkan temuan AI dengan isi jurnal dan cek kualitas buktinya.':
    'Compare AI findings with the journal content and check the quality of the evidence.',
  'Meringkas jurnal dan mengelola sitasi': 'Summarize journals and manage citations',
  'Buat ringkasan berbasis konteks dan rapikan pustaka dengan Zotero atau Mendeley.':
    'Create context-based summaries and tidy your bibliography with Zotero or Mendeley.',
  // Kursus E01
  'Merancang Pembelajaran dengan AI': 'Designing Learning with AI',
  'Rancang aktivitas kelas, asesmen, dan umpan balik yang lebih personal dengan AI yang kritis dan bertanggung jawab.':
    'Design class activities, assessments, and feedback that are more personal with critical and responsible AI.',
  'Program untuk pendidik yang ingin mengintegrasikan AI ke dalam perencanaan dan praktik pembelajaran secara efektif.':
    'A program for educators who want to integrate AI into learning planning and practice effectively.',
  'Membuat asesmen yang lebih adaptif': 'Create more adaptive assessments',
  'Menguji kualitas output AI': 'Evaluate the quality of AI output',
  'Menjaga etika dan privasi peserta didik': 'Protect learner ethics and privacy',
  'Memetakan kebutuhan belajar dan tujuan kelas': 'Map learning needs and class goals',
  'Tentukan tujuan belajar dan konteks peserta didik sebelum memakai AI.':
    'Define learning goals and learner context before using AI.',
  'Menyusun materi serta aktivitas pembelajaran': 'Develop learning materials and activities',
  'Kembangkan bahan ajar, aktivitas, dan contoh yang relevan.':
    'Develop relevant teaching materials, activities, and examples.',
  'Membuat asesmen dan rubrik dengan AI': 'Create assessments and rubrics with AI',
  'Rancang asesmen, rubrik, dan umpan balik yang tetap dikontrol pendidik.':
    'Design assessments, rubrics, and feedback that stay under educator control.',
  'Pengajar dan fasilitator pendidikan': 'Educator and learning facilitator',
  'Tim Edukasi Ubaya AI Center': 'Ubaya AI Center Education Team',
  // Kursus P01
  'Produktivitas Akademik dengan AI': 'Academic Productivity with AI',
  'Bangun alur kerja untuk brainstorming, menulis, menganalisis data, dan mempresentasikan ide tanpa mengorbankan integritas akademik.':
    'Build a workflow for brainstorming, writing, analyzing data, and presenting ideas without sacrificing academic integrity.',
  'Kursus fundamental untuk membangun kebiasaan kerja yang lebih produktif dengan AI, dari ide awal hingga presentasi yang terstruktur.':
    'A foundational course for building more productive work habits with AI, from first ideas to structured presentations.',
  'Mengolah ide dan data secara terstruktur': 'Process ideas and data systematically',
  'Memeriksa kualitas tulisan dan analisis': 'Check the quality of writing and analysis',
  'Menggunakan AI secara jujur dan bertanggung jawab': 'Use AI honestly and responsibly',
  'Brainstorming dan perencanaan tugas': 'Brainstorming and assignment planning',
  'Pecah tugas besar menjadi langkah kerja yang jelas dan realistis.':
    'Break big assignments into clear, realistic work steps.',
  'Menulis, menyunting, dan memeriksa ide': 'Write, edit, and review ideas',
  'Gunakan AI sebagai partner berpikir tanpa menggantikan suara penulis.':
    'Use AI as a thinking partner without replacing the writer’s voice.',
  'Menganalisis data dan menyajikan temuan': 'Analyze data and present findings',
  'Ubah data dan ide menjadi kesimpulan serta presentasi yang mudah dipahami.':
    'Turn data and ideas into conclusions and easy-to-understand presentations.',
  'Pengajar dan mentor produktivitas AI': 'Educator and AI productivity mentor',
  'Tim Talenta Ubaya AI Center': 'Ubaya AI Center Talent Team',
  'Tim Riset Ubaya AI Center': 'Ubaya AI Center Research Team',
  Pemula: 'Beginner',
  'Online mandiri': 'Self-paced online',
  Sertifikat: 'Certificate',
  Mahasiswa: 'Students',
  Dosen: 'Lecturers',
  Guru: 'Teachers',
  'Masyarakat umum': 'General public',
  Umum: 'General public',

  // — Halaman detail kursus (LMS) ——————————————————————————————————
  'Kursus tidak ditemukan': 'Course not found',
  'Kode kursus tidak tersedia. Silakan pilih program lain dari katalog.':
    'Course code not available. Please choose another program from the catalog.',
  Level: 'Level',
  Durasi: 'Duration',
  'Format belajar': 'Learning format',
  'Akses kursus': 'Course access',
  'Preview tersedia': 'Preview available',
  'Sedang belajar': 'Learning in progress',
  'Kursus selesai': 'Course completed',
  'Belum dimulai': 'Not started',
  '1 ulasan': '1 review',
  'Mulai belajar': 'Start learning',
  'Tanya & daftar via WhatsApp': 'Ask & register via WhatsApp',
  'Tentang kursus ini': 'About this course',
  'Materi yang akan dipelajari': 'What you will learn',
  'Video, latihan, dan kuis': 'Video, exercises, and quizzes',
  Instruktur: 'Instructor',
  'Informasi kursus': 'Course information',
  'Progress kursus': 'Course progress',
  Penyedia: 'Provider',
  'Akses materi': 'Material access',
  Bahasa: 'Language',
  Tersedia: 'Available',
  Indonesia: 'Indonesian',

  // — Ruang belajar / LMS (detail-kursus.html) ——————————————————————
  'Ruang belajar': 'Learning workspace',
  'Bangun kemampuanmu bertahap.': 'Build your skills step by step.',
  'Selesaikan modul, kerjakan latihan, lalu bawa ide menjadi prototipe.':
    'Complete modules, do the exercises, and turn ideas into prototypes.',
  Selesai: 'Completed',
  Terkunci: 'Locked',
  Ulangi: 'Retry',
  'Selesaikan modul sebelumnya': 'Complete the previous module',
  'Mulai modul': 'Start module',
  'Lesson sudah ditonton': 'Lesson watched',
  'Mulai lesson': 'Start lesson',
  'Checkpoint: apa tujuan utama lesson ini?': 'Checkpoint: what is the main goal of this lesson?',
  '✓ Jawaban benar: terapkan konsep pada masalah nyata':
    '✓ Correct answer: apply the concept to a real problem',
  'Terapkan konsep pada masalah nyata lalu uji hasilnya':
    'Apply the concept to a real problem and test the result',
  'Pilih tools sebanyak mungkin tanpa menguji hasil':
    'Choose as many tools as possible without testing the result',
  'Belum tepat. Pikirkan bagaimana konsep ini diterapkan dan diuji pada masalah nyata.':
    'Not quite. Think about how the concept is applied and tested on a real problem.',
  'Lesson selesai': 'Lesson completed',
  'Belum ditonton': 'Not watched',
  'Checkpoint lulus': 'Checkpoint passed',
  'Checkpoint belum dikerjakan': 'Checkpoint not completed',
  'Tandai belum selesai': 'Mark as incomplete',
  'Selesaikan modul': 'Complete module',
  'Rangkaian kursus': 'Course outline',
  '[TERKUNCI] ': '[LOCKED] ',
  'Prototipe selesai': 'Prototype completed',
  'Proyekmu sudah dicatat.': 'Your project has been recorded.',
  'Selamat, seluruh tahapan kursus ini sudah selesai. Kamu bisa kembali kapan saja untuk memperbaiki catatan prototipe.':
    'Congratulations, all stages of this course are complete. You can come back anytime to update your prototype notes.',
  'Kursus selesai · Progress 100%': 'Course completed · Progress 100%',
  'Rating kamu:': 'Your rating:',
  'Terima kasih sudah memberi penilaian.': 'Thank you for your rating.',
  'Beri rating kursus ini': 'Rate this course',
  'Bagikan pengalamanmu setelah menyelesaikan seluruh materi.':
    'Share your experience after completing all the material.',
  Rating: 'Rating',
  'Pilih rating': 'Choose a rating',
  '★★★★★ Sangat membantu': '★★★★★ Very helpful',
  '★★★★☆ Membantu': '★★★★☆ Helpful',
  '★★★☆☆ Cukup membantu': '★★★☆☆ Somewhat helpful',
  '★★☆☆☆ Kurang membantu': '★★☆☆☆ Less helpful',
  '★☆☆☆☆ Belum membantu': '★☆☆☆☆ Not helpful yet',
  Ulasan: 'Review',
  'Apa yang paling bermanfaat dari kursus ini?':
    'What was most useful about this course?',
  'Kirim rating': 'Submit rating',
  'Tahap akhir': 'Final stage',
  'Prototyping akhir': 'Final prototyping',
  'Selesaikan semua modul terlebih dahulu untuk membuka lembar kerja prototipe.':
    'Complete all modules first to unlock the prototype worksheet.',
  'Ubah masalah nyata menjadi solusi kecil yang bisa diuji. Isi lembar kerja dan simpan hasilnya sebagai proyek akhir.':
    'Turn a real problem into a small testable solution. Fill in the worksheet and save the result as your final project.',
  'Mulai prototyping': 'Start prototyping',
  'Bangun prototipemu': 'Build your prototype',
  'Jelaskan ide secara singkat, pilih tools yang sesuai, lalu masukkan link demo atau file hasil kerja.':
    'Briefly explain the idea, choose suitable tools, then add a demo link or result file.',
  'Masalah yang ingin diselesaikan': 'Problem to solve',
  'Contoh: mahasiswa kesulitan merangkum jurnal':
    'Example: students struggle to summarize journal articles',
  'Target pengguna': 'Target users',
  'Contoh: mahasiswa semester akhir': 'Example: final-year students',
  'Solusi prototipe': 'Prototype solution',
  'Apa yang prototipemu lakukan?': 'What does your prototype do?',
  'Tools yang digunakan': 'Tools used',
  'Contoh: ChatGPT, Figma, Google AI Studio': 'Example: ChatGPT, Figma, Google AI Studio',
  'Link demo atau file hasil': 'Demo link or result file',
  'Simpan prototipe & selesaikan kursus': 'Save prototype & complete course',
  'Coba kerangka modelmu': 'Try your model framework',
  'Masukkan data, pilih tugas model, lalu jalankan simulasi inference di browser.':
    'Enter data, choose a model task, then run the inference simulation in your browser.',
  'Tugas model': 'Model task',
  'Ringkas teks': 'Summarize text',
  'Klasifikasi masalah': 'Classify problem',
  'Buat ide solusi': 'Generate solution ideas',
  'Input model': 'Model input',
  'Contoh: Mahasiswa membutuhkan cara cepat memahami jurnal ilmiah.':
    'Example: Students need a quick way to understand scientific journals.',
  'Jalankan model': 'Run model',
  'Output model akan muncul di sini.': 'Model output will appear here.',
  'Masukkan input terlebih dahulu.': 'Enter an input first.',

  // — Deskripsi profil (migrasi index.html) ————————————————————————
  'Ubaya AI Center adalah AI Solution Factory — ruang di mana riset, talenta, dan komputasi performa tinggi bertemu untuk menghasilkan produk dan dampak nyata bagi akademik, industri, dan masyarakat.':
    'Ubaya AI Center is an AI Solution Factory — a space where research, talent, and high-performance computing meet to create real products and impact for academia, industry, and society.',
};
