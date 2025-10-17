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
  {
    id: "kaznu-abai-3",
    name: "Общежитие КазНУ Абай 3",
    university: "КазНУ",
    address: "пр. Аль-Фараби 71",
    priceKzt: 65000,
    genderPolicy: "female",
    roomTypes: ["2-местная", "4-местная"],
    amenities: ["Wi-Fi", "Прачечная", "Учебная комната", "Охрана 24/7"],
    distanceKm: 1.2,
    verified: true,
    photos: ["placeholder:комната1", "placeholder:комната2"],
    mapX: 612,
    mapY: 438,
    geo: { lat: 43.2220, lng: 76.8512 }
  },
  {
    id: "satbayev-main-1",
    name: "Главное общежитие Университета Сатбаева",
    university: "Университет Сатбаева",
    address: "ул. Сатпаева 22",
    priceKzt: 58000,
    genderPolicy: "male",
    roomTypes: ["2-местная", "3-местная"],
    amenities: ["Wi-Fi", "Кухня", "Спортзал"],
    distanceKm: 2.4,
    verified: true,
    photos: ["placeholder:комната1"],
    mapX: 540,
    mapY: 460,
    geo: { lat: 43.2373, lng: 76.9455 }
  },
  {
    id: "aitu-central",
    name: "Центральное общежитие AITU",
    university: "AITU",
    address: "ул. Толе би 34",
    priceKzt: 72000,
    genderPolicy: "mixed",
    roomTypes: ["2-местная", "Одиночная"],
    amenities: ["Wi-Fi", "Учебные комнаты", "Видеонаблюдение"],
    distanceKm: 3.1,
    verified: false,
    photos: ["placeholder:комната1", "placeholder:комната3"],
    mapX: 380,
    mapY: 520,
    geo: { lat: 43.2510, lng: 76.9280 }
  },
  {
    id: "kaznu-south-2",
    name: "Южное общежитие КазНУ 2",
    university: "КазНУ",
    address: "пр. Аль-Фараби 75",
    priceKzt: 51000,
    genderPolicy: "female",
    roomTypes: ["4-местная"],
    amenities: ["Wi-Fi", "Столовая"],
    distanceKm: 1.8,
    verified: false,
    photos: ["placeholder:комната2"],
    mapX: 650,
    mapY: 410,
    geo: { lat: 43.2185, lng: 76.8575 }
  },
  {
    id: "satbayev-east",
    name: "Восточное общежитие Сатбаева",
    university: "Университет Сатбаева",
    address: "ул. Байтурсынова 90",
    priceKzt: 85000,
    genderPolicy: "mixed",
    roomTypes: ["Одиночная"],
    amenities: ["Wi-Fi", "Мини-кухня", "Учебная зона"],
    distanceKm: 4.3,
    verified: true,
    photos: ["placeholder:комната2", "placeholder:комната3"],
    mapX: 720,
    mapY: 350,
    geo: { lat: 43.2150, lng: 76.8890 }
  }
];
