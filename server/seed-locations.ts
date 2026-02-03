import { config } from "dotenv";
config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "../shared/schema";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// UAE Locations Data - Comprehensive list of areas
const UAE_LOCATIONS = [
  // Dubai - Popular Areas
  { name: "Dubai Marina", nameAr: "دبي مارينا", emirate: "Dubai", lat: 25.0805, lng: 55.1403, popular: true },
  { name: "Downtown Dubai", nameAr: "وسط دبي", emirate: "Dubai", lat: 25.1972, lng: 55.2744, popular: true },
  { name: "JLT (Jumeirah Lake Towers)", nameAr: "أبراج بحيرات جميرا", emirate: "Dubai", lat: 25.0693, lng: 55.1442, popular: true },
  { name: "Business Bay", nameAr: "الخليج التجاري", emirate: "Dubai", lat: 25.1851, lng: 55.2628, popular: true },
  { name: "Palm Jumeirah", nameAr: "نخلة جميرا", emirate: "Dubai", lat: 25.1124, lng: 55.1390, popular: true },
  { name: "Jumeirah Beach Residence (JBR)", nameAr: "جميرا بيتش ريزيدنس", emirate: "Dubai", lat: 25.0780, lng: 55.1343, popular: true },
  { name: "DIFC", nameAr: "مركز دبي المالي العالمي", emirate: "Dubai", lat: 25.2100, lng: 55.2750, popular: true },
  { name: "Dubai Internet City", nameAr: "مدينة دبي للإنترنت", emirate: "Dubai", lat: 25.0958, lng: 55.1522, popular: true },
  { name: "Dubai Media City", nameAr: "مدينة دبي للإعلام", emirate: "Dubai", lat: 25.0917, lng: 55.1500, popular: true },
  { name: "Barsha Heights (TECOM)", nameAr: "البرشاء هايتس", emirate: "Dubai", lat: 25.0986, lng: 55.1758, popular: true },
  { name: "Discovery Gardens", nameAr: "حدائق الاكتشاف", emirate: "Dubai", lat: 25.0417, lng: 55.1344, popular: true },
  { name: "Dubai Sports City", nameAr: "مدينة دبي الرياضية", emirate: "Dubai", lat: 25.0356, lng: 55.2222, popular: true },
  { name: "Dubai Hills Estate", nameAr: "دبي هيلز استيت", emirate: "Dubai", lat: 25.1167, lng: 55.2167, popular: true },
  { name: "City Walk", nameAr: "سيتي ووك", emirate: "Dubai", lat: 25.2089, lng: 55.2622, popular: true },
  { name: "Al Barsha", nameAr: "البرشاء", emirate: "Dubai", lat: 25.1000, lng: 55.2000, popular: true },

  // Dubai - Residential Areas
  { name: "Jumeirah", nameAr: "جميرا", emirate: "Dubai", lat: 25.2154, lng: 55.2553, popular: true },
  { name: "Jumeirah Village Circle (JVC)", nameAr: "قرية جميرا الدائرية", emirate: "Dubai", lat: 25.0547, lng: 55.2094, popular: true },
  { name: "Jumeirah Village Triangle (JVT)", nameAr: "قرية جميرا المثلثة", emirate: "Dubai", lat: 25.0614, lng: 55.1944, popular: true },
  { name: "Arabian Ranches", nameAr: "المرابع العربية", emirate: "Dubai", lat: 25.0445, lng: 55.2677, popular: true },
  { name: "Emirates Hills", nameAr: "تلال الإمارات", emirate: "Dubai", lat: 25.0678, lng: 55.1556, popular: true },
  { name: "The Springs", nameAr: "الينابيع", emirate: "Dubai", lat: 25.0378, lng: 55.1889, popular: true },
  { name: "The Meadows", nameAr: "المروج", emirate: "Dubai", lat: 25.0433, lng: 55.1600, popular: false },
  { name: "The Lakes", nameAr: "البحيرات", emirate: "Dubai", lat: 25.0536, lng: 55.1622, popular: false },
  { name: "The Greens", nameAr: "الخضراء", emirate: "Dubai", lat: 25.0897, lng: 55.1603, popular: true },
  { name: "The Views", nameAr: "ذا فيوز", emirate: "Dubai", lat: 25.0811, lng: 55.1589, popular: false },
  { name: "Motor City", nameAr: "موتور سيتي", emirate: "Dubai", lat: 25.0392, lng: 55.2314, popular: true },
  { name: "Town Square", nameAr: "تاون سكوير", emirate: "Dubai", lat: 25.0000, lng: 55.2667, popular: true },
  { name: "Mirdif", nameAr: "مردف", emirate: "Dubai", lat: 25.2217, lng: 55.4183, popular: true },
  { name: "International City", nameAr: "المدينة العالمية", emirate: "Dubai", lat: 25.1722, lng: 55.4114, popular: true },
  { name: "Dragon Mart", nameAr: "دراجون مارت", emirate: "Dubai", lat: 25.1747, lng: 55.4103, popular: true },
  { name: "Dubai Production City (IMPZ)", nameAr: "مدينة دبي للإنتاج", emirate: "Dubai", lat: 25.0217, lng: 55.1742, popular: true },
  { name: "Al Warqaa", nameAr: "الورقاء", emirate: "Dubai", lat: 25.2022, lng: 55.4053, popular: false },
  { name: "Al Rashidiya", nameAr: "الراشدية", emirate: "Dubai", lat: 25.2311, lng: 55.3833, popular: false },
  { name: "Dubai Festival City", nameAr: "مدينة دبي للمهرجانات", emirate: "Dubai", lat: 25.2217, lng: 55.3553, popular: true },
  { name: "Umm Suqeim", nameAr: "أم سقيم", emirate: "Dubai", lat: 25.1344, lng: 55.1864, popular: true },
  { name: "Al Sufouh", nameAr: "الصفوح", emirate: "Dubai", lat: 25.1128, lng: 55.1625, popular: true },
  { name: "Damac Hills", nameAr: "داماك هيلز", emirate: "Dubai", lat: 25.0469, lng: 55.2264, popular: true },
  { name: "Remraam", nameAr: "ريمرام", emirate: "Dubai", lat: 25.0158, lng: 55.2711, popular: true },
  { name: "Arjan", nameAr: "عرجان", emirate: "Dubai", lat: 25.0575, lng: 55.2322, popular: true },

  // Dubai - Commercial/Traditional Areas
  { name: "Deira", nameAr: "ديرة", emirate: "Dubai", lat: 25.2697, lng: 55.3095, popular: true },
  { name: "Bur Dubai", nameAr: "بر دبي", emirate: "Dubai", lat: 25.2532, lng: 55.2925, popular: true },
  { name: "Al Quoz", nameAr: "القوز", emirate: "Dubai", lat: 25.1333, lng: 55.2333, popular: false },
  { name: "Al Karama", nameAr: "الكرامة", emirate: "Dubai", lat: 25.2456, lng: 55.3047, popular: false },
  { name: "Oud Metha", nameAr: "عود ميثاء", emirate: "Dubai", lat: 25.2333, lng: 55.3167, popular: false },
  { name: "Al Garhoud", nameAr: "القرهود", emirate: "Dubai", lat: 25.2403, lng: 55.3450, popular: false },
  { name: "Al Nahda Dubai", nameAr: "النهضة دبي", emirate: "Dubai", lat: 25.2833, lng: 55.3667, popular: false },
  { name: "Al Mamzar", nameAr: "الممزر", emirate: "Dubai", lat: 25.2900, lng: 55.3456, popular: false },
  { name: "Al Qusais", nameAr: "القصيص", emirate: "Dubai", lat: 25.2667, lng: 55.3833, popular: false },
  { name: "Hor Al Anz", nameAr: "هور العنز", emirate: "Dubai", lat: 25.2722, lng: 55.3322, popular: false },
  { name: "Al Muteena", nameAr: "المطينة", emirate: "Dubai", lat: 25.2789, lng: 55.3244, popular: false },
  { name: "Al Rigga", nameAr: "الرقة", emirate: "Dubai", lat: 25.2664, lng: 55.3156, popular: false },
  { name: "Naif", nameAr: "نايف", emirate: "Dubai", lat: 25.2711, lng: 55.3078, popular: false },

  // Dubai - Tech/Industrial
  { name: "Dubai Silicon Oasis", nameAr: "واحة دبي للسيليكون", emirate: "Dubai", lat: 25.1212, lng: 55.3773, popular: false },
  { name: "Dubai Knowledge Park", nameAr: "مجمع دبي للمعرفة", emirate: "Dubai", lat: 25.0875, lng: 55.1486, popular: false },
  { name: "Dubai Design District (D3)", nameAr: "حي دبي للتصميم", emirate: "Dubai", lat: 25.1931, lng: 55.2833, popular: false },
  { name: "Dubai Industrial City", nameAr: "مدينة دبي الصناعية", emirate: "Dubai", lat: 24.9667, lng: 55.1333, popular: false },
  { name: "Jebel Ali", nameAr: "جبل علي", emirate: "Dubai", lat: 24.9833, lng: 55.0333, popular: false },
  { name: "Dubai Investment Park", nameAr: "مجمع دبي للاستثمار", emirate: "Dubai", lat: 24.9833, lng: 55.1500, popular: false },

  // Dubai - New Areas
  { name: "Dubai Creek Harbour", nameAr: "ميناء خور دبي", emirate: "Dubai", lat: 25.2000, lng: 55.3333, popular: false },
  { name: "Dubai South", nameAr: "دبي الجنوب", emirate: "Dubai", lat: 24.8833, lng: 55.1667, popular: false },
  { name: "Bluewaters Island", nameAr: "جزيرة بلوواترز", emirate: "Dubai", lat: 25.0792, lng: 55.1194, popular: true },
  { name: "La Mer", nameAr: "لا مير", emirate: "Dubai", lat: 25.2350, lng: 55.2617, popular: true },
  { name: "Al Jaddaf", nameAr: "الجداف", emirate: "Dubai", lat: 25.2181, lng: 55.3306, popular: false },
  { name: "Culture Village", nameAr: "قرية الثقافة", emirate: "Dubai", lat: 25.2142, lng: 55.3361, popular: false },

  // Abu Dhabi - Popular Areas
  { name: "Abu Dhabi Corniche", nameAr: "كورنيش أبوظبي", emirate: "Abu Dhabi", lat: 24.4700, lng: 54.3300, popular: true },
  { name: "Al Reem Island", nameAr: "جزيرة الريم", emirate: "Abu Dhabi", lat: 24.4978, lng: 54.4031, popular: true },
  { name: "Yas Island", nameAr: "جزيرة ياس", emirate: "Abu Dhabi", lat: 24.4883, lng: 54.6078, popular: true },
  { name: "Saadiyat Island", nameAr: "جزيرة السعديات", emirate: "Abu Dhabi", lat: 24.5333, lng: 54.4333, popular: true },
  { name: "Al Maryah Island", nameAr: "جزيرة المارية", emirate: "Abu Dhabi", lat: 24.4983, lng: 54.3967, popular: true },
  { name: "Masdar City", nameAr: "مدينة مصدر", emirate: "Abu Dhabi", lat: 24.4278, lng: 54.6158, popular: true },
  { name: "Khalifa City", nameAr: "مدينة خليفة", emirate: "Abu Dhabi", lat: 24.4167, lng: 54.5833, popular: true },

  // Abu Dhabi - Residential
  { name: "Mohammed Bin Zayed City", nameAr: "مدينة محمد بن زايد", emirate: "Abu Dhabi", lat: 24.3500, lng: 54.5500, popular: true },
  { name: "Al Raha Beach", nameAr: "شاطئ الراحة", emirate: "Abu Dhabi", lat: 24.4583, lng: 54.6000, popular: true },
  { name: "Al Reef", nameAr: "الريف", emirate: "Abu Dhabi", lat: 24.3667, lng: 54.6167, popular: false },
  { name: "Al Ghadeer", nameAr: "الغدير", emirate: "Abu Dhabi", lat: 24.3500, lng: 54.7000, popular: false },
  { name: "Al Shamkha", nameAr: "الشامخة", emirate: "Abu Dhabi", lat: 24.3333, lng: 54.6667, popular: false },
  { name: "Baniyas", nameAr: "بني ياس", emirate: "Abu Dhabi", lat: 24.3000, lng: 54.6333, popular: false },

  // Abu Dhabi - Traditional/Downtown
  { name: "Al Zahiyah (Tourist Club Area)", nameAr: "الزاهية", emirate: "Abu Dhabi", lat: 24.4833, lng: 54.3667, popular: false },
  { name: "Al Khalidiyah", nameAr: "الخالدية", emirate: "Abu Dhabi", lat: 24.4667, lng: 54.3500, popular: false },
  { name: "Al Manaseer", nameAr: "المناصير", emirate: "Abu Dhabi", lat: 24.4500, lng: 54.3833, popular: false },
  { name: "Al Muroor", nameAr: "المرور", emirate: "Abu Dhabi", lat: 24.4500, lng: 54.4000, popular: false },
  { name: "Al Mushrif", nameAr: "المشرف", emirate: "Abu Dhabi", lat: 24.4333, lng: 54.4167, popular: false },
  { name: "Al Nahyan", nameAr: "النهيان", emirate: "Abu Dhabi", lat: 24.4667, lng: 54.4000, popular: false },
  { name: "Al Karamah", nameAr: "الكرامة", emirate: "Abu Dhabi", lat: 24.4583, lng: 54.3750, popular: false },
  { name: "Hamdan Street", nameAr: "شارع حمدان", emirate: "Abu Dhabi", lat: 24.4900, lng: 54.3600, popular: false },
  { name: "Electra Street", nameAr: "شارع إلكترا", emirate: "Abu Dhabi", lat: 24.4850, lng: 54.3700, popular: false },

  // Al Ain
  { name: "Al Ain City", nameAr: "مدينة العين", emirate: "Abu Dhabi", lat: 24.2075, lng: 55.7447, popular: true },
  { name: "Al Ain Oasis", nameAr: "واحة العين", emirate: "Abu Dhabi", lat: 24.2167, lng: 55.7667, popular: false },
  { name: "Zakher", nameAr: "زاخر", emirate: "Abu Dhabi", lat: 24.1833, lng: 55.7667, popular: false },
  { name: "Al Jimi", nameAr: "الجيمي", emirate: "Abu Dhabi", lat: 24.2333, lng: 55.7333, popular: false },
  { name: "Al Muwaiji", nameAr: "المويجعي", emirate: "Abu Dhabi", lat: 24.2000, lng: 55.7333, popular: false },
  { name: "Al Towayya", nameAr: "التوية", emirate: "Abu Dhabi", lat: 24.2167, lng: 55.7833, popular: false },

  // Sharjah - Popular
  { name: "Al Majaz", nameAr: "المجاز", emirate: "Sharjah", lat: 25.3333, lng: 55.3833, popular: true },
  { name: "Al Nahda Sharjah", nameAr: "النهضة الشارقة", emirate: "Sharjah", lat: 25.3050, lng: 55.3700, popular: true },
  { name: "Al Khan", nameAr: "الخان", emirate: "Sharjah", lat: 25.3317, lng: 55.3922, popular: true },
  { name: "Al Qasimia", nameAr: "القاسمية", emirate: "Sharjah", lat: 25.3500, lng: 55.4000, popular: true },
  { name: "Muwaileh", nameAr: "مويلح", emirate: "Sharjah", lat: 25.2833, lng: 55.4667, popular: true },
  { name: "Al Taawun", nameAr: "التعاون", emirate: "Sharjah", lat: 25.3167, lng: 55.3833, popular: false },
  { name: "Al Mamzar Sharjah", nameAr: "الممزر الشارقة", emirate: "Sharjah", lat: 25.3000, lng: 55.3500, popular: false },
  { name: "Abu Shagara", nameAr: "أبو شغارة", emirate: "Sharjah", lat: 25.3333, lng: 55.4000, popular: false },
  { name: "Al Nabba", nameAr: "النبعة", emirate: "Sharjah", lat: 25.3583, lng: 55.4000, popular: false },
  { name: "Industrial Area Sharjah", nameAr: "المنطقة الصناعية الشارقة", emirate: "Sharjah", lat: 25.3000, lng: 55.4333, popular: true },
  { name: "University City Sharjah", nameAr: "المدينة الجامعية الشارقة", emirate: "Sharjah", lat: 25.2833, lng: 55.4667, popular: true },
  { name: "Sharjah Waterfront", nameAr: "كورنيش الشارقة", emirate: "Sharjah", lat: 25.3547, lng: 55.3856, popular: true },
  { name: "Al Fisht", nameAr: "الفشت", emirate: "Sharjah", lat: 25.3667, lng: 55.3833, popular: false },
  { name: "Al Gharb", nameAr: "الغرب", emirate: "Sharjah", lat: 25.3583, lng: 55.3750, popular: false },
  { name: "Sharjah Waterfront City", nameAr: "مدينة الشارقة الواجهة البحرية", emirate: "Sharjah", lat: 25.3667, lng: 55.3500, popular: false },

  // Ajman
  { name: "Ajman Downtown", nameAr: "وسط عجمان", emirate: "Ajman", lat: 25.4052, lng: 55.5136, popular: true },
  { name: "Al Nuaimiya", nameAr: "النعيمية", emirate: "Ajman", lat: 25.3833, lng: 55.4333, popular: true },
  { name: "Al Rashidiya Ajman", nameAr: "الراشدية عجمان", emirate: "Ajman", lat: 25.4000, lng: 55.4667, popular: true },
  { name: "Al Jurf", nameAr: "الجرف", emirate: "Ajman", lat: 25.4167, lng: 55.5333, popular: false },
  { name: "Al Hamidiya", nameAr: "الحميدية", emirate: "Ajman", lat: 25.3833, lng: 55.4500, popular: false },
  { name: "Emirates City Ajman", nameAr: "مدينة الإمارات عجمان", emirate: "Ajman", lat: 25.4333, lng: 55.5167, popular: true },
  { name: "Al Zahra Ajman", nameAr: "الزهراء عجمان", emirate: "Ajman", lat: 25.3917, lng: 55.4583, popular: false },
  { name: "Ajman Corniche", nameAr: "كورنيش عجمان", emirate: "Ajman", lat: 25.4061, lng: 55.4347, popular: true },
  { name: "Ajman Uptown", nameAr: "أجمان أبتاون", emirate: "Ajman", lat: 25.4097, lng: 55.4792, popular: true },

  // Ras Al Khaimah
  { name: "RAK City", nameAr: "مدينة رأس الخيمة", emirate: "Ras Al Khaimah", lat: 25.7895, lng: 55.9432, popular: true },
  { name: "Al Nakheel RAK", nameAr: "النخيل رأس الخيمة", emirate: "Ras Al Khaimah", lat: 25.8000, lng: 55.9500, popular: true },
  { name: "Al Hamra Village", nameAr: "قرية الحمراء", emirate: "Ras Al Khaimah", lat: 25.6833, lng: 55.7833, popular: true },
  { name: "Marjan Island", nameAr: "جزيرة المرجان", emirate: "Ras Al Khaimah", lat: 25.7333, lng: 55.7833, popular: true },
  { name: "Khuzam", nameAr: "خزام", emirate: "Ras Al Khaimah", lat: 25.7667, lng: 55.9333, popular: false },
  { name: "Al Dhait", nameAr: "الذيد", emirate: "Ras Al Khaimah", lat: 25.7500, lng: 55.9667, popular: false },
  { name: "Julphar", nameAr: "جلفار", emirate: "Ras Al Khaimah", lat: 25.8167, lng: 55.9667, popular: false },
  { name: "Mina Al Arab", nameAr: "ميناء العرب", emirate: "Ras Al Khaimah", lat: 25.6986, lng: 55.7897, popular: true },
  { name: "RAK Mall Area", nameAr: "منطقة مول رأس الخيمة", emirate: "Ras Al Khaimah", lat: 25.7942, lng: 55.9764, popular: true },

  // Fujairah
  { name: "Fujairah City", nameAr: "مدينة الفجيرة", emirate: "Fujairah", lat: 25.1288, lng: 56.3265, popular: true },
  { name: "Dibba Al Fujairah", nameAr: "دبا الفجيرة", emirate: "Fujairah", lat: 25.5933, lng: 56.2617, popular: true },
  { name: "Kalba", nameAr: "كلباء", emirate: "Fujairah", lat: 25.0667, lng: 56.3500, popular: true },
  { name: "Al Faseel", nameAr: "الفصيل", emirate: "Fujairah", lat: 25.1167, lng: 56.3333, popular: false },
  { name: "Merashid", nameAr: "مرشد", emirate: "Fujairah", lat: 25.1333, lng: 56.3167, popular: false },
  { name: "Fujairah Corniche", nameAr: "كورنيش الفجيرة", emirate: "Fujairah", lat: 25.1211, lng: 56.3456, popular: true },
  { name: "Al Gurfa", nameAr: "الغرفة", emirate: "Fujairah", lat: 25.1456, lng: 56.3289, popular: false },

  // Umm Al Quwain
  { name: "UAQ City", nameAr: "مدينة أم القيوين", emirate: "Umm Al Quwain", lat: 25.5647, lng: 55.5553, popular: true },
  { name: "Al Salamah UAQ", nameAr: "السلمة أم القيوين", emirate: "Umm Al Quwain", lat: 25.5500, lng: 55.5500, popular: false },
  { name: "Al Raas UAQ", nameAr: "الراس أم القيوين", emirate: "Umm Al Quwain", lat: 25.5833, lng: 55.5667, popular: false },
];

async function seedLocations() {
  console.log("🌍 Seeding UAE locations...");

  try {
    // Check if locations already exist
    const existing = await db.select().from(locations).limit(1);
    if (existing.length > 0) {
      console.log("⚠️ Locations already seeded. Skipping...");
      return;
    }

    // Insert all locations (convert lat/lng to strings for decimal type)
    await db.insert(locations).values(
      UAE_LOCATIONS.map(loc => ({
        ...loc,
        lat: loc.lat.toString(),
        lng: loc.lng.toString(),
      }))
    );

    console.log(`✅ Successfully seeded ${UAE_LOCATIONS.length} UAE locations!`);

    // Log summary by emirate
    const summary: Record<string, number> = {};
    UAE_LOCATIONS.forEach(loc => {
      summary[loc.emirate] = (summary[loc.emirate] || 0) + 1;
    });
    console.log("\n📊 Summary by Emirate:");
    Object.entries(summary).forEach(([emirate, count]) => {
      console.log(`   ${emirate}: ${count} areas`);
    });

  } catch (error) {
    console.error("❌ Error seeding locations:", error);
    throw error;
  }
}

// Run if executed directly
seedLocations()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await client.end();
    process.exit(1);
  });
