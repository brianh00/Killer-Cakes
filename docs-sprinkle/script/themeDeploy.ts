import { execFile } from "node:child_process";
import { cp } from "node:fs/promises";
import path from "node:path";

const theme = process.argv[2];
const validThemes = ["killer", "sprinkle"];

if (!theme || !validThemes.includes(theme)) {
  console.error(`Usage: npm run deploy:${validThemes.join("|npm run deploy:")}`);
  process.exit(1);
}

const rootDir = path.resolve(import.meta.dirname, "..");
const themeDir = path.resolve(rootDir, "..", `docs-${theme}`);
const repoDir = path.resolve(rootDir, "..");
const targetDir = rootDir;

async function deployTheme() {
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

  console.log(`Theme swapped. Building ${theme} theme...`);
  await runCommand("npm", ["run", "build"], targetDir);

  console.log("Staging docs changes...");
  await runCommand("git", ["add", "docs"], repoDir);

  const hasChanges = await gitHasStagedDocsChanges(repoDir);
  if (hasChanges) {
    const commitMessage = `Deploy ${theme} theme`;
    console.log(`Committing changes: ${commitMessage}`);
    await runCommand("git", ["commit", "-m", commitMessage], repoDir);
  } else {
    console.log("No changes detected in docs to commit.");
  }

  console.log("Pushing to remote...");
  await runCommand("git", ["push"], repoDir);
  console.log(`Deploy command for ${theme} theme completed.`);
}

function runCommand(command: string, args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = execFile(getCommand(command), args, { cwd }, (error, stdout, stderr) => {
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

function gitHasStagedDocsChanges(cwd: string) {
  return new Promise<boolean>((resolve, reject) => {
    const child = execFile("git", ["diff", "--cached", "--quiet", "--", "docs"], { cwd }, (error) => {
      if (error) {
        if (error.code === 1 || error.code === 128) {
          resolve(true);
        } else {
          reject(error);
        }
      } else {
        resolve(false);
      }
    });

    child.on("error", (err) => reject(err));
  });
}

deployTheme().catch((error) => {
  console.error("Failed to deploy theme:", error);
  process.exit(1);
});