export default {
  '**/*.{js,jsx,ts,tsx}': [
    // "jest --bail --watchAll=false --findRelatedTests --passWithNoTests",
    () => 'tsc-files --noEmit',
  ],
  '**/*.{ts,tsx,js,jsx,json,md,mdx,css}': ['prettier --write'],
  // '*.{js,jsx,ts,tsx}': ['eslint --fix'],
}
