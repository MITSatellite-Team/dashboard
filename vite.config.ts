import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    preview: {
        allowedHosts: true,
        // https: {
        //     key: '/etc/letsencrypt/live/leonird.liamh.space/privkey.pem',
        //     cert: '/etc/letsencrypt/live/leonird.liamh.space/fullchain.pem',
        // },
    },
    server: {
        host: true
    }
})
