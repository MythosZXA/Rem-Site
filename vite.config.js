import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		host: true,
		port: 5174,
		hmr: {
			host: 'localhost'
		}
	},
  plugins: [react()],
})
