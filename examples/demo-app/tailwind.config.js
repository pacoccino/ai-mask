/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'orange': {
          '50': '#fff6ed',
          '100': '#feead6',
          '200': '#fcd1ac',
          '300': '#fab077',
          '400': '#f78440',
          '500': '#f4631b',
          '600': '#e54911',
          '700': '#be3510',
          '800': '#972b15',
          '900': '#7a2614',
          '950': '#421008',
        },
        'green': {
          '50': '#f4f9f8',
          '100': '#dbece8',
          '200': '#b7d8d3',
          '300': '#8bbdb6',
          '400': '#639e98',
          '500': '#49837e',
          '600': '#386965',
          '700': '#305553',
          '800': '#2a4543',
          '900': '#243837',
          '950': '#122121',
        },

      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

