import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Debug logging
  console.log('=== VITE CONFIG DEBUG ===');
  console.log('Mode:', mode);
  console.log('Command:', command);
  console.log('VITE_API_BASE_URL from env:', env.VITE_API_BASE_URL);
  console.log('All VITE_ vars:', Object.keys(env).filter(key => key.startsWith('VITE_')));
  console.log('========================');
  
  const target = env.VITE_API_BASE_URL || "https://condor-guide.vercel.app";
  console.log('Final proxy target:', target);
  
  return {
    server: {
      proxy: {
        "/api": {
          target: target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});