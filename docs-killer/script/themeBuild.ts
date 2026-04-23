import { exec } from "node:child_process";
import { cp, rm } from "node:fs/promises";
import path from "node:path";

const theme = process.argv[2];
const validThemes = ["killer", "sprinkle"];

if (!theme || !validThemes.includes(theme)) {
  console.error(`Usage: npm run build:${validThemes.join("|npm run build:")}`);
  process.exit(1);
}

const rootDir = path.resolve(import.meta.dirname, "..");
const themeDir = path.resolve(rootDir, "..", `docs-${theme}`);
const targetDir = rootDir;

async function copyTheme() {
  console.log(`Swapping docs content to '${theme}' theme from ${themeDir}`);

  await cp(themeDir, targetDir, {
    recursive: true,
    force: true,
    filter: (src) => {
      const rel = path.relative(themeDir, src);
      if (!rel) return true;
      const firstSegment = rel.split(path.sep)[0];
      return !["node_modules", "dist", ".git"].includes(firstSegment);
    },
  });

  console.log(`Theme swapped. Running npm run build in ${targetDir}`);

  await runBuild();
}

function getCommand(command: string) {
  if (process.platform === "win32") {
    if (command === "npm") return "npm.cmd";
    if (command === "npx") return "npx.cmd";
  }
  return command;
}

function runBuild() {
  return new Promise<void>((resolve, reject) => {
    const child = execFile(getCommand("npm"), ["run", "build"], { cwd: targetDir }, (error, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    child.on("error", (err) => reject(err));
  });
}

copyTheme().catch((error) => {
  console.error("Failed to swap theme and build:", error);
  process.exit(1);
});
