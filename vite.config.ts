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
        '/rtSingleArrowDiagram': 'http://172.18.8.180:9030',
        '/scheduleGraph': 'http://172.18.8.180:9030'
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
