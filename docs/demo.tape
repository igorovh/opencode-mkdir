# Records docs/demo.gif. Run from the repository root: vhs docs/demo.tape
# Set OPENCODE_BIN when `opencode` on PATH is not OpenCode V2. A throwaway home keeps personal config out;
# set DEMO_HOME to an empty folder with a neutral path when the temp path would show your user name.

Output docs/demo.gif

Set Shell "bash"
Set FontSize 16
Set Width 1200
Set Height 640
Set Padding 12
Set TypingSpeed 70ms
Set Framerate 20

Hide
Type `export REPO="$(pwd -W 2>/dev/null || pwd)" HOME="${DEMO_HOME:-$(mktemp -d)/home}"` Enter
Type `export USERPROFILE="$(cygpath -w "$HOME" 2>/dev/null || echo "$HOME")" XDG_CONFIG_HOME="$HOME/.config" XDG_DATA_HOME="$HOME/.local/share" XDG_STATE_HOME="$HOME/.local/state" XDG_CACHE_HOME="$HOME/.cache"` Enter
Type `mkdir -p "$XDG_CONFIG_HOME/opencode" "$HOME/demo/acme-api" && printf '{"plugins":["%s"]}' "$REPO" > "$XDG_CONFIG_HOME/opencode/cli.json"` Enter
Type `cd "$HOME/demo/acme-api" && git init -q && clear` Enter
# --standalone uses a private server, so a background service you already run is left alone.
Type `"${OPENCODE_BIN:-opencode}" --standalone` Enter
Sleep 10s
Show

# Home screen: a new session opens in the new folder.
Type "/mkdir web-app "
Sleep 1s
Enter
Sleep 3.5s

# In a session: no name opens the prompt, and the session moves.
# The trailing space closes autocompletion, so Enter runs the command.
Type "/md "
Sleep 1s
Enter
Sleep 1.5s
Type "notes"
Sleep 700ms
Enter
Sleep 4s
