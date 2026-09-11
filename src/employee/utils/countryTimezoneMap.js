// utils/countryTimezoneMap.js
export const countryTimezoneMap = {
  // Asia
  'Saudi Arabia': 'Asia/Riyadh',
  'Kingdom of Saudi Arabia': 'Asia/Riyadh',
  'India': 'Asia/Kolkata',
  'UAE': 'Asia/Dubai',
  'China': 'Asia/Shanghai',
  'Japan': 'Asia/Tokyo',
  'Singapore': 'Asia/Singapore',
  'Malaysia': 'Asia/Kuala_Lumpur',
  'Thailand': 'Asia/Bangkok',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'South Korea': 'Asia/Seoul',
  'Taiwan': 'Asia/Taipei',
  'Hong Kong': 'Asia/Hong_Kong',
  'Philippines': 'Asia/Manila',
  'Indonesia': 'Asia/Jakarta',
  'Iraq': 'Asia/Baghdad',
  'Kuwait': 'Asia/Kuwait',
  'Qatar': 'Asia/Qatar',
  'Bahrain': 'Asia/Bahrain',
  'Oman': 'Asia/Muscat',
  'Jordan': 'Asia/Amman',
  'Lebanon': 'Asia/Beirut',
  'Syria': 'Asia/Damascus',
  'Israel': 'Asia/Jerusalem',
  'Palestine': 'Asia/Gaza',
  'Iran': 'Asia/Tehran',
  'Azerbaijan': 'Asia/Baku',
  'Georgia': 'Asia/Tbilisi',
  'Armenia': 'Asia/Yerevan',
  'Uzbekistan': 'Asia/Tashkent',
  'Kazakhstan': 'Asia/Almaty',
  'Kyrgyzstan': 'Asia/Bishkek',
  'Tajikistan': 'Asia/Dushanbe',
  'Turkmenistan': 'Asia/Ashgabat',
  'Pakistan': 'Asia/Karachi',
  'Bangladesh': 'Asia/Dhaka',
  'Nepal': 'Asia/Kathmandu',
  'Sri Lanka': 'Asia/Colombo',
  'Afghanistan': 'Asia/Kabul',
  'Maldives': 'Asia/Maldives',
  'Myanmar': 'Asia/Yangon',
  'Cambodia': 'Asia/Phnom_Penh',
  'Laos': 'Asia/Vientiane',
  
  // Middle East (additional)
  'Turkey': 'Europe/Istanbul',
  'Egypt': 'Africa/Cairo',
  
  // Africa
  'South Africa': 'Africa/Johannesburg',
  'Nigeria': 'Africa/Lagos',
  'Kenya': 'Africa/Nairobi',
  'Morocco': 'Africa/Casablanca',
  'Tunisia': 'Africa/Tunis',
  'Algeria': 'Africa/Algiers',
  'Ghana': 'Africa/Accra',
  
  // Europe
  'United Kingdom': 'Europe/London',
  'France': 'Europe/Paris',
  'Germany': 'Europe/Berlin',
  'Italy': 'Europe/Rome',
  'Spain': 'Europe/Madrid',
  'Portugal': 'Europe/Lisbon',
  'Netherlands': 'Europe/Amsterdam',
  'Belgium': 'Europe/Brussels',
  'Switzerland': 'Europe/Zurich',
  'Austria': 'Europe/Vienna',
  'Sweden': 'Europe/Stockholm',
  'Norway': 'Europe/Oslo',
  'Denmark': 'Europe/Copenhagen',
  'Finland': 'Europe/Helsinki',
  'Poland': 'Europe/Warsaw',
  'Czech Republic': 'Europe/Prague',
  'Hungary': 'Europe/Budapest',
  'Greece': 'Europe/Athens',
  'Russia': 'Europe/Moscow',
  'Ukraine': 'Europe/Kiev',
  'Romania': 'Europe/Bucharest',
  'Bulgaria': 'Europe/Sofia',
  'Serbia': 'Europe/Belgrade',
  'Croatia': 'Europe/Zagreb',
  
  // North America
  'United States': 'America/New_York',
  'Canada': 'America/Toronto',
  'Mexico': 'America/Mexico_City',
  'Panama': 'America/Panama',
  
  // South America
  'Brazil': 'America/Sao_Paulo',
  'Argentina': 'America/Buenos_Aires',
  'Chile': 'America/Santiago',
  'Colombia': 'America/Bogota',
  'Peru': 'America/Lima',
  'Venezuela': 'America/Caracas',
  
  // Australia & Oceania
  'Australia': 'Australia/Sydney',
  'New Zealand': 'Pacific/Auckland',
  'Fiji': 'Pacific/Fiji',
};

export const getTimezoneFromCountry = (country) => {
  if (!country) return null;
  
  // Trim and clean the country name
  const trimmedCountry = country.trim();
  
  // Direct match
  if (countryTimezoneMap[trimmedCountry]) {
    return countryTimezoneMap[trimmedCountry];
  }
  
  // Try case-insensitive match
  const countryLower = trimmedCountry.toLowerCase();
  for (const [key, value] of Object.entries(countryTimezoneMap)) {
    if (key.toLowerCase() === countryLower) {
      return value;
    }
  }
  
  // Try partial match (e.g., "United States of America" -> "United States")
  for (const [key, value] of Object.entries(countryTimezoneMap)) {
    if (countryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(countryLower)) {
      return value;
    }
  }
  
  console.log(`⚠️ No timezone found for country: "${country}"`);
  return null;
};