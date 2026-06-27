// src/utils/location.js

/**
 * إحداثيات افتراضية للمدن المصرية
 */
const cityCoordinates = {
  'القاهرة': { lat: 30.0444, lng: 31.2357 },
  'الجيزة': { lat: 29.9870, lng: 31.2118 },
  'الإسكندرية': { lat: 31.2001, lng: 29.9187 },
  'شرم الشيخ': { lat: 27.9158, lng: 34.3299 },
  'الأقصر': { lat: 25.6872, lng: 32.6396 },
  'أسوان': { lat: 24.0889, lng: 32.8998 },
  'المنصورة': { lat: 31.0409, lng: 31.3785 },
  'طنطا': { lat: 30.7885, lng: 31.0000 },
  'الزقازيق': { lat: 30.5877, lng: 31.5020 },
  'بورسعيد': { lat: 31.2653, lng: 32.3019 },
  'السويس': { lat: 29.9737, lng: 32.5264 },
  'العريش': { lat: 31.1244, lng: 33.8039 },
  'مرسى مطروح': { lat: 31.3529, lng: 27.2370 },
  'الفيوم': { lat: 29.3084, lng: 30.8428 },
  'بني سويف': { lat: 29.0661, lng: 31.0994 },
  'المنيا': { lat: 28.1198, lng: 30.7398 },
  'أسيوط': { lat: 27.1783, lng: 31.1859 },
  'سوهاج': { lat: 26.5590, lng: 31.6955 },
  'قنا': { lat: 26.1553, lng: 32.7265 },
};

/**
 * الحصول على إحداثيات مدينة
 */
export const getCityCoordinates = (cityName) => {
  if (!cityName) return { lat: 30.0444, lng: 31.2357 };
  
  const normalized = cityName.trim();
  for (const [key, coords] of Object.entries(cityCoordinates)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  return { lat: 30.0444, lng: 31.2357 };
};

/**
 * حساب المسافة بين نقطتين (معادلة هافرسين)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

/**
 * تنسيق المسافة للعرض
 */
export const formatDistance = (dist, lang) => {
  if (!dist) return '';
  return dist < 1 
    ? `${Math.round(dist * 1000)} ${lang === 'ar' ? 'متر' : 'm'}`
    : `${dist.toFixed(1)} ${lang === 'ar' ? 'كم' : 'km'}`;
};

/**
 * تقدير وقت الوصول
 */
export const estimateTravelTime = (distance, speed = 30) => {
  if (!distance) return null;
  const timeInHours = distance / speed;
  const timeInMinutes = Math.round(timeInHours * 60);
  return timeInMinutes;
};