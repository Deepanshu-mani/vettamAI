/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        subtle: "#6b7280",
        surface: "#ffffff",
        border: "#e5e7eb",
        soft: "#f5f7fb",
      }
    },
  },
  plugins: [],
}
