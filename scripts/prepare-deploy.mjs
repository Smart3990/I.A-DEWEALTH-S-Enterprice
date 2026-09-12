import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function copyRecursive(src, dest, excludeNames = new Set()) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (excludeNames.has(entry)) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function run() {
  console.log("Preparing deployment outputs for Netlify and other hosts...");

  const distDir = path.join(rootDir, "dist");
  const outputPublicDir = path.join(rootDir, ".output", "public");
  const outputServerDir = path.join(rootDir, ".output", "server");
  const netlifyFunctionsInternal = path.join(rootDir, ".netlify", "functions-internal");
  const netlifyFunctionsDir = path.join(rootDir, "netlify", "functions");

  // Determine where static assets are
  const sourceStaticDir = fs.existsSync(distDir)
    ? distDir
    : fs.existsSync(outputPublicDir)
      ? outputPublicDir
      : null;

  if (!sourceStaticDir) {
    console.warn("No static directory (dist or .output/public) found!");
    return;
  }

  // Ensure root dist exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // If source was .output/public, sync to dist root first
  if (sourceStaticDir !== distDir) {
    copyRecursive(sourceStaticDir, distDir);
  }

  // Items to duplicate into dist/client and dist/public
  const distClientDir = path.join(distDir, "client");
  const distPublicDir = path.join(distDir, "public");

  fs.mkdirSync(distClientDir, { recursive: true });
  fs.mkdirSync(distPublicDir, { recursive: true });

  const excluded = new Set(["client", "public"]);
  const topItems = fs.readdirSync(distDir).filter((name) => !excluded.has(name));

  for (const item of topItems) {
    const srcPath = path.join(distDir, item);
    copyRecursive(srcPath, path.join(distClientDir, item));
    copyRecursive(srcPath, path.join(distPublicDir, item));
  }

  // Ensure Netlify redirects exist in all publish directory candidates
  const defaultRedirects = `# Netlify redirects for TanStack Start & Nitro serverless handler
/*    /.netlify/functions/server    200
`;

  const targets = [distDir, distClientDir, distPublicDir];
  for (const t of targets) {
    const redirectFile = path.join(t, "_redirects");
    if (!fs.existsSync(redirectFile)) {
      fs.writeFileSync(redirectFile, defaultRedirects, "utf8");
    }
  }

  // Ensure Netlify functions directory fallback
  if (fs.existsSync(netlifyFunctionsInternal)) {
    if (!fs.existsSync(netlifyFunctionsDir)) {
      fs.mkdirSync(netlifyFunctionsDir, { recursive: true });
    }
    const serverFnInternal = path.join(netlifyFunctionsInternal, "server");
    const serverFnTarget = path.join(netlifyFunctionsDir, "server");
    if (fs.existsSync(serverFnInternal) && !fs.existsSync(serverFnTarget)) {
      copyRecursive(serverFnInternal, serverFnTarget);
    }
  }

  console.log("Successfully prepared deployment targets:");
  console.log(`- dist: ${fs.existsSync(distDir) ? "OK" : "Missing"}`);
  console.log(`- dist/client: ${fs.existsSync(distClientDir) ? "OK" : "Missing"}`);
  console.log(`- dist/public: ${fs.existsSync(distPublicDir) ? "OK" : "Missing"}`);
  console.log(
    `- .netlify/functions-internal: ${fs.existsSync(netlifyFunctionsInternal) ? "OK" : "Missing"}`,
  );
  console.log(`- netlify/functions: ${fs.existsSync(netlifyFunctionsDir) ? "OK" : "Missing"}`);
}

run();
