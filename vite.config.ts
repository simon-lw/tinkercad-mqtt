import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import { manifest } from './manifest'

let outDir = (process.env.TARGET === 'firefox') ? './dist/firefox' : 
(process.env.TARGET === 'chrome') ? './dist/chrome' : './dist';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir
  },
  plugins: [react(),
  crx({ manifest })],
})
