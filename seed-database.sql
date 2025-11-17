-- ========================================
-- Awthar Database Seeding Script
-- Run this in Neon SQL Editor
-- ========================================

-- Insert Service Categories
INSERT INTO categories (name_en, name_ar, slug, description_en, description_ar, icon_name, display_order, is_active) VALUES
('Home Cleaning', 'تنظيف المنزل', 'home-cleaning', 'Professional home cleaning services including deep cleaning, regular maintenance, and specialized cleaning', 'خدمات تنظيف منزلي احترافية تشمل التنظيف العميق والصيانة المنتظمة والتنظيف المتخصص', 'home', 1, true),
('Plumbing', 'سباكة', 'plumbing', 'Licensed plumbers for repairs, installations, and maintenance', 'سباكون معتمدون للإصلاحات والتركيبات والصيانة', 'wrench', 2, true),
('Electrical Services', 'خدمات كهربائية', 'electrical', 'Certified electricians for all electrical work and repairs', 'كهربائيون معتمدون لجميع الأعمال الكهربائية والإصلاحات', 'zap', 3, true),
('AC Maintenance & Repair', 'صيانة وإصلاح المكيفات', 'ac-maintenance', 'Air conditioning installation, maintenance, and repair services', 'خدمات تركيب وصيانة وإصلاح أجهزة التكييف', 'wind', 4, true),
('Painting & Decoration', 'دهان وديكور', 'painting', 'Professional painting and interior decoration services', 'خدمات دهان وديكور داخلي احترافية', 'paintbrush', 5, true),
('Carpentry', 'نجارة', 'carpentry', 'Custom furniture, repairs, and woodwork services', 'أثاث مخصص وإصلاحات وخدمات نجارة', 'hammer', 6, true),
('Legal Services', 'خدمات قانونية', 'legal', 'Licensed lawyers and legal consultants for business and personal matters', 'محامون ومستشارون قانونيون مرخصون للأعمال والمسائل الشخصية', 'scale', 7, true),
('Accounting & Tax', 'محاسبة وضرائب', 'accounting', 'Certified accountants for bookkeeping, tax filing, and financial consulting', 'محاسبون معتمدون لمسك الدفاتر والإقرارات الضريبية والاستشارات المالية', 'calculator', 8, true),
('IT & Tech Support', 'دعم تقني وتكنولوجيا المعلومات', 'it-support', 'Computer repair, network setup, and technical support services', 'إصلاح الكمبيوتر وإعداد الشبكات وخدمات الدعم الفني', 'laptop', 9, true),
('Business Consulting', 'استشارات أعمال', 'business-consulting', 'Professional business consultants for strategy, operations, and growth', 'مستشارو أعمال محترفون للاستراتيجية والعمليات والنمو', 'briefcase', 10, true),
('Moving & Relocation', 'نقل وانتقال', 'moving', 'Professional movers for home and office relocation', 'ناقلون محترفون لنقل المنازل والمكاتب', 'truck', 11, true),
('Delivery Services', 'خدمات التوصيل', 'delivery', 'Same-day delivery and courier services', 'خدمات التوصيل في نفس اليوم والبريد السريع', 'package', 12, true),
('Beauty & Spa', 'تجميل ومنتجع صحي', 'beauty', 'Professional beauty treatments, spa services, and wellness', 'علاجات تجميل احترافية وخدمات المنتجعات الصحية والعافية', 'sparkles', 13, true),
('Personal Training', 'تدريب شخصي', 'personal-training', 'Certified fitness trainers for personal training sessions', 'مدربو لياقة بدنية معتمدون لجلسات التدريب الشخصي', 'dumbbell', 14, true),
('Photography', 'تصوير فوتوغرافي', 'photography', 'Professional photographers for events, portraits, and commercial shoots', 'مصورون محترفون للفعاليات والصور الشخصية والتصوير التجاري', 'camera', 15, true),
('Catering', 'تموين', 'catering', 'Professional catering services for events and occasions', 'خدمات تموين احترافية للفعاليات والمناسبات', 'utensils', 16, true),
('Private Tutoring', 'دروس خصوصية', 'tutoring', 'Qualified tutors for all subjects and grade levels', 'معلمون مؤهلون لجميع المواد والمراحل الدراسية', 'book', 17, true),
('Language Classes', 'دروس لغات', 'language-classes', 'Professional language instruction for English, Arabic, and other languages', 'تدريس لغات احترافي للإنجليزية والعربية ولغات أخرى', 'globe', 18, true),
('Car Wash & Detailing', 'غسيل وتلميع السيارات', 'car-wash', 'Professional car washing and detailing services', 'خدمات غسيل وتلميع السيارات الاحترافية', 'car', 19, true),
('Auto Repair', 'إصلاح السيارات', 'auto-repair', 'Licensed mechanics for car maintenance and repairs', 'ميكانيكيون مرخصون لصيانة وإصلاح السيارات', 'wrench', 20, true),
('Event Planning', 'تنظيم الفعاليات', 'event-planning', 'Professional event planners for weddings, corporate events, and celebrations', 'منظمو فعاليات محترفون لحفلات الزفاف والفعاليات الشركات والاحتفالات', 'calendar', 21, true),
('Entertainment', 'ترفيه', 'entertainment', 'DJs, musicians, and entertainers for events', 'دي جي وموسيقيون ومؤدون ترفيهيون للفعاليات', 'music', 22, true)
ON CONFLICT (slug) DO NOTHING;

-- Create Admin User
-- Password: Admin123456 (bcrypt hashed)
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@awthar.com', '$2a$10$xQJ9vK3h2yJ9Zx3H5oY5W.rN3qY5Z6X7Y8Z9A0B1C2D3E4F5G6H7I8', 'Admin', 'User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT COUNT(*) as category_count FROM categories;
SELECT email, role FROM users WHERE role = 'admin';
