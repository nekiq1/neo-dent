#!/usr/bin/env node
/**
 * Run a command with `.grok/app-env.json` merged into its environment.
 *
 * `dev`, `build` and `preview` all route through this wrapper so Vite always
 * sees the same VITE_* flags.
 *
 * Only VITE_-prefixed string keys from the file are applied.
 * An explicit process.env value always wins.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { constants as osConstants } from "node:os";
import { dirname, join, delimiter } from "node:path";
import { fileURLToPath } from "node:url";

export const APP_ENV_REL_PATH = ".grok/app-env.json";

const VITE_PREFIX = "VITE_";
const isWin = process.platform === "win32";

export function parseAppEnv(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const env = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!key.startsWith(VITE_PREFIX)) continue;
    if (typeof value !== "string") continue;
    env[key] = value;
  }
  return env;
}

export function readAppEnv(root) {
  try {
    return parseAppEnv(readFileSync(join(root, APP_ENV_REL_PATH), "utf8"));
  } catch {
    return {};
  }
}

export function mergeAppEnv(appEnv, processEnv) {
  return { ...appEnv, ...processEnv };
}

export function exitStatusFromChild(code, signal) {
  if (signal) {
    const signo = osConstants.signals[signal];
    return 128 + (typeof signo === "number" ? signo : 1);
  }
  return code ?? 1;
}

export function projectRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

export function isMainModule(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

/** Put node_modules/.bin first on PATH so local bins resolve. */
function withLocalBinOnPath(root, env) {
  const binDir = join(root, "node_modules", ".bin");
  if (!existsSync(binDir)) return env;
  const current = env.PATH || env.Path || "";
  const parts = current.split(delimiter).filter(Boolean);
  if (parts[0] === binDir) return env;
  const next = [binDir, ...parts].join(delimiter);
  return { ...env, PATH: next, Path: next };
}

/** Quote a single arg for cmd.exe /c. */
function quoteCmdArg(arg) {
  if (!arg.length) return '""';
  if (!/[\s"&<>|^()]/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '""')}"`;
}

function main(argv) {
  const [command, ...args] = argv;
  if (!command) {
    console.error("usage: node scripts/with-app-env.mjs <command> [args…]");
    process.exit(2);
  }

  const root = projectRoot();
  let env = mergeAppEnv(readAppEnv(root), process.env);
  env = withLocalBinOnPath(root, env);

  let child;
  if (isWin) {
    // Avoid shell:true (DEP0190) and avoid spawn(*.cmd) EINVAL on Node 22/26.
    // Run through cmd.exe /d /s /c with a single command line.
    const line = [command, ...args].map(quoteCmdArg).join(" ");
    child = spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", line], {
      stdio: "inherit",
      env,
      windowsHide: true,
    });
  } else {
    child = spawn(command, args, {
      stdio: "inherit",
      env,
    });
  }

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => {
      try {
        child.kill(signal);
      } catch {
        // ignore
      }
    });
  }

  child.on("error", (err) => {
    console.error(`[with-app-env] failed to run ${command}:`, err?.message || err);
    process.exit(127);
  });

  child.on("exit", (code, signal) => {
    process.exit(exitStatusFromChild(code, signal));
  });
}

if (isMainModule(import.meta.url)) {
  main(process.argv.slice(2));
}
