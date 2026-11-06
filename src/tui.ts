import { Plugin } from "@opencode/plugin/tui"
import { COMMAND_ALIASES, COMMAND_NAME, createDirectory, parseName, resolveTarget } from "./mkdir.ts"

type TuiContext = Plugin.Context

const TITLE = "mkdir"

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function activeDirectory(context: TuiContext, sessionID: string | undefined): string {
  const session = sessionID ? context.data.session.get(sessionID) : undefined
  if (session) return session.location.directory
  return context.location?.directory ?? context.data.location.default().directory
}

async function moveInto(context: TuiContext, sessionID: string | undefined, directory: string, label: string) {
  if (sessionID) {
    await context.client.session.move({ sessionID, directory })
    context.data.session.invalidate(sessionID)
    await context.data.session.sync(sessionID)
    return
  }

  const session = await context.client.session.create({ title: label, location: { directory } })
  context.data.session.invalidate(session.id)
  context.ui.router.navigate({ type: "session", sessionID: session.id })
}

export default Plugin.define({
  id: "mkdir",
  setup(context) {
    const toastError = (message: string) => context.ui.toast.show({ title: TITLE, message, variant: "error" })

    const run = async (input?: string): Promise<void> => {
      // Read the route once: the user may switch tabs while the name prompt is open.
      const route = context.ui.router.current()
      const sessionID = route.type === "session" ? route.sessionID : undefined
      const base = activeDirectory(context, sessionID)
      let name = parseName(input)

      if (!name) {
        const entered = await context.ui.dialog.prompt({
          title: "New folder",
          description: `Created in ${context.ui.format.path(base)}`,
          placeholder: "Folder name",
        })
        if (entered === undefined) return
        name = parseName(entered)
      }

      const target = resolveTarget(base, name)
      if (!target.ok) return toastError(target.error)

      try {
        await createDirectory(target.path)
      } catch (error) {
        return toastError(errorMessage(error))
      }

      const display = context.ui.format.path(target.path)
      try {
        await moveInto(context, sessionID, target.path, name)
        context.ui.toast.show({ title: TITLE, message: `Created and moved to ${display}`, variant: "success" })
      } catch (error) {
        toastError(`Created ${display}, but could not move there: ${errorMessage(error)}`)
      }
    }

    // Slash completion runs while the prompt has focus, which only global layers reach.
    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "mkdir.create",
          title: "Create folder and move into it",
          description: "Create a folder in the current directory and move the session there",
          group: "Files",
          palette: true,
          slash: { name: COMMAND_NAME, aliases: [...COMMAND_ALIASES], arguments: true },
          run,
        },
      ],
    }))
  },
})
