import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // O frontend não carrega o .env server-side nem expõe suas credenciais.
    envDir: false as const,
    build: {
      // Mantém o bundle Node fora da raiz pública servida pelo Express.
      outDir: 'dist/client',
      sourcemap: false,
      minify: 'esbuild' as const,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR pode ser desabilitado por DISABLE_HMR em ambientes de edição remota.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
