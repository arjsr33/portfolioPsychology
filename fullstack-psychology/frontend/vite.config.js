// fullstack-psychology/frontend/vite.config.js - Fixed for AWS Amplify Build
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true, // Open browser on start
    cors: true,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 10000
      }
    },
    // Custom middleware to handle routing
    middlewareMode: false,
    hmr: {
      overlay: true // Show errors in browser overlay
    }
  },
  
  // Build configuration - FIXED FOR AMPLIFY
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disabled for faster builds
    minify: 'esbuild', // CHANGED: Use esbuild instead of terser
    target: 'es2020',
    rollupOptions: {
      // Single entry point - your main landing page
      input: path.resolve(__dirname, 'index.html'),
      output: {
        // SIMPLIFIED: Remove manual chunks that cause empty chunk warnings
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        // Ensure proper asset organization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Optimize bundle size
    chunkSizeWarningLimit: 1000
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@public': path.resolve(__dirname, './public')
    }
  },
  
  // Public directory configuration
  publicDir: 'public',
  
  // CSS configuration - SIMPLIFIED
  css: {
    devSourcemap: false, // Disabled for production builds
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  
  // Optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'lucide-react'
    ],
    exclude: [
      // Exclude any problematic dependencies
    ],
    esbuildOptions: {
      // Handle JSX in .js files if needed
      loader: {
        '.js': 'jsx'
      }
    }
  },
  
  // Preview server (for production build testing)
  preview: {
    port: 4173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // ESBuild configuration - ENHANCED
  esbuild: {
    // Drop console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  
  // Advanced configuration
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf'],
  
  // Worker configuration
  worker: {
    format: 'es'
  },
  
  // Base URL configuration
  base: '/',
  
  // Environment-specific configurations
  ...(process.env.NODE_ENV === 'development' && {
    // Development-only settings
    clearScreen: false,
    logLevel: 'info'
  }),
  
  ...(process.env.NODE_ENV === 'production' && {
    // Production-only settings
    logLevel: 'warn'
  })
});