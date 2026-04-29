import { useState, useCallback, useEffect } from "react";
import {
  saveRegionMemory,
  getAllRegionMemory,
  getRegionMemoryAt,
  clearRegionMemory,
  removeRegionMemoryAt,
} from "@/services/capture";
import type { RegionMemory } from "@/types";

export function useRegionMemory(_maxRegions: number = 10) {
  const [regions, setRegions] = useState<RegionMemory[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentRegion, setCurrentRegion] = useState<RegionMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadRegions = useCallback(async () => {
    setIsLoading(true);
    try {
      const allRegions = await getAllRegionMemory();
      setRegions(allRegions);
      if (allRegions.length > 0 && currentIndex >= 0 && currentIndex < allRegions.length) {
        setCurrentRegion(allRegions[currentIndex]);
      } else if (allRegions.length > 0) {
        setCurrentRegion(allRegions[0]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Failed to load region memory:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentIndex]);

  const saveRegion = useCallback(
    async (x: number, y: number, width: number, height: number) => {
      try {
        await saveRegionMemory(x, y, width, height);
        await loadRegions();
        setCurrentIndex(0);
        setCurrentRegion({ x, y, width, height, valid: true });
      } catch (error) {
        console.error("Failed to save region:", error);
      }
    },
    [loadRegions]
  );

  const goToNextRegion = useCallback(async () => {
    if (currentIndex < regions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const region = await getRegionMemoryAt(nextIndex);
      if (region) {
        setCurrentRegion(region);
      }
    }
  }, [currentIndex, regions.length]);

  const goToPreviousRegion = useCallback(async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const region = await getRegionMemoryAt(prevIndex);
      if (region) {
        setCurrentRegion(region);
      }
    }
  }, [currentIndex]);

  const clearAll = useCallback(async () => {
    try {
      await clearRegionMemory();
      setRegions([]);
      setCurrentIndex(-1);
      setCurrentRegion(null);
    } catch (error) {
      console.error("Failed to clear region memory:", error);
    }
  }, []);

  const removeAt = useCallback(
    async (index: number) => {
      try {
        await removeRegionMemoryAt(index);
        await loadRegions();
        if (currentIndex >= regions.length) {
          setCurrentIndex(Math.max(0, regions.length - 1));
        }
      } catch (error) {
        console.error("Failed to remove region:", error);
      }
    },
    [loadRegions, currentIndex, regions.length]
  );

  useEffect(() => {
    loadRegions();
  }, []);

  return {
    regions,
    currentRegion,
    currentIndex,
    isLoading,
    saveRegion,
    goToNextRegion,
    goToPreviousRegion,
    clearAll,
    removeAt,
    reload: loadRegions,
  };
}
