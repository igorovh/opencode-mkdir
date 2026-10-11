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

## Requirements

- OpenCode V2 2.0.26 or newer.

## Install

Install the plugin from GitHub with the OpenCode CLI:

```sh
opencode plugin add github:igorovh/opencode-mkdir
```

To pin a release, add its tag:

```sh
opencode plugin add github:igorovh/opencode-mkdir#v0.1.0
```

This adds the plugin to the global `plugins` array in `~/.config/opencode/opencode.jsonc`. Restart the TUI, then run
`/mkdir`.

You can also add the entry to the config yourself:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["github:igorovh/opencode-mkdir"]
}
```

Update or remove it later:

```sh
opencode plugin update github:igorovh/opencode-mkdir
opencode plugin remove github:igorovh/opencode-mkdir
```

## Development

Requires [Bun](https://bun.sh).

```sh
git clone https://github.com/igorovh/opencode-mkdir.git
cd opencode-mkdir
bun install
bun test
bun run typecheck
```

To run your checkout instead of the published plugin, put its path in `plugins` and restart the TUI:

```jsonc
{
  "plugins": ["/path/to/opencode-mkdir"]
}
```

## License

[MIT](LICENSE)
