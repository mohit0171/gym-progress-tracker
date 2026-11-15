// Single source of truth for the Tailwind palette.
// Build step: `npx tailwindcss@3.4.17 -c tailwind-config.js -i tailwind.input.css -o styles.tailwind.css --minify`
// (The Tailwind Play CDN is no longer loaded in production.)
const alpha = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: ["./index.html", "./app.js", "./nutrition.js"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Bricolage Grotesque", "Manrope", "sans-serif"],
        mono: ["Space Grotesk", "monospace"],
      },
      colors: {
        // Theme-aware accents: values come from CSS variables defined in tailwind.input.css,
        // so the same class works on light cards and dark surfaces.
        volt: {
          300: alpha("--volt-400"),
          400: alpha("--volt-400"),
          500: alpha("--volt-400"),
          600: alpha("--volt-400"),
        },
        ice: {
          200: alpha("--ice-400"),
          300: alpha("--ice-400"),
          400: alpha("--ice-400"),
          500: alpha("--ice-400"),
        },
        // Dark surface scale (static).
        charcoal: {
          700: "#2A302D",
          800: "#202523",
          850: "#1B201E",
          900: "#171A19",
          950: "#101312",
        },
        sage: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#88B05F",
          500: "#6F9946",
          600: "#5A7A3A",
          700: "#46602C",
          800: "#334720",
          900: "#223015",
        },
        offwhite: { 50: "#FAFAFA", 100: "#F5F5F5", 200: "#E5E5E5" },
        tomato: {
          100: "#FFF5F3",
          200: "#FEE2E2",
          300: "#FECACA",
          400: "#FF7F66",
          500: "#FF6347",
          600: "#E0482E",
          700: "#B91C1C",
        },
        navy: {
          50: "#EDF2F7",
          100: "#E2E8F0",
          200: "#CBD5E1",
          300: "#94A3B8",
          400: "#64748B",
          500: "#475569",
          600: "#1E4976",
          700: "#103A63",
          800: "#082544",
          900: "#003366",
          950: "#001F3F",
        },
        cream: { 50: "#FFFDD0", 100: "#FFF9C4", 200: "#FEF08A" },
        coral: {
          100: "#FFEDF0",
          200: "#FEC8D8",
          300: "#FEA5A9",
          400: "#FF8896",
          500: "#FF6B6B",
          600: "#FF5B5B",
          700: "#E63946",
        },
        gray: {
          100: "#F1F2F4",
          200: "#E3E5E8",
          300: "#C9CDD3",
          400: "#9AA1AB",
          500: "#6B7280",
          600: "#4B5058",
          700: "#353A41",
          800: "#262A30",
          900: "#1C1E22",
        },
      },
    },
  },
};
