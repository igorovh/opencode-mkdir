# opencode-mkdir

An OpenCode TUI plugin that adds `/mkdir`: create a folder in the current directory and move the session into it.

> Supports OpenCode V2 only (built against `@opencode/plugin` 2.0.26). V1 is not supported.

## Usage

```text
/mkdir my-folder
/mkdir "My Folder"
/mkdir a/b/c
```

Aliases: `/newdir`, `/md`. Running it without a name (or from the command palette, `Ctrl+P`) asks for one.

- The folder is created relative to the current session's directory. Absolute paths and `..` are rejected.
- An existing folder or file with the same name is an error; nothing is overwritten.
- In a session, the session moves into the new folder (`session.move`). On the Home screen, a new session opens there.
- Runs locally in the TUI; nothing is sent to the model.

## Install locally

```sh
bun install
```

Add the project directory to `plugins` in `~/.config/opencode/opencode.jsonc`, then restart the TUI:

```jsonc
{
  "plugins": ["E:/Projekty/WebstormProjects/opencode-mkdir"]
}
```

## Development

```sh
bun test
bun run typecheck
```
