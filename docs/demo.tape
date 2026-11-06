# Records docs/demo.gif. Run from the repository root: vhs docs/demo.tape
# Uses throwaway config, data and state directories, so no personal plugins or sessions show up.

Output docs/demo.gif

Set Shell "bash"
Set FontSize 16
Set Width 1200
Set Height 640
Set Padding 16
Set TypingSpeed 60ms

Hide
Type "export REPO=$PWD XDG_CONFIG_HOME=$(mktemp -d) XDG_DATA_HOME=$(mktemp -d) XDG_STATE_HOME=$(mktemp -d)" Enter
Type `mkdir -p $XDG_CONFIG_HOME/opencode && echo "{\"plugins\":[\"$REPO\"]}" > $XDG_CONFIG_HOME/opencode/cli.json` Enter
Type "export DEMO=$(mktemp -d)/demo && mkdir -p $DEMO && cd $DEMO && clear" Enter
Type "opencode" Enter
Sleep 5s
Show

# Home screen: a new session opens in the new folder.
Type "/mkdir my-app"
Sleep 800ms
Enter
Sleep 3s

# In a session: no name opens the prompt, and the session moves.
# The trailing space closes autocompletion, so Enter runs the command.
Type "/md "
Sleep 800ms
Enter
Sleep 1.5s
Type "notes"
Sleep 500ms
Enter
Sleep 3s
