import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.API_BASE || 'http://localhost:8080/v1'),
    'import.meta.env.VITE_POLL_INTERVAL_MS': JSON.stringify(process.env.POLL_INTERVAL_MS || '3000'),
    'import.meta.env.VITE_GRACE_WINDOW_SEC': JSON.stringify(process.env.GRACE_WINDOW_SEC || '45'),
    'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'),
  }
});