import pkg from "@next/env"
import { spawn } from "node:child_process"
import { parseArgs } from "node:util"

const { loadEnvConfig } = pkg

// 1. Cargar variables de entorno nativas de Next.js
const projectDir = process.cwd()
const isDev = process.argv.includes("--dev")
loadEnvConfig(projectDir, isDev)

// 2. Procesar los argumentos CLI
const { values } = parseArgs({
  options: {
    dev: {
      type: "boolean",
      default: false,
    },
    target: {
      type: "string",
      short: "t",
    },
    host: {
      type: "string",
      default: "0.0.0.0",
    },
  },
  strict: false,
  allowPositionals: true,
})

// 3. Cargar directorio de trabajo
if (!values.target && !process.env.TARGET_PROJECT_PATH) {
  console.log(
    "\x1b[33m%s\x1b[0m",
    `TARGET_PROJECT_PATH y -t no especificados. Usando directorio de la aplicación: ${projectDir}`
  )
}

// 4. Preparar variables y lanzar Next.js
const nextCommand = values.dev ? "dev" : "start"
const env = {
  ...process.env,
  TARGET_PROJECT_PATH:
    values.target || process.env.TARGET_PROJECT_PATH || projectDir,
  HOST: values.host,
}

// Determinar el comando correcto según el S.O. para evitar 'shell: true' (DEP0190)
const command = process.platform === "win32" ? "npx.cmd" : "npx"

const child = spawn(command, ["next", nextCommand], {
  stdio: "inherit",
  env,
})

child.on("exit", (code) => {
  process.exit(code ?? 0)
})
