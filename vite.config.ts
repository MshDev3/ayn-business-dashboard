import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Recharts is the only chunk above 300 kB; it is loaded lazily, only by pages that draw charts.
    chunkSizeWarningLimit: 450,
  },
});
