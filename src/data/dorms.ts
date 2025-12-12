export interface Dorm {
  id: string;
  name: string;
  university: string;
  address: string;
  priceKzt: number;
  genderPolicy: "male" | "female" | "mixed";
  roomTypes: string[];
  amenities: string[];
  distanceKm: number;
  verified: boolean;
  photos: string[];
  mapX: number;
  mapY: number;
  geo: {
    lat: number;
    lng: number;
  };
}

export const dorms: Dorm[] = [
  // КазНУ им. аль-Фараби
  {
    id: "kaznu-abai-3",
    name: "Общежитие №3 КазНУ им. аль-Фараби",
    university: "КазНУ им. аль-Фараби",
    address: "пр. аль-Фараби, 71, Алматы",
    priceKzt: 65000,
    genderPolicy: "female",
    roomTypes: ["2-местная", "4-местная"],
    amenities: ["Wi-Fi", "Прачечная", "Учебная комната", "Охрана 24/7", "Столовая", "Спортзал"],
    distanceKm: 1.2,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
    ],
    mapX: 612,
    mapY: 438,
    geo: { lat: 43.2220, lng: 76.8512 }
  },
  {
    id: "kaznu-abai-1",
    name: "Общежитие №1 КазНУ им. аль-Фараби",
    university: "КазНУ им. аль-Фараби",
    address: "пр. аль-Фараби, 69, Алматы",
    priceKzt: 58000,
    genderPolicy: "male",
    roomTypes: ["2-местная", "3-местная", "4-местная"],
    amenities: ["Wi-Fi", "Прачечная", "Столовая", "Охрана 24/7"],
    distanceKm: 1.0,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80"
    ],
    mapX: 600,
    mapY: 450,
    geo: { lat: 43.2235, lng: 76.8500 }
  },
  {
    id: "kaznu-abai-2",
    name: "Общежитие №2 КазНУ им. аль-Фараби",
    university: "КазНУ им. аль-Фараби",
    address: "пр. аль-Фараби, 73, Алматы",
    priceKzt: 62000,
    genderPolicy: "mixed",
    roomTypes: ["2-местная", "3-местная"],
    amenities: ["Wi-Fi", "Прачечная", "Учебная комната", "Охрана 24/7", "Кухня"],
    distanceKm: 1.3,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80"
    ],
    mapX: 625,
    mapY: 430,
    geo: { lat: 43.2205, lng: 76.8525 }
  },
  {
    id: "kaznu-south-2",
    name: "Южное общежитие КазНУ №2",
    university: "КазНУ им. аль-Фараби",
    address: "пр. аль-Фараби, 75, Алматы",
    priceKzt: 51000,
    genderPolicy: "female",
    roomTypes: ["4-местная"],
    amenities: ["Wi-Fi", "Столовая", "Прачечная"],
    distanceKm: 1.8,
    verified: false,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
    ],
    mapX: 650,
    mapY: 410,
    geo: { lat: 43.2185, lng: 76.8575 }
  },
  
  // Университет Сатбаева
  {
    id: "satbayev-main-1",
    name: "Главное общежитие КазНИТУ им. Сатпаева",
    university: "КазНИТУ им. Сатпаева",
    address: "ул. Сатпаева, 22, Алматы",
    priceKzt: 58000,
    genderPolicy: "male",
    roomTypes: ["2-местная", "3-местная"],
    amenities: ["Wi-Fi", "Кухня", "Спортзал", "Прачечная", "Охрана 24/7"],
    distanceKm: 2.4,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
    ],
    mapX: 540,
    mapY: 460,
    geo: { lat: 43.2373, lng: 76.9455 }
  },
  {
    id: "satbayev-east",
    name: "Восточное общежитие КазНИТУ",
    university: "КазНИТУ им. Сатпаева",
    address: "ул. Байтурсынова, 90, Алматы",
    priceKzt: 85000,
    genderPolicy: "mixed",
    roomTypes: ["Одиночная", "2-местная"],
    amenities: ["Wi-Fi", "Мини-кухня", "Учебная зона", "Видеонаблюдение", "Охрана 24/7"],
    distanceKm: 4.3,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80"
    ],
    mapX: 720,
    mapY: 350,
    geo: { lat: 43.2150, lng: 76.8890 }
  },
  {
    id: "satbayev-west",
    name: "Западное общежитие КазНИТУ",
    university: "КазНИТУ им. Сатпаева",
    address: "ул. Сатпаева, 28, Алматы",
    priceKzt: 55000,
    genderPolicy: "female",
    roomTypes: ["3-местная", "4-местная"],
    amenities: ["Wi-Fi", "Столовая", "Прачечная", "Охрана"],
    distanceKm: 2.6,
    verified: false,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    ],
    mapX: 530,
    mapY: 470,
    geo: { lat: 43.2390, lng: 76.9440 }
  },
  
  // AITU
  {
    id: "aitu-central",
    name: "Центральное общежитие AITU",
    university: "AITU",
    address: "ул. Толе би, 34, Алматы",
    priceKzt: 72000,
    genderPolicy: "mixed",
    roomTypes: ["2-местная", "Одиночная"],
    amenities: ["Wi-Fi", "Учебные комнаты", "Видеонаблюдение", "Охрана 24/7", "Прачечная"],
    distanceKm: 3.1,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"
    ],
    mapX: 380,
    mapY: 520,
    geo: { lat: 43.2510, lng: 76.9280 }
  },
  {
    id: "aitu-north",
    name: "Северное общежитие AITU",
    university: "AITU",
    address: "ул. Толе би, 30, Алматы",
    priceKzt: 68000,
    genderPolicy: "male",
    roomTypes: ["2-местная", "3-местная"],
    amenities: ["Wi-Fi", "Спортзал", "Кухня", "Охрана 24/7"],
    distanceKm: 3.0,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
    ],
    mapX: 370,
    mapY: 510,
    geo: { lat: 43.2520, lng: 76.9270 }
  },
  
  // КазНПУ им. Абая
  {
    id: "kaznpu-main",
    name: "Главное общежитие КазНПУ им. Абая",
    university: "КазНПУ им. Абая",
    address: "пр. Достык, 13, Алматы",
    priceKzt: 60000,
    genderPolicy: "mixed",
    roomTypes: ["2-местная", "3-местная", "4-местная"],
    amenities: ["Wi-Fi", "Столовая", "Прачечная", "Охрана 24/7", "Библиотека"],
    distanceKm: 2.8,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80"
    ],
    mapX: 450,
    mapY: 480,
    geo: { lat: 43.2450, lng: 76.9200 }
  },
  {
    id: "kaznpu-east",
    name: "Восточное общежитие КазНПУ",
    university: "КазНПУ им. Абая",
    address: "ул. Абая, 8, Алматы",
    priceKzt: 57000,
    genderPolicy: "female",
    roomTypes: ["2-местная", "4-местная"],
    amenities: ["Wi-Fi", "Прачечная", "Столовая", "Охрана"],
    distanceKm: 2.9,
    verified: false,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
    ],
    mapX: 460,
    mapY: 475,
    geo: { lat: 43.2430, lng: 76.9220 }
  },
  
  // КБТУ
  {
    id: "kbtu-main",
    name: "Общежитие КБТУ",
    university: "КБТУ",
    address: "ул. Толе би, 59, Алматы",
    priceKzt: 75000,
    genderPolicy: "mixed",
    roomTypes: ["2-местная", "Одиночная"],
    amenities: ["Wi-Fi", "Учебные комнаты", "Спортзал", "Видеонаблюдение", "Охрана 24/7"],
    distanceKm: 3.5,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
    ],
    mapX: 400,
    mapY: 540,
    geo: { lat: 43.2480, lng: 76.9350 }
  },
  
  // КазУМОиМЯ им. Абылай хана
  {
    id: "abylai-main",
    name: "Общежитие КазУМОиМЯ им. Абылай хана",
    university: "КазУМОиМЯ им. Абылай хана",
    address: "ул. Муратбаева, 200, Алматы",
    priceKzt: 64000,
    genderPolicy: "mixed",
    roomTypes: ["2-местная", "3-местная"],
    amenities: ["Wi-Fi", "Прачечная", "Столовая", "Охрана 24/7", "Библиотека"],
    distanceKm: 4.0,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80"
    ],
    mapX: 480,
    mapY: 500,
    geo: { lat: 43.2400, lng: 76.9100 }
  },
  
  // КазНАУ
  {
    id: "kaznau-main",
    name: "Общежитие КазНАУ",
    university: "КазНАУ",
    address: "ул. Абая, 8, Алматы",
    priceKzt: 59000,
    genderPolicy: "mixed",
    roomTypes: ["2-местная", "3-местная", "4-местная"],
    amenities: ["Wi-Fi", "Столовая", "Прачечная", "Охрана", "Спортзал"],
    distanceKm: 3.2,
    verified: false,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
    ],
    mapX: 470,
    mapY: 490,
    geo: { lat: 43.2420, lng: 76.9150 }
  },
  
  // Частные общежития
  {
    id: "student-house-1",
    name: "Студенческий дом 'Кампус'",
    university: "Частное",
    address: "пр. аль-Фараби, 77, Алматы",
    priceKzt: 90000,
    genderPolicy: "mixed",
    roomTypes: ["Одиночная", "2-местная"],
    amenities: ["Wi-Fi", "Мини-кухня", "Учебная зона", "Видеонаблюдение", "Охрана 24/7", "Прачечная", "Спортзал"],
    distanceKm: 2.0,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
    ],
    mapX: 660,
    mapY: 400,
    geo: { lat: 43.2160, lng: 76.8600 }
  },
  {
    id: "student-house-2",
    name: "Общежитие 'Студент'",
    university: "Частное",
    address: "ул. Сатпаева, 30, Алматы",
    priceKzt: 78000,
    genderPolicy: "mixed",
    roomTypes: ["2-местная", "3-местная"],
    amenities: ["Wi-Fi", "Кухня", "Прачечная", "Охрана 24/7", "Видеонаблюдение"],
    distanceKm: 2.5,
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80"
    ],
    mapX: 550,
    mapY: 455,
    geo: { lat: 43.2350, lng: 76.9470 }
  },
  {
    id: "student-house-3",
    name: "Студенческое общежитие 'Алматы'",
    university: "Частное",
    address: "ул. Толе би, 45, Алматы",
    priceKzt: 70000,
    genderPolicy: "female",
    roomTypes: ["2-местная", "4-местная"],
    amenities: ["Wi-Fi", "Столовая", "Прачечная", "Охрана 24/7"],
    distanceKm: 3.3,
    verified: false,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    ],
    mapX: 390,
    mapY: 530,
    geo: { lat: 43.2490, lng: 76.9300 }
  }
];
