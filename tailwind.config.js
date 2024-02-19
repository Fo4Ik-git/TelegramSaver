/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  // darkMode: 'media',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'dark': 'url(assets/img/chat-bg-pattern-dark.png)',
        'light': 'url(assets/img/chat-bg-pattern-light.png)'
      }
    },
    colors: {
      'background': {
        'light': '#FFFFFF',
        'dark': '#212121'
      },
      'primary': {
        'light': '#8774E1',
        'dark': '#8774E1'
      },
      'splitter': {
        'light': '#F0F0F0',
        'dark': '#303030'
      },
      'secondary': {
        'light': '#F0F0F0',
        'dark': '#303030'
      },
      'text': {
        'light': '#000000',
        'dark': '#FFFFFF'
      },

      ...colors
    }
  },
  plugins: [
    require('flowbite/plugin')
  ]
}

