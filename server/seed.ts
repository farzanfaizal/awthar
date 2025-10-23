import { db } from "./db";
import { categories } from "@shared/schema";

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

export async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Check if categories already exist
    const existingCategories = await db.query.categories.findMany();
    
    if (existingCategories.length === 0) {
      console.log("Inserting categories...");
      await db.insert(categories).values(seedCategories);
      console.log(`✓ Inserted ${seedCategories.length} categories`);
    } else {
      console.log("✓ Categories already exist, skipping seed");
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Auto-run seed
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
