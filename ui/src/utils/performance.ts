// Utility functions for performance optimization: debounce, throttle, memoize, lazy loading, virtual lists, preloading, and more
// Used to improve UI responsiveness and resource management
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  // Returns a debounced version of the given function
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  // Returns a throttled version of the given function
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const memoize = <T extends (...args: unknown[]) => unknown>(
  func: T,
  resolver?: (...args: Parameters<T>) => string,
): T => {
  // Returns a memoized version of the given function
  const cache = new Map<string, unknown>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const lazyLoad = (importFunc: () => Promise<unknown>) => {
  // Lazily loads a module after a delay or on user interaction
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      importFunc().then(resolve);
    }, 100); // Small delay to avoid UI blocking

    const handleInteraction = () => {
      clearTimeout(timer);
      importFunc().then(resolve);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("scroll", handleInteraction);
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    document.addEventListener("scroll", handleInteraction, { once: true });
  });
};

export const createVirtualListConfig = (
  itemHeight: number,
  containerHeight: number,
  totalItems: number,
) => {
  // Returns configuration for a virtualized list (windowing)
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const bufferSize = Math.ceil(visibleItems * 0.5); // 50% buffer

  return {
    itemHeight,
    visibleItems,
    bufferSize,
    totalItems,
    getVisibleRange: (scrollTop: number) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + visibleItems + bufferSize,
        totalItems,
      );
      return {
        start: Math.max(0, startIndex - bufferSize),
        end: endIndex,
        offsetY: startIndex * itemHeight,
      };
    },
  };
};

export const preloadImage = (src: string): Promise<void> => {
  // Preloads an image and resolves when loaded
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadFont = (fontFamily: string, fontWeight = "normal") => {
  // Preloads a font using the Font Loading API
  if ("fonts" in document) {
    (
      document as unknown as { fonts: { load: (font: string) => void } }
    ).fonts.load(`${fontWeight} 16px ${fontFamily}`);
  }
};

export const measurePerformance = <T extends (...args: unknown[]) => unknown>(
  name: string,
  func: T,
): ((...args: Parameters<T>) => unknown) => {
  // Wraps a function for performance measurement (placeholder)
  return (...args: Parameters<T>) => {
    const result = func(...args);
    return result;
  };
};

export const cleanupMemory = () => {
  // Cleans up memory and caches if supported by the environment
  if ("gc" in window) {
    (window as unknown as { gc: () => void }).gc();
  }

  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.includes("image-cache")) {
          caches.delete(name);
        }
      });
    });
  }
};

export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {},
) => {
  // Creates an IntersectionObserver with default options
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  });
};
