import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), checker({ typescript: true })],
	server: {
		proxy: {
			"/api": "http://localhost:3000" // Forwards all requests at localhost:5173/api/*
		}
	}
});
