import { db } from "./db";
import { categories, users } from "@shared/schema";
import bcrypt from "bcryptjs";

// Real GCC-focused service categories
const seedCategories = [
  // Home Services
  {
    nameEn: "Home Cleaning",
    nameAr: "تنظيف المنزل",
    slug: "home-cleaning",
    descriptionEn: "Professional home cleaning services including deep cleaning, regular maintenance, and specialized cleaning",
    descriptionAr: "خدمات تنظيف منزلي احترافية تشمل التنظيف العميق والصيانة المنتظمة والتنظيف المتخصص",
    iconName: "home",
    displayOrder: 1,
  },
  {
    nameEn: "Plumbing",
    nameAr: "سباكة",
    slug: "plumbing",
    descriptionEn: "Licensed plumbers for repairs, installations, and maintenance",
    descriptionAr: "سباكون معتمدون للإصلاحات والتركيبات والصيانة",
    iconName: "wrench",
    displayOrder: 2,
  },
  {
    nameEn: "Electrical Services",
    nameAr: "خدمات كهربائية",
    slug: "electrical",
    descriptionEn: "Certified electricians for all electrical work and repairs",
    descriptionAr: "كهربائيون معتمدون لجميع الأعمال الكهربائية والإصلاحات",
    iconName: "zap",
    displayOrder: 3,
  },
  {
    nameEn: "AC Maintenance & Repair",
    nameAr: "صيانة وإصلاح المكيفات",
    slug: "ac-maintenance",
    descriptionEn: "Air conditioning installation, maintenance, and repair services",
    descriptionAr: "خدمات تركيب وصيانة وإصلاح أجهزة التكييف",
    iconName: "wind",
    displayOrder: 4,
  },
  {
    nameEn: "Painting & Decoration",
    nameAr: "دهان وديكور",
    slug: "painting",
    descriptionEn: "Professional painting and interior decoration services",
    descriptionAr: "خدمات دهان وديكور داخلي احترافية",
    iconName: "paintbrush",
    displayOrder: 5,
  },
  {
    nameEn: "Carpentry",
    nameAr: "نجارة",
    slug: "carpentry",
    descriptionEn: "Custom furniture, repairs, and woodwork services",
    descriptionAr: "أثاث مخصص وإصلاحات وخدمات نجارة",
    iconName: "hammer",
    displayOrder: 6,
  },
  // Professional Services
  {
    nameEn: "Legal Services",
    nameAr: "خدمات قانونية",
    slug: "legal",
    descriptionEn: "Licensed lawyers and legal consultants for business and personal matters",
    descriptionAr: "محامون ومستشارون قانونيون مرخصون للأعمال والمسائل الشخصية",
    iconName: "scale",
    displayOrder: 7,
  },
  {
    nameEn: "Accounting & Tax",
    nameAr: "محاسبة وضرائب",
    slug: "accounting",
    descriptionEn: "Certified accountants for bookkeeping, tax filing, and financial consulting",
    descriptionAr: "محاسبون معتمدون لمسك الدفاتر والإقرارات الضريبية والاستشارات المالية",
    iconName: "calculator",
    displayOrder: 8,
  },
  {
    nameEn: "IT & Tech Support",
    nameAr: "دعم تقني وتكنولوجيا المعلومات",
    slug: "it-support",
    descriptionEn: "Computer repair, network setup, and technical support services",
    descriptionAr: "إصلاح الكمبيوتر وإعداد الشبكات وخدمات الدعم الفني",
    iconName: "laptop",
    displayOrder: 9,
  },
  {
    nameEn: "Business Consulting",
    nameAr: "استشارات أعمال",
    slug: "business-consulting",
    descriptionEn: "Professional business consultants for strategy, operations, and growth",
    descriptionAr: "مستشارو أعمال محترفون للاستراتيجية والعمليات والنمو",
    iconName: "briefcase",
    displayOrder: 10,
  },
  // Moving & Transport
  {
    nameEn: "Moving & Relocation",
    nameAr: "نقل وانتقال",
    slug: "moving",
    descriptionEn: "Professional movers for home and office relocation",
    descriptionAr: "ناقلون محترفون لنقل المنازل والمكاتب",
    iconName: "truck",
    displayOrder: 11,
  },
  {
    nameEn: "Delivery Services",
    nameAr: "خدمات التوصيل",
    slug: "delivery",
    descriptionEn: "Same-day delivery and courier services",
    descriptionAr: "خدمات التوصيل في نفس اليوم والبريد السريع",
    iconName: "package",
    displayOrder: 12,
  },
  // Personal Services
  {
    nameEn: "Beauty & Spa",
    nameAr: "تجميل ومنتجع صحي",
    slug: "beauty",
    descriptionEn: "Professional beauty treatments, spa services, and wellness",
    descriptionAr: "علاجات تجميل احترافية وخدمات المنتجعات الصحية والعافية",
    iconName: "sparkles",
    displayOrder: 13,
  },
  {
    nameEn: "Personal Training",
    nameAr: "تدريب شخصي",
    slug: "personal-training",
    descriptionEn: "Certified fitness trainers for personal training sessions",
    descriptionAr: "مدربو لياقة بدنية معتمدون لجلسات التدريب الشخصي",
    iconName: "dumbbell",
    displayOrder: 14,
  },
  {
    nameEn: "Photography",
    nameAr: "تصوير فوتوغرافي",
    slug: "photography",
    descriptionEn: "Professional photographers for events, portraits, and commercial shoots",
    descriptionAr: "مصورون محترفون للفعاليات والصور الشخصية والتصوير التجاري",
    iconName: "camera",
    displayOrder: 15,
  },
  {
    nameEn: "Catering",
    nameAr: "تموين",
    slug: "catering",
    descriptionEn: "Professional catering services for events and occasions",
    descriptionAr: "خدمات تموين احترافية للفعاليات والمناسبات",
    iconName: "utensils",
    displayOrder: 16,
  },
  // Education & Tutoring
  {
    nameEn: "Private Tutoring",
    nameAr: "دروس خصوصية",
    slug: "tutoring",
    descriptionEn: "Qualified tutors for all subjects and grade levels",
    descriptionAr: "معلمون مؤهلون لجميع المواد والمراحل الدراسية",
    iconName: "book",
    displayOrder: 17,
  },
  {
    nameEn: "Language Classes",
    nameAr: "دروس لغات",
    slug: "language-classes",
    descriptionEn: "Professional language instruction for English, Arabic, and other languages",
    descriptionAr: "تدريس لغات احترافي للإنجليزية والعربية ولغات أخرى",
    iconName: "globe",
    displayOrder: 18,
  },
  // Vehicle Services
  {
    nameEn: "Car Wash & Detailing",
    nameAr: "غسيل وتلميع السيارات",
    slug: "car-wash",
    descriptionEn: "Professional car washing and detailing services",
    descriptionAr: "خدمات غسيل وتلميع السيارات الاحترافية",
    iconName: "car",
    displayOrder: 19,
  },
  {
    nameEn: "Auto Repair",
    nameAr: "إصلاح السيارات",
    slug: "auto-repair",
    descriptionEn: "Licensed mechanics for car maintenance and repairs",
    descriptionAr: "ميكانيكيون مرخصون لصيانة وإصلاح السيارات",
    iconName: "wrench",
    displayOrder: 20,
  },
  // Event Services
  {
    nameEn: "Event Planning",
    nameAr: "تنظيم الفعاليات",
    slug: "event-planning",
    descriptionEn: "Professional event planners for weddings, corporate events, and celebrations",
    descriptionAr: "منظمو فعاليات محترفون لحفلات الزفاف والفعاليات الشركات والاحتفالات",
    iconName: "calendar",
    displayOrder: 21,
  },
  {
    nameEn: "Entertainment",
    nameAr: "ترفيه",
    slug: "entertainment",
    descriptionEn: "DJs, musicians, and entertainers for events",
    descriptionAr: "دي جي وموسيقيون ومؤدون ترفيهيون للفعاليات",
    iconName: "music",
    displayOrder: 22,
  },
];

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  try {
    // Seed categories
    console.log("📦 Seeding categories...");
    for (const category of seedCategories) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${seedCategories.length} categories`);

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminPassword = await bcrypt.hash("Admin123456", 10);
    await db
      .insert(users)
      .values({
        email: "admin@awthar.com",
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      })
      .onConflictDoNothing();
    console.log("✅ Admin user created (email: admin@awthar.com, password: Admin123456)");

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };
