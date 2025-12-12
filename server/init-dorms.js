// Скрипт для инициализации данных об общежитиях
// Запускать один раз: node server/init-dorms.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Просто копируем данные из dorms.ts в JSON
// В реальности лучше использовать компилятор TypeScript
const dormsData = `[
  {
    "id": "kaznu-abai-3",
    "name": "Общежитие №3 КазНУ им. аль-Фараби",
    "university": "КазНУ им. аль-Фараби",
    "address": "пр. аль-Фараби, 71, Алматы",
    "priceKzt": 65000,
    "genderPolicy": "female",
    "roomTypes": ["2-местная", "4-местная"],
    "amenities": ["Wi-Fi", "Прачечная", "Учебная комната", "Охрана 24/7", "Столовая", "Спортзал"],
    "distanceKm": 1.2,
    "verified": true,
    "photos": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
    ],
    "mapX": 612,
    "mapY": 438,
    "geo": { "lat": 43.2220, "lng": 76.8512 }
  }
]`;

async function init() {
  const dataDir = path.join(__dirname, 'data');
  await fs.mkdir(dataDir, { recursive: true });
  
  const dormsFile = path.join(dataDir, 'dorms.json');
  const exists = await fs.access(dormsFile).then(() => true).catch(() => false);
  
  if (!exists) {
    // Для простоты, сервер будет читать данные напрямую из src/data/dorms.ts
    // через динамический импорт при первом запросе
    console.log('Dorms data will be loaded from src/data/dorms.ts on first request');
  }
}

init().catch(console.error);

