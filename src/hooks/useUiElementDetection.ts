import { useState, useCallback } from "react";
import { detectUiElements, detectUiElementAt } from "@/services/capture";
import type { UiElement, UiElementType } from "@/types";

export interface UseUiElementDetectionReturn {
  elements: UiElement[];
  selectedElement: UiElement | null;
  isLoading: boolean;
  detectElements: (screenshot: { data: number[]; width: number; height: number }) => Promise<UiElement[]>;
  selectElementAt: (screenshot: { data: number[]; width: number; height: number }, x: number, y: number) => Promise<UiElement | null>;
  clearElements: () => void;
  filterByType: (type: UiElementType) => UiElement[];
  getElementsByType: () => Record<UiElementType, UiElement[]>;
}

export function useUiElementDetection(): UseUiElementDetectionReturn {
  const [elements, setElements] = useState<UiElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<UiElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const detectElements = useCallback(
    async (screenshot: { data: number[]; width: number; height: number }): Promise<UiElement[]> => {
      setIsLoading(true);
      try {
        const detected = await detectUiElements(screenshot);
        setElements(detected);
        return detected;
      } catch (error) {
        console.error("Failed to detect UI elements:", error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const selectElementAt = useCallback(
    async (
      screenshot: { data: number[]; width: number; height: number },
      x: number,
      y: number
    ): Promise<UiElement | null> => {
      try {
        const element = await detectUiElementAt(screenshot, x, y);
        setSelectedElement(element);
        return element;
      } catch (error) {
        console.error("Failed to detect element at position:", error);
        return null;
      }
    },
    []
  );

  const clearElements = useCallback(() => {
    setElements([]);
    setSelectedElement(null);
  }, []);

  const filterByType = useCallback(
    (type: UiElementType): UiElement[] => {
      return elements.filter((el) => el.element_type === type);
    },
    [elements]
  );

  const getElementsByType = useCallback((): Record<UiElementType, UiElement[]> => {
    const result: Partial<Record<UiElementType, UiElement[]>> = {};

    for (const element of elements) {
      const type = element.element_type;
      if (!result[type]) {
        result[type] = [];
      }
      result[type]!.push(element);
    }

    return result as Record<UiElementType, UiElement[]>;
  }, [elements]);

  return {
    elements,
    selectedElement,
    isLoading,
    detectElements,
    selectElementAt,
    clearElements,
    filterByType,
    getElementsByType,
  };
}
