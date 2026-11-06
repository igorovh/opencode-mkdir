import { mkdir, stat } from "node:fs/promises"
import path from "node:path"

export const COMMAND_NAME = "mkdir"
export const COMMAND_ALIASES = ["newdir", "md"] as const
const COMMAND_NAMES: readonly string[] = [COMMAND_NAME, ...COMMAND_ALIASES]

export type TargetResult = { ok: true; path: string } | { ok: false; error: string }

// Slash input may arrive with the command token still attached, depending on the host.
export function parseName(input: string | undefined): string {
  let value = (input ?? "").trim()
  const token = value.match(/^\/(\S+)(?:\s+|$)/)
  if (token && COMMAND_NAMES.includes(token[1] ?? "")) {
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
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return { ok: false, error: "The folder must be inside the current directory." }
  }

  return { ok: true, path: target }
}

const FS_ERRORS: Record<string, string> = {
  EACCES: "Permission denied.",
  EPERM: "Permission denied.",
  EINVAL: "The folder name is not valid on this system.",
  ENAMETOOLONG: "The folder name is too long.",
  ENOTDIR: "A file is in the way of this path.",
  EROFS: "The file system is read-only.",
  ENOSPC: "The disk is full.",
}

function friendly(error: unknown): Error {
  const code = (error as NodeJS.ErrnoException | undefined)?.code
  const message = code ? FS_ERRORS[code] : undefined
  return message ? new Error(message) : error instanceof Error ? error : new Error(String(error))
}

export async function createDirectory(target: string): Promise<void> {
  try {
    await mkdir(path.dirname(target), { recursive: true })
    // Without `recursive`, an existing entry fails with EEXIST instead of passing silently.
    await mkdir(target)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw friendly(error)
    const existing = await stat(target).catch(() => undefined)
    if (!existing) throw new Error(FS_ERRORS.ENOTDIR)
    throw new Error(existing.isDirectory() ? "Folder already exists." : "A file with this name already exists.")
  }
}
