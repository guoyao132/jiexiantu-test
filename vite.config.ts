import {fileURLToPath, URL} from 'node:url'
import { defineConfig } from 'vite'
import type {ConfigEnv} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv) => {
  return {
    base: './',
    server: {
      proxy: {
        '/jiexiantu': {
          target: 'http://172.18.8.180:9030',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/jiexiantu/, '')
        }
      }

    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        }
      }
    }

  }
})
