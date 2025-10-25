// import { defineConfig } from "eslint/config";

// export default defineConfig([
// 	{
// 		files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
// 		rules: {
// 			"prefer-const": "warn",
// 			"no-constant-binary-expression": "error",
//       "no-undef": "error",
// 			"import/prefer-default-export": "off",
// 		},
// 		env: []
// 	},
// ]);

import { defineConfig } from "eslint/config";
import globals from "globals"; // 1. Import the globals package

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    
    // 2. Add languageOptions to define the environment
    languageOptions: {
      // Spread the Node.js globals, which includes 'require', 'module', '__dirname', etc.
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "prefer-const": "warn",
      "no-constant-binary-expression": "error",
      // CRITICAL: We keep 'no-undef' to catch actual undefined variables, 
      // but 'globals.node' ensures 'require' is seen as defined.
      "no-undef": "error", 
      "import/prefer-default-export": "off",
    },
  },
]);
