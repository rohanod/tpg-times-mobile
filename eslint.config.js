// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/hooks/useSettings.ts", "src/hooks/useCurrentStop.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  }
]);
