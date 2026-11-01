export default {
  '**/*.{js,jsx,ts,tsx}': [
    'oxlint --fix',
    // Type checking needs the whole project, not just the staged files.
    () => 'tsrs --noEmit',
  ],
  '*': 'oxfmt --no-error-on-unmatched-pattern',
}
