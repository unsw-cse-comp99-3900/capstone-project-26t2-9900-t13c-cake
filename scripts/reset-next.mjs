import { execSync } from "node:child_process";
import { existsSync, lstatSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/** Remove broken .next junction/folder and stale local build cache. */
function removeNextEntry() {
  if (!existsSync(".next")) {
    return;
  }

  if (process.platform === "win32") {
    try {
      lstatSync(".next");
      execSync("cmd /c rmdir .next", { stdio: "inherit" });
      return;
    } catch {
      // fall through
    }
  }

  rmSync(".next", { recursive: true, force: true });
}

function removeDirectory(dir) {
  if (!existsSync(dir)) {
    return;
  }

  if (process.platform === "win32") {
    execSync(`cmd /c rmdir /s /q "${dir}"`, { stdio: "inherit" });
    return;
  }

  rmSync(dir, { recursive: true, force: true });
}

const localCache = path.join(
  process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"),
  "t13c-cake-next",
);

removeNextEntry();
removeDirectory(localCache);

console.log("Next.js build cache reset.");
