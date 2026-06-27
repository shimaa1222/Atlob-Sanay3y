import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { sortByDistance, filterByRadius } from '../utils/calculations';
import { MAP_CONFIG } from '../utils/constants';

export const useNearbyCraftsmen = (craftsmen, userLocation) => {
  const [filteredCraftsmen, setFilteredCraftsmen] = useState(craftsmen);
  const [sortBy, setSortBy] = useLocalStorage('nearbySort', 'distance');
  const [radius, setRadius] = useLocalStorage('searchRadius', 50);
  const [isLoading, setIsLoading] = useState(false);

  // تصفية وترتيب الحرفيين
  useEffect(() => {
    setIsLoading(true);
    
    const timeout = setTimeout(() => {
      let result = craftsmen || [];
      
      // تصفية حسب النطاق
      if (userLocation) {
        result = filterByRadius(result, userLocation, radius);
      }
      
      // ترتيب حسب الخيار المختار
      if (sortBy === 'distance' && userLocation) {
        result = sortByDistance(result, userLocation);
      } else if (sortBy === 'rating') {
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'experience') {
        result = [...result].sort((a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0));
      }
      
      setFilteredCraftsmen(result);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [craftsmen, userLocation, sortBy, radius]);

  // تحديث الإعدادات
  const updateSort = useCallback((newSort) => {
    setSortBy(newSort);
  }, [setSortBy]);

  const updateRadius = useCallback((newRadius) => {
    setRadius(newRadius);
  }, [setRadius]);

  return {
    nearbyCraftsmen: filteredCraftsmen,
    isLoading,
    sortBy,
    radius,
    updateSort,
    updateRadius,
  };
};