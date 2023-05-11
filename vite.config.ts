import {fileURLToPath, URL} from 'node:url'
import { defineConfig } from 'vite'
import type {ConfigEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import {ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv) => {
  return {
    base: './',
    server: {
      proxy: {
        '^/web/.*': {
          target: 'http://172.18.8.243:8031/gdapi/',
          changeOrigin: true,
        },
        '^/graph/.*': {
          target: 'http://172.18.8.243:8031/gdapi/',
          changeOrigin: true,
        },
      }

    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      })

    ],
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
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          show: resolve(__dirname, 'showSvg/index.html'),
        },
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          charset: false,
        }
      }
    }
  }
})
