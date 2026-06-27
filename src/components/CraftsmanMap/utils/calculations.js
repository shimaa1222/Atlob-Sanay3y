import { MAP_CONFIG } from './constants';

/**
 * حساب المسافة بين نقطتين باستخدام معادلة هافرسين
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = MAP_CONFIG.EARTH_RADIUS_KM;
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

/**
 * ترتيب الحرفيين حسب المسافة
 */
export const sortByDistance = (craftsmen, userLocation) => {
  if (!userLocation || !craftsmen) return craftsmen;
  
  return [...craftsmen].sort((a, b) => {
    const distA = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      a.latitude,
      a.longitude
    );
    const distB = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      b.latitude,
      b.longitude
    );
    return (distA || Infinity) - (distB || Infinity);
  });
};

/**
 * تصفية الحرفيين ضمن نطاق محدد
 */
export const filterByRadius = (craftsmen, userLocation, radiusKm = 50) => {
  if (!userLocation || !craftsmen) return craftsmen;
  
  return craftsmen.filter(c => {
    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      c.latitude,
      c.longitude
    );
    return dist !== null && dist <= radiusKm;
  });
};