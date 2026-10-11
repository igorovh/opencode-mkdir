import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { createDirectory, parseName, resolveTarget } from "../src/mkdir.ts"

describe("parseName", () => {
  test("strips a leading command token and its aliases", () => {
    expect(parseName("/mkdir foo")).toBe("foo")
    expect(parseName("/md  bar ")).toBe("bar")
    expect(parseName("/newdir")).toBe("")
  })

  test("keeps other slash-prefixed input and unwraps quotes", () => {
    expect(parseName("/other")).toBe("/other")
    expect(parseName(`"My Folder"`)).toBe("My Folder")
    expect(parseName(undefined)).toBe("")
  })
})

describe("resolveTarget", () => {
  const base = path.resolve("/work/project")

  test("resolves nested names inside the base", () => {
    expect(resolveTarget(base, "a/b")).toEqual({ ok: true, path: path.join(base, "a", "b") })
  })

  test.each(["", ".", "..", "../x", "a/../../x"])("rejects %p", (name) => {
    expect(resolveTarget(base, name).ok).toBe(false)
  })

  test("rejects absolute paths on any platform", () => {
    expect(resolveTarget(base, "/etc").ok).toBe(false)
    expect(resolveTarget(base, "C:\\x").ok).toBe(false)
  })
})

describe("createDirectory", () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "opencode-mkdir-"))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  test("creates nested folders", async () => {
    const target = path.join(root, "a", "b")
    await createDirectory(target)
    expect((await stat(target)).isDirectory()).toBe(true)
  })

  test("refuses an existing folder or file", async () => {
    await createDirectory(path.join(root, "dup"))
    await expect(createDirectory(path.join(root, "dup"))).rejects.toThrow("Folder already exists.")

    await writeFile(path.join(root, "file"), "")
    await expect(createDirectory(path.join(root, "file"))).rejects.toThrow("file with this name")
  })
})
