import { mkdir, stat } from "node:fs/promises"
import path from "node:path"

export const COMMAND_NAMES = ["mkdir", "newdir", "md"] as const

export type TargetResult = { ok: true; path: string } | { ok: false; error: string }

// Slash input may arrive with the command token still attached, depending on the host.
export function parseName(input: string | undefined): string {
  let value = (input ?? "").trim()
  const token = value.match(/^\/(\S+)(?:\s+|$)/)
  if (token && (COMMAND_NAMES as readonly string[]).includes(token[1] ?? "")) {
    value = value.slice(token[0].length).trim()
  }
  if (value.length >= 2 && /^(["']).*\1$/.test(value)) value = value.slice(1, -1).trim()
  return value
}

export function resolveTarget(baseDirectory: string, name: string): TargetResult {
  if (!name) return { ok: false, error: "Folder name is required." }
  if (path.isAbsolute(name) || path.win32.isAbsolute(name)) {
    return { ok: false, error: "Use a name relative to the current directory." }
  }

  const base = path.resolve(baseDirectory)
  const target = path.resolve(base, name)
  const relative = path.relative(base, target)
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    return { ok: false, error: "The folder must be inside the current directory." }
  }

  return { ok: true, path: target }
}

export async function createDirectory(target: string): Promise<void> {
  const existing = await stat(target).catch(() => undefined)
  if (existing) {
    throw new Error(existing.isDirectory() ? "Folder already exists." : "A file with this name already exists.")
  }
  await mkdir(target, { recursive: true })
}
