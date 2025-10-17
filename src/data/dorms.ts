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
    name: "KazNU Abai Dorm 3",
    university: "KazNU",
    address: "Al-Farabi Ave 71",
    priceKzt: 65000,
    genderPolicy: "female",
    roomTypes: ["2-bed", "4-bed"],
    amenities: ["Wi-Fi", "Laundry", "Study room", "24/7 security"],
    distanceKm: 1.2,
    verified: true,
    photos: ["placeholder:room1", "placeholder:room2"],
    mapX: 612,
    mapY: 438,
    geo: { lat: 43.2220, lng: 76.8512 }
  },
  {
    id: "satbayev-main-1",
    name: "Satbayev University Main Dorm",
    university: "Satbayev University",
    address: "Satbayev St 22",
    priceKzt: 58000,
    genderPolicy: "male",
    roomTypes: ["2-bed", "3-bed"],
    amenities: ["Wi-Fi", "Kitchen", "Gym"],
    distanceKm: 2.4,
    verified: true,
    photos: ["placeholder:room1"],
    mapX: 540,
    mapY: 460,
    geo: { lat: 43.2373, lng: 76.9455 }
  },
  {
    id: "aitu-central",
    name: "AITU Central Dorm",
    university: "AITU",
    address: "Tole bi 34",
    priceKzt: 72000,
    genderPolicy: "mixed",
    roomTypes: ["2-bed", "single"],
    amenities: ["Wi-Fi", "Study rooms", "Camera surveillance"],
    distanceKm: 3.1,
    verified: false,
    photos: ["placeholder:room1", "placeholder:room3"],
    mapX: 380,
    mapY: 520,
    geo: { lat: 43.2510, lng: 76.9280 }
  },
  {
    id: "kaznu-south-2",
    name: "KazNU South Dorm 2",
    university: "KazNU",
    address: "Al-Farabi Ave 75",
    priceKzt: 51000,
    genderPolicy: "female",
    roomTypes: ["4-bed"],
    amenities: ["Wi-Fi", "Canteen"],
    distanceKm: 1.8,
    verified: false,
    photos: ["placeholder:room2"],
    mapX: 650,
    mapY: 410,
    geo: { lat: 43.2185, lng: 76.8575 }
  },
  {
    id: "satbayev-east",
    name: "Satbayev East Dorm",
    university: "Satbayev University",
    address: "Baytursynuly 90",
    priceKzt: 85000,
    genderPolicy: "mixed",
    roomTypes: ["single"],
    amenities: ["Wi-Fi", "Kitchenette", "Study area"],
    distanceKm: 4.3,
    verified: true,
    photos: ["placeholder:room2", "placeholder:room3"],
    mapX: 720,
    mapY: 350,
    geo: { lat: 43.2150, lng: 76.8890 }
  }
];
