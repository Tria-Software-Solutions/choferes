// Webpack optimization configuration for code splitting and chunking
export const webpackOptimization = {
  splitChunks: {
    chunks: "all",
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: "vendors",
        chunks: "all",
        priority: 10,
      },
      common: {
        name: "common",
        minChunks: 2,
        chunks: "all",
        priority: 5,
        reuseExistingChunk: true,
      },
      mui: {
        test: /[\\/]node_modules[\\/]@mui[\\/]/,
        name: "mui",
        chunks: "all",
        priority: 20,
      },
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: "react",
        chunks: "all",
        priority: 30,
      },
    },
  },
  runtimeChunk: "single",
  minimize: true,
  minimizer: [
    {
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: process.env.NODE_ENV === "production",
          pure_funcs:
            process.env.NODE_ENV === "production" ? ["console.log"] : [],
        },
        mangle: {
          safari10: true,
        },
        output: {
          comments: false,
        },
      },
    },
  ],
};

// Bundle analyzer configuration for visualizing bundle size
export const bundleAnalyzerConfig = {
  analyzerMode: process.env.ANALYZE === "true" ? "server" : "disabled",
  analyzerHost: "localhost",
  analyzerPort: 8888,
  reportFilename: "report.html",
  defaultSizes: "parsed",
  openAnalyzer: true,
  generateStatsFile: false,
  statsFilename: "stats.json",
  statsOptions: null,
  logLevel: "info",
};

// Service worker configuration for caching strategies
export const serviceWorkerConfig = {
  cacheName: "choferes-cache-v1",
  urlsToCache: [
    "/",
    "/static/js/bundle.js",
    "/static/css/main.css",
    "/manifest.json",
  ],
  cacheStrategies: {
    static: {
      match: /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
      strategy: "cache-first",
      cacheName: "static-resources",
    },
    api: {
      match: /\/api\//,
      strategy: "network-first",
      cacheName: "api-cache",
    },
    html: {
      match: /\.html$/,
      strategy: "stale-while-revalidate",
      cacheName: "html-cache",
    },
  },
};

// Compression configuration for static assets
export const compressionConfig = {
  algorithm: "gzip",
  test: /\.(js|css|html|svg|json)$/,
  threshold: 1024,
  minRatio: 0.8,
};

// Image optimization configuration for various formats
export const imageOptimizationConfig = {
  mozjpeg: {
    progressive: true,
    quality: 65,
  },
  optipng: {
    optimizationLevel: 7,
  },
  pngquant: {
    quality: [0.65, 0.9],
    speed: 4,
  },
  gifsicle: {
    interlaced: false,
  },
  webp: {
    quality: 75,
  },
};

// List of critical resources to preload or cache
export const criticalResources = [
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
];

// Configuration for lazy loading and critical routes
export const lazyRouteConfig = {
  lazyRoutes: ["/dashboard", "/employees", "/vehicles", "/schedules", "/roles"],
  criticalRoutes: ["/", "/login", "/register"],
};

// Font optimization configuration for preloading and display
export const fontOptimizationConfig = {
  preloadFonts: ["Roboto", "Material Icons"],
  fontDisplay: "swap",
  fontPreload: true,
};

// PWA (Progressive Web App) manifest configuration
export const pwaConfig = {
  name: "Choferes de Alquiler CR",
  short_name: "Choferes",
  description: "Sistema de gestión de choferes de alquiler",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#1976d2",
  icons: [
    {
      src: "/logo192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/logo512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
};

// Performance monitoring configuration for web vitals
export const performanceMonitoringConfig = {
  metrics: [
    "First Contentful Paint (FCP)",
    "Largest Contentful Paint (LCP)",
    "First Input Delay (FID)",
    "Cumulative Layout Shift (CLS)",
    "Time to Interactive (TTI)",
  ],
  thresholds: {
    fcp: 2000, // 2 seconds
    lcp: 2500, // 2.5 seconds
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    tti: 3800, // 3.8 seconds
  },
  reporting: {
    endpoint: process.env.REACT_APP_PERFORMANCE_ENDPOINT,
    sampleRate: 0.1, // 10% of sessions
  },
};
