import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

let isServerAwake = false;
let wakeUpPromise: Promise<boolean> | null = null;

/**
 * Checks if the server is awake by making a lightweight health check request.
 * This is useful for free hosting services like Render that spin down after inactivity.
 * The first request after the server is asleep can take 30-60 seconds to respond.
 */
export const wakeUpServer = async (): Promise<boolean> => {
  // If already awake, return immediately
  if (isServerAwake) {
    return true;
  }

  // If there's already a wake-up in progress, wait for it
  if (wakeUpPromise) {
    return wakeUpPromise;
  }

  // Create a new wake-up promise
  wakeUpPromise = (async (): Promise<boolean> => {
    try {
      // Simple health check - no auth needed, lightweight
      // Use /health directly (no /api prefix) for better compatibility
      const response = await axios.get(`${API_URL}/health`, {
        timeout: 60000, // 60 seconds to allow for cold start
        // Accept any response, even error codes - we just want to know server is up
        validateStatus: () => true,
      });

      // If we get any response (even 404, 500), server is awake
      if (response.status >= 200 && response.status < 600) {
        console.log("[WakeUp] Server is responding, status:", response.status);
        isServerAwake = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error("[WakeUp] Error waking server:", error);
      // Reset so next call tries again
      isServerAwake = false;
      wakeUpPromise = null;
      return false;
    }
  })();

  const result = await wakeUpPromise;
  wakeUpPromise = null;
  return result;
};

/**
 * Get the configured API URL for debugging
 */
export const getApiUrl = (): string => API_URL;

/**
 * Reset the server awake status. Call this when you suspect the server might have gone to sleep.
 */
export const resetServerStatus = (): void => {
  isServerAwake = false;
  wakeUpPromise = null;
};
