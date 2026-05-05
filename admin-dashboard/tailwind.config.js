/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        "primary-hover": "#4f46e5",
        accent: "#10b981",
        error: "#ef4444",
        "bg-dark": "#0f172a",
        "text-muted": "#94a3b8",
      }
    },
  },
  plugins: [],
}
