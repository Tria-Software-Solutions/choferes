import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const SERVER_AWAKE_KEY = "serverAwake";

let isServerAwake = localStorage.getItem(SERVER_AWAKE_KEY) === "true";
let wakeUpPromise: Promise<boolean> | null = null;

/**
 * Checks if the server is awake by making a lightweight health check request.
 * This is useful for free hosting services like Render that spin down after inactivity.
 * The first request after the server is asleep can take 30-60 seconds to respond.
 */
export const wakeUpServer = async (): Promise<boolean> => {
  // If already marked as awake from localStorage, do a quick verification
  if (isServerAwake) {
    try {
      const response = await axios.get(`${API_URL}/health`, {
        timeout: 5000,
        validateStatus: () => true,
      });

      const isReady =
        response.status === 200 &&
        response.data?.status === "OK" &&
        response.data?.database?.status === "OK";

      if (isReady) {
        return true;
      }

      // If quick check fails, mark as not awake and continue to wake-up process
      isServerAwake = false;
      localStorage.setItem(SERVER_AWAKE_KEY, "false");
    } catch (error) {
      // Quick check failed, mark as not awake and continue
      isServerAwake = false;
      localStorage.setItem(SERVER_AWAKE_KEY, "false");
    }
  }

  // If there's already a wake-up in progress, wait for it
  if (wakeUpPromise) {
    return wakeUpPromise;
  }

  // Create a new wake-up promise
  wakeUpPromise = (async (): Promise<boolean> => {
    const startedAt = Date.now();
    const maxWaitMs = 70000;

    try {
      while (Date.now() - startedAt < maxWaitMs) {
        const response = await axios.get(`${API_URL}/health`, {
          timeout: 15000,
          validateStatus: () => true,
        });

        const isReady =
          response.status === 200 &&
          response.data?.status === "OK" &&
          response.data?.database?.status === "OK";

        if (isReady) {
          isServerAwake = true;
          localStorage.setItem(SERVER_AWAKE_KEY, "true");
          return true;
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[WakeUp] Error waking server:", error);
      // Reset so next call tries again
      isServerAwake = false;
      localStorage.setItem(SERVER_AWAKE_KEY, "false");
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
  localStorage.setItem(SERVER_AWAKE_KEY, "false");
  wakeUpPromise = null;
};
