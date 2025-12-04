import { db } from "./db";
import { 
  categories, 
  users, 
  providerProfiles, 
  services, 
  bookings, 
  reviews,
  conversations,
  messages
} from "@shared/schema";
import { hashPassword } from "./auth";

const seedCategories = [
  {
    nameEn: "Home Repair & Maintenance",
    nameAr: "إصلاح وصيانة المنزل",
    slug: "home-repair",
    descriptionEn: "Professional home repair and maintenance services",
    descriptionAr: "خدمات إصلاح وصيانة المنزل المحترفة",
    iconName: "Wrench",
    displayOrder: 1,
  },
  {
    nameEn: "Cleaning Services",
    nameAr: "خدمات التنظيف",
    slug: "cleaning",
    descriptionEn: "Professional cleaning for homes and offices",
    descriptionAr: "التنظيف المحترف للمنازل والمكاتب",
    iconName: "Home",
    displayOrder: 2,
  },
  {
    nameEn: "Professional Services",
    nameAr: "الخدمات المهنية",
    slug: "professional",
    descriptionEn: "Business and professional consulting services",
    descriptionAr: "خدمات الأعمال والاستشارات المهنية",
    iconName: "Briefcase",
    displayOrder: 3,
  },
  {
    nameEn: "Moving & Transport",
    nameAr: "النقل والشحن",
    slug: "moving",
    descriptionEn: "Relocation and transportation services",
    descriptionAr: "خدمات النقل والشحن",
    iconName: "Car",
    displayOrder: 4,
  },
  {
    nameEn: "Personal Services",
    nameAr: "الخدمات الشخصية",
    slug: "personal",
    descriptionEn: "Personal care and lifestyle services",
    descriptionAr: "خدمات العناية الشخصية ونمط الحياة",
    iconName: "Users",
    displayOrder: 5,
  },
  {
    nameEn: "Business Consulting",
    nameAr: "الاستشارات التجارية",
    slug: "consulting",
    descriptionEn: "Expert business consulting and advisory",
    descriptionAr: "استشارات الأعمال والتوجيه الخبير",
    iconName: "TrendingUp",
    displayOrder: 6,
  },
  {
    nameEn: "IT & Technology",
    nameAr: "تكنولوجيا المعلومات",
    slug: "technology",
    descriptionEn: "IT support and technology services",
    descriptionAr: "خدمات دعم تكنولوجيا المعلومات",
    iconName: "Laptop",
    displayOrder: 7,
  },
  {
    nameEn: "Education & Training",
    nameAr: "التعليم والتدريب",
    slug: "education",
    descriptionEn: "Tutoring and professional training",
    descriptionAr: "التدريس والتدريب المهني",
    iconName: "GraduationCap",
    displayOrder: 8,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing data (in reverse order of dependencies)
    console.log("🗑️  Cleaning up old data...");
    await db.delete(messages);
    await db.delete(conversations);
    await db.delete(reviews);
    await db.delete(bookings);
    await db.delete(services);
    await db.delete(providerProfiles);
    await db.delete(users);
    await db.delete(categories);
    console.log("📂 Seeding categories...");
    const categoryMap = new Map();
    for (const cat of seedCategories) {
      // We can just insert since we clear tables, but if re-running without clear, unique constraint on slug handles it?
      // For simplicity with delete-all strategy:
      const [inserted] = await db.insert(categories).values(cat).returning();
      categoryMap.set(cat.slug, inserted.id);
    }

    // 2. Users & Profiles
    console.log("👥 Seeding users and providers...");

    const defaultPassword = await hashPassword("password123");

    // Helper to create user/provider pair
    const createProvider = async (email: string, firstName: string, lastName: string, profileData: any) => {
      const [user] = await db.insert(users).values({
        email,
        password: defaultPassword,
        firstName,
        lastName,
        role: "provider",
        profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      }).returning();

      const [profile] = await db.insert(providerProfiles).values({
        userId: user.id,
        ...profileData,
      }).returning();
      
      return { user, profile };
    };

    // Provider 1: Ahmed (Plumber)
    const ahmed = await createProvider("ahmed.m@example.com", "Ahmed", "Al-Mansouri", {
      providerType: "licensed_professional",
      companyName: "Al-Mansouri Technical Services",
      bio: "Certified plumber and electrician with 15 years of experience in Dubai. Specialized in emergency repairs and home maintenance.",
      phone: "+971500000001",
      verificationStatus: "verified",
      rating: "4.9",
      ratingSum: 245,
      totalReviews: 50,
      completedJobs: 120,
      responseTime: 60,
      serviceAreas: { emirates: ["Dubai", "Sharjah"] },
      isPremium: true,
    });

    // Provider 2: Sara (Cleaner)
    const sara = await createProvider("sara.cleaning@example.com", "Sara", "Trading", {
      providerType: "licensed_professional",
      companyName: "Sara Cleaning Solutions LLC",
      bio: "Professional cleaning services for homes and offices. We use eco-friendly products and have a team of trained staff.",
      phone: "+971500000002",
      verificationStatus: "verified",
      rating: "4.8",
      ratingSum: 432,
      totalReviews: 90,
      completedJobs: 200,
      responseTime: 120,
      serviceAreas: { emirates: ["Dubai", "Abu Dhabi"] },
      isPremium: true,
    });

    // Provider 3: Mohammed (IT)
    const mo = await createProvider("mo.tech@example.com", "Mohammed", "Ali", {
      providerType: "casual_tasker",
      companyName: "Mo Tech Support",
      bio: "IT expert offering computer repair, network setup, and software troubleshooting. Fast and reliable service.",
      phone: "+971500000003",
      verificationStatus: "verified",
      rating: "5.0",
      ratingSum: 100,
      totalReviews: 20,
      completedJobs: 45,
      responseTime: 30,
      serviceAreas: { emirates: ["Abu Dhabi"] },
      isPremium: false,
    });

    // Provider 4: John (Mover)
    const john = await createProvider("john.movers@example.com", "John", "Doe", {
      providerType: "licensed_professional",
      companyName: "Quick Move LLC",
      bio: "Reliable moving and packing services for residential and commercial relocations. We handle your belongings with care.",
      phone: "+971500000004",
      verificationStatus: "verified",
      rating: "4.7",
      ratingSum: 141,
      totalReviews: 30,
      completedJobs: 80,
      responseTime: 45,
      serviceAreas: { emirates: ["Dubai", "Sharjah", "Ajman"] },
      isPremium: false,
    });

    // Provider 5: Fatima (Tutor)
    const fatima = await createProvider("fatima.tutor@example.com", "Fatima", "Al-Zahra", {
      providerType: "casual_tasker",
      companyName: "Fatima Private Tutoring",
      bio: "Experienced math and science tutor for high school students. Bilingual (Arabic/English).",
      phone: "+971500000005",
      verificationStatus: "verified",
      rating: "4.9",
      ratingSum: 98,
      totalReviews: 20,
      completedJobs: 60,
      responseTime: 90,
      serviceAreas: { emirates: ["Dubai"] },
      isPremium: false,
    });

    // Provider 6: Karim (AC Specialist)
    const karim = await createProvider("karim.ac@example.com", "Karim", "Nasser", {
      providerType: "licensed_professional",
      companyName: "Cool Breeze AC Services",
      bio: "Specialized AC technicians for all types of units (Split, Central, Chiller). Summer maintenance packages available.",
      phone: "+971500000006",
      verificationStatus: "verified",
      rating: "4.6",
      ratingSum: 230,
      totalReviews: 50,
      completedJobs: 150,
      responseTime: 60,
      serviceAreas: { emirates: ["Dubai", "Sharjah", "Ajman"] },
      isPremium: true,
    });

    // Provider 7: Elena (Personal Trainer)
    const elena = await createProvider("elena.fit@example.com", "Elena", "Popova", {
      providerType: "casual_tasker",
      companyName: "Elena Fitness Coach",
      bio: "Certified personal trainer specializing in weight loss, strength training, and yoga. Home sessions available for ladies.",
      phone: "+971500000007",
      verificationStatus: "verified",
      rating: "5.0",
      ratingSum: 75,
      totalReviews: 15,
      completedJobs: 40,
      responseTime: 120,
      serviceAreas: { emirates: ["Dubai"] },
      isPremium: false,
    });

    // Customer 1
    const [customer1] = await db.insert(users).values({
      email: "customer1@example.com",
      password: defaultPassword,
      firstName: "Khalid",
      lastName: "Hassan",
      role: "customer",
      profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid",
    }).returning();

    // 3. Services
    console.log("🛠️  Seeding services...");
    
    // Ahmed's Services
    const [plumbingService] = await db.insert(services).values({
      providerId: ahmed.profile.id,
      categoryId: categoryMap.get("home-repair"),
      titleEn: "Emergency Plumbing Service",
      titleAr: "خدمة سباكة طارئة",
      descriptionEn: "24/7 emergency plumbing service for leaks, clogs, and pipe bursts. Fast response time guaranteed.",
      descriptionAr: "خدمة سباكة طارئة على مدار 24 ساعة للتسريبات والانسدادات.",
      pricingType: "fixed",
      priceMin: "150.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Dubai", area: "Downtown" },
      isFeatured: true,
    }).returning();

    await db.insert(services).values({
      providerId: ahmed.profile.id,
      categoryId: categoryMap.get("home-repair"),
      titleEn: "Electrical Maintenance",
      titleAr: "صيانة كهربائية",
      descriptionEn: "Full home electrical checkup and maintenance. Fixture installation and wiring repair.",
      descriptionAr: "فحص وصيانة كهربائية كاملة للمنزل.",
      pricingType: "hourly",
      priceMin: "200.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Dubai", area: "Marina" },
    });

    // Sara's Services
    const [cleaningService] = await db.insert(services).values({
      providerId: sara.profile.id,
      categoryId: categoryMap.get("cleaning"),
      titleEn: "Deep Home Cleaning",
      titleAr: "تنظيف منزلي عميق",
      descriptionEn: "Comprehensive deep cleaning for apartments and villas. Includes kitchen and bathroom sanitization.",
      descriptionAr: "تنظيف عميق شامل للشقق والفلل.",
      pricingType: "hourly",
      priceMin: "35.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Dubai", area: "Jumeirah" },
      isFeatured: true,
    }).returning();

    // Mo's Services
    await db.insert(services).values({
      providerId: mo.profile.id,
      categoryId: categoryMap.get("technology"),
      titleEn: "Home Network Setup",
      titleAr: "إعداد الشبكة المنزلية",
      descriptionEn: "Professional WiFi and network installation for seamless connectivity.",
      descriptionAr: "تركيب واي فاي وشبكة احترافية.",
      pricingType: "fixed",
      priceMin: "250.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Abu Dhabi", area: "Reem Island" },
      isFeatured: true,
    });

    await db.insert(services).values({
      providerId: mo.profile.id,
      categoryId: categoryMap.get("technology"),
      titleEn: "Data Recovery Service",
      titleAr: "خدمة استعادة البيانات",
      descriptionEn: "Recover lost data from hard drives, USBs, and memory cards. Confidentiality guaranteed.",
      descriptionAr: "استعادة البيانات المفقودة من الأقراص الصلبة وبطاقات الذاكرة.",
      pricingType: "fixed",
      priceMin: "400.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Abu Dhabi", area: "Reem Island" },
      isFeatured: false,
    });

    // John's Services
    await db.insert(services).values({
      providerId: john.profile.id,
      categoryId: categoryMap.get("moving"),
      titleEn: "Apartment Moving Service",
      titleAr: "خدمة نقل الشقق",
      descriptionEn: "Full service moving for studios and 1-bedroom apartments. Includes packing materials.",
      descriptionAr: "خدمة نقل شاملة للاستوديوهات والشقق بغرفة واحدة.",
      pricingType: "fixed",
      priceMin: "1200.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Dubai", area: "Deira" },
      isFeatured: false,
    });

    // Fatima's Services
    await db.insert(services).values({
      providerId: fatima.profile.id,
      categoryId: categoryMap.get("education"),
      titleEn: "Math Tutoring (High School)",
      titleAr: "دروس خصوصية في الرياضيات",
      descriptionEn: "Private math tutoring for grades 9-12. Exam preparation and homework help.",
      descriptionAr: "دروس خصوصية في الرياضيات للصفوف 9-12.",
      pricingType: "hourly",
      priceMin: "150.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Dubai", area: "Al Barsha" },
      isFeatured: true,
    });

    // Karim's Services
    await db.insert(services).values({
      providerId: karim.profile.id,
      categoryId: categoryMap.get("home-repair"),
      titleEn: "AC Cleaning & Servicing",
      titleAr: "تنظيف وصيانة التكييف",
      descriptionEn: "Complete AC duct cleaning, gas top-up, and filter cleaning. Improving air quality and efficiency.",
      descriptionAr: "تنظيف شامل لمكيفات الهواء وتعبئة الغاز.",
      pricingType: "fixed",
      priceMin: "100.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Dubai", area: "Mirdif" },
      isFeatured: true,
    });

    // Elena's Services
    await db.insert(services).values({
      providerId: elena.profile.id,
      categoryId: categoryMap.get("personal"),
      titleEn: "Personal Fitness Training",
      titleAr: "تدريب لياقة بدنية شخصي",
      descriptionEn: "Customized workout plans and 1-on-1 coaching sessions at your home or gym.",
      descriptionAr: "برامج تدريب مخصصة وجلسات تدريب شخصي.",
      pricingType: "hourly",
      priceMin: "250.00",
      currency: "AED",
      status: "active",
      location: { emirate: "Dubai", area: "Palm Jumeirah" },
      isFeatured: true,
    });

    // 4. Bookings & Reviews
    console.log("📅 Seeding bookings and reviews...");

    // Completed booking for Ahmed
    const [booking1] = await db.insert(bookings).values({
      serviceId: plumbingService.id,
      customerId: customer1.id,
      providerId: ahmed.profile.id,
      status: "completed",
      scheduledDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
      completedDate: new Date(Date.now() - 86400000 * 4),
      agreedPrice: "150.00",
    }).returning();

    await db.insert(reviews).values({
      bookingId: booking1.id,
      providerId: ahmed.profile.id,
      customerId: customer1.id,
      rating: 5,
      comment: "Excellent service! Ahmed arrived on time and fixed the leak very quickly. Highly recommended.",
      isVerified: true,
    });

    // Completed booking for Sara
    const [booking2] = await db.insert(bookings).values({
      serviceId: cleaningService.id,
      customerId: customer1.id,
      providerId: sara.profile.id,
      status: "completed",
      scheduledDate: new Date(Date.now() - 86400000 * 10),
      completedDate: new Date(Date.now() - 86400000 * 10),
      agreedPrice: "140.00",
    }).returning();

    await db.insert(reviews).values({
      bookingId: booking2.id,
      providerId: sara.profile.id,
      customerId: customer1.id,
      rating: 4,
      comment: "Great cleaning, very thorough. Just arrived a bit late.",
      isVerified: true,
    });

    // Upcoming booking
    await db.insert(bookings).values({
      serviceId: cleaningService.id,
      customerId: customer1.id,
      providerId: sara.profile.id,
      status: "accepted",
      scheduledDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      agreedPrice: "140.00",
    });

    // Pending booking
    await db.insert(bookings).values({
      serviceId: plumbingService.id,
      customerId: customer1.id,
      providerId: ahmed.profile.id,
      status: "pending",
      scheduledDate: new Date(Date.now() + 86400000 * 5),
      agreedPrice: "200.00",
    });

    console.log("✅ Database seeding completed successfully!");
    console.log("🔑 Default password for all users: password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
