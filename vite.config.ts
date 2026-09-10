import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function embeddedBackendPlugin(): Plugin {
  return {
    name: 'heatguard-embedded-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api/') || req.url === '/api')) {
          try {
            // @ts-expect-error server is dynamic local javascript module
            const { default: app } = await import('./server/index.js');
            return app(req, res, next);
          } catch (err) {
            console.error('[HeatGuard Vite Middleware Error]:', err);
            return next(err);
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    embeddedBackendPlugin()
  ],
  server: {
    port: 5173
  }
})

