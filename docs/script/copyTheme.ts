import { cp } from "node:fs/promises";
import path from "node:path";

const theme = process.argv[2];
const validThemes = ["killer", "sprinkle"];

if (!theme || !validThemes.includes(theme)) {
  console.error(`Usage: npm run copy:killer OR npm run copy:sprinkle`);
  process.exit(1);
}

const rootDir = path.resolve(import.meta.dirname, "..");
const themeDir = path.resolve(rootDir, "..", `docs-${theme}`);

async function main() {
  console.log(`Copying docs-${theme} into docs...`);

  await cp(themeDir, rootDir, {
    recursive: true,
    force: true,
    filter: (src) => {
      const rel = path.relative(themeDir, src);
      if (!rel) return true;
      const firstSegment = rel.split(path.sep)[0];
      if (["node_modules", "dist", ".git"].includes(firstSegment)) return false;
      if (rel === "package.json") return false;
      if (rel === path.join("script", "copyTheme.ts")) return false;
      return true;
    },
  });

  console.log(`Copied docs-${theme} into docs. Run npm run build next.`);
}

main().catch((error) => {
  console.error("Failed to copy theme:", error);
  process.exit(1);
});
