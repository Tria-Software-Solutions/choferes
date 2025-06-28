// Configuraciones de optimización para build de producción

// Configuración de webpack para optimización
export const webpackOptimization = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 5,
        reuseExistingChunk: true,
      },
      // Separar Material-UI en su propio chunk
      mui: {
        test: /[\\/]node_modules[\\/]@mui[\\/]/,
        name: 'mui',
        chunks: 'all',
        priority: 20,
      },
      // Separar React en su propio chunk
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        chunks: 'all',
        priority: 30,
      },
    },
  },
  runtimeChunk: 'single',
  minimize: true,
  minimizer: [
    // Configuraciones específicas para Terser
    {
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
          pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log'] : [],
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

// Configuración de bundle analyzer
export const bundleAnalyzerConfig = {
  analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
  analyzerHost: 'localhost',
  analyzerPort: 8888,
  reportFilename: 'report.html',
  defaultSizes: 'parsed',
  openAnalyzer: true,
  generateStatsFile: false,
  statsFilename: 'stats.json',
  statsOptions: null,
  logLevel: 'info',
};

// Configuración de service worker para cache
export const serviceWorkerConfig = {
  cacheName: 'choferes-cache-v1',
  urlsToCache: [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
  ],
  cacheStrategies: {
    // Cache first para recursos estáticos
    static: {
      match: /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
      strategy: 'cache-first',
      cacheName: 'static-resources',
    },
    // Network first para API calls
    api: {
      match: /\/api\//,
      strategy: 'network-first',
      cacheName: 'api-cache',
    },
    // Stale while revalidate para HTML
    html: {
      match: /\.html$/,
      strategy: 'stale-while-revalidate',
      cacheName: 'html-cache',
    },
  },
};

// Configuración de compresión
export const compressionConfig = {
  algorithm: 'gzip',
  test: /\.(js|css|html|svg|json)$/,
  threshold: 1024,
  minRatio: 0.8,
};

// Configuración de optimización de imágenes
export const imageOptimizationConfig = {
  mozjpeg: {
    progressive: true,
    quality: 65,
  },
  optipng: {
    optimizationLevel: 7,
  },
  pngquant: {
    quality: [0.65, 0.90],
    speed: 4,
  },
  gifsicle: {
    interlaced: false,
  },
  webp: {
    quality: 75,
  },
};

// Configuración de preload de recursos críticos
export const criticalResources = [
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
];

// Configuración de lazy loading de rutas
export const lazyRouteConfig = {
  // Rutas que deben cargarse de forma lazy
  lazyRoutes: [
    '/dashboard',
    '/employees',
    '/vehicles',
    '/schedules',
    '/roles',
  ],
  // Rutas críticas que deben cargarse inmediatamente
  criticalRoutes: [
    '/',
    '/login',
    '/register',
  ],
};

// Configuración de optimización de fuentes
export const fontOptimizationConfig = {
  preloadFonts: [
    'Roboto',
    'Material Icons',
  ],
  fontDisplay: 'swap',
  fontPreload: true,
};

// Configuración de PWA
export const pwaConfig = {
  name: 'Choferes de Alquiler CR',
  short_name: 'Choferes',
  description: 'Sistema de gestión de choferes de alquiler',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#1976d2',
  icons: [
    {
      src: '/logo192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/logo512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
};

// Configuración de monitoreo de performance
export const performanceMonitoringConfig = {
  // Métricas a monitorear
  metrics: [
    'First Contentful Paint (FCP)',
    'Largest Contentful Paint (LCP)',
    'First Input Delay (FID)',
    'Cumulative Layout Shift (CLS)',
    'Time to Interactive (TTI)',
  ],
  // Umbrales de performance
  thresholds: {
    fcp: 2000, // 2 segundos
    lcp: 2500, // 2.5 segundos
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    tti: 3800, // 3.8 segundos
  },
  // Configuración de reporting
  reporting: {
    endpoint: process.env.REACT_APP_PERFORMANCE_ENDPOINT,
    sampleRate: 0.1, // 10% de las sesiones
  },
}; 