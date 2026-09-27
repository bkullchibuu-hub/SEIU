import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      // server_data/** là nơi máy chủ ghi khách đăng ký và kết quả thi — KHÔNG được
      // theo dõi, nếu không mỗi lần có người gửi form trang sẽ tự tải lại và mất form.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : { ignored: ['**/server_data/**', '**/dist/**'] },
    },
  };
});
