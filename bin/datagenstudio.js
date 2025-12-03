#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const pkgRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const entry = path.join(pkgRoot, "index.ts");

const args = process.argv.slice(2);
let port = null;
const rest = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if ((arg === "--port" || arg === "-p") && args[i + 1]) {
    port = args[i + 1];
    i += 1;
  } else if (arg.startsWith("--port=") || arg.startsWith("-p=")) {
    port = arg.split("=", 2)[1];
  } else {
    rest.push(arg);
  }
}

if (!port) {
  port = process.env.PORT;
}

const child = spawn("bun", [entry, ...rest], {
  stdio: "inherit",
  cwd: pkgRoot,
  shell: false,
  env: { ...process.env, ...(port ? { PORT: port } : {}) },
});

child.on("exit", (code) => process.exit(code ?? 0));
