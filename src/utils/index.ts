import { Dimensions } from "react-native";
import { ChatPosition } from "../types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * Calcola la posizione del pulsante trigger in base alla posizione specificata
 */
export const getTriggerButtonPosition = (chatPosition: ChatPosition) => {
  const baseStyle = {
    position: "absolute" as const,
    zIndex: 1000,
  };

  switch (chatPosition) {
    case "top-left":
      return { ...baseStyle, top: 50, left: 20 };
    case "top-center":
      return { ...baseStyle, top: 50, left: screenWidth / 2 - 30 };
    case "top-right":
      return { ...baseStyle, top: 50, right: 20 };
    case "center-left":
      return { ...baseStyle, top: screenHeight / 2 - 30, left: 20 };
    case "center-right":
      return { ...baseStyle, top: screenHeight / 2 - 30, right: 20 };
    case "bottom-left":
      return { ...baseStyle, bottom: 50, left: 20 };
    case "bottom-center":
      return { ...baseStyle, bottom: 50, left: screenWidth / 2 - 30 };
    case "bottom-right":
    default:
      return { ...baseStyle, bottom: 50, right: 20 };
  }
};

/**
 * Funzioni di debug condizionale
 */
export const createDebugLogger = (debugEnabled: boolean) => {
  const debugLog = (...args: any[]) => {
    if (debugEnabled) {
      console.log(...args);
    }
  };

  const debugError = (...args: any[]) => {
    if (debugEnabled) {
      console.error(...args);
    }
  };

  return { debugLog, debugError };
};
