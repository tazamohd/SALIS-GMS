// Tailwind config for the design-sync build: same theme as the app, but the
// content globs also cover .design-sync/previews/ so utility classes used in
// authored preview cards are generated into the shipped stylesheet.
const base = require('../tailwind.config');

module.exports = {
  ...base,
  content: [
    './client/index.html',
    './client/src/**/*.{js,jsx,ts,tsx}',
    './.design-sync/previews/**/*.{ts,tsx}',
  ],
};
