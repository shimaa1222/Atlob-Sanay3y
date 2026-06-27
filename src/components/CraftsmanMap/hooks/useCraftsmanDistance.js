import { useMemo } from 'react';
import { calculateDistance } from '../utils/calculations';

export const useCraftsmanDistance = (userLocation, craftsman) => {
  return useMemo(() => {
    if (!userLocation || !craftsman?.latitude || !craftsman?.longitude) {
      return null;
    }
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      craftsman.latitude,
      craftsman.longitude
    );
  }, [userLocation, craftsman]);
};

export const useCraftsmanDistances = (userLocation, craftsmen) => {
  return useMemo(() => {
    if (!userLocation || !craftsmen?.length) return [];
    
    return craftsmen.map(c => ({
      ...c,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        c.latitude,
        c.longitude
      )
    }));
  }, [userLocation, craftsmen]);
};