/** @jsxImportSource @opentui/solid */

import { Plugin } from "@opencode/plugin/tui"
import { createDirectory, parseName, resolveTarget } from "./mkdir.ts"

type TuiContext = Plugin.Context

const TITLE = "mkdir"

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function activeDirectory(context: TuiContext): string {
  const route = context.ui.router.current()
  if (route.type === "session") {
    const session = context.data.session.get(route.sessionID)
    if (session) return session.location.directory
  }
  return context.location?.directory ?? context.data.location.default().directory
}

async function moveInto(context: TuiContext, directory: string, label: string): Promise<void> {
  const route = context.ui.router.current()
  if (route.type === "session") {
    await context.client.session.move({ sessionID: route.sessionID, directory })
    context.data.session.invalidate(route.sessionID)
    await context.data.session.sync(route.sessionID)
    return
  }

  const session = await context.client.session.create({ title: label, location: { directory } })
  context.data.session.invalidate(session.id)
  context.ui.router.navigate({ type: "session", sessionID: session.id })
}

function MkdirCommand(props: { context: TuiContext; run: (input?: string) => Promise<void> }) {
  props.context.keymap.layer(() => ({
    mode: "global",
    commands: [
      {
        id: "mkdir.create",
        title: "Create folder and move into it",
        description: "Create a folder in the current directory and move the session there",
        group: "Files",
        palette: true,
        slash: { name: "mkdir", aliases: ["newdir", "md"], arguments: true },
        run: props.run,
      },
    ],
  }))
  return null
}

export default Plugin.define({
  id: "mkdir",
  setup(context) {
    const toastError = (message: string) => context.ui.toast.show({ title: TITLE, message, variant: "error" })

    const run = async (input?: string): Promise<void> => {
      const base = activeDirectory(context)
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
        await moveInto(context, target.path, name)
        context.ui.toast.show({ title: TITLE, message: `Created and moved to ${display}`, variant: "success" })
      } catch (error) {
        toastError(`Created ${display}, but could not move there: ${errorMessage(error)}`)
      }
    }

    return context.ui.slot({
      append: "app",
      render: () => <MkdirCommand context={context} run={run} />,
    })
  },
})
