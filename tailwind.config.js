/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./index.ts",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel_400Regular'],
        'cinzel-bold': ['Cinzel_700Bold'],
        'cinzel-black': ['Cinzel_900Black'],
      },
    },
  },
  plugins: [],
}