import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Overly strict: flags legitimate patterns like fetch→setState and
      // browser-only init (window.*) inside useEffect. The React team
      // endorses useEffect(() => { setState(x) }, [dep]) for sync-to-external.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    // Next.js build output
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Root config files — eslint-plugin-react (bundled in eslint-config-next)
    // uses the ESLint v8 getFilename API which breaks on non-React files
    "*.config.{ts,js,mjs,cjs}",
    "scripts/**",
  ]),
]);

export default eslintConfig;
