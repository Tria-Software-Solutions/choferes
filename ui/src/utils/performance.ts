export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string,
): T => {
  const cache = new Map<string, ReturnType<T>>();

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

export const lazyLoad = (importFunc: () => Promise<any>) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      importFunc().then(resolve);
    }, 100); // Pequeño delay para evitar bloqueo del UI

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
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const bufferSize = Math.ceil(visibleItems * 0.5); // 50% de buffer

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
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadFont = (fontFamily: string, fontWeight = "normal") => {
  if ("fonts" in document) {
    (document as any).fonts.load(`${fontWeight} 16px ${fontFamily}`);
  }
};

export const measurePerformance = <T extends (...args: any[]) => any>(
  name: string,
  func: T,
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();

    if (process.env.NODE_ENV === "development") {
      console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    }

    return result;
  };
};

export const cleanupMemory = () => {
  if ("gc" in window) {
    (window as any).gc();
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
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  });
};
