"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

// next-themes 0.4.6 injects its anti-FOUC script during render. React 19
// reports this as a development warning even though the script works during SSR.
// Filter only that known warning and leave all other console errors untouched.
const themeConsole = console as typeof console & {
  __nextThemesScriptWarningPatched?: boolean
}

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  !themeConsole.__nextThemesScriptWarningPatched
) {
  const originalConsoleError = console.error.bind(console)

  console.error = (...args: unknown[]) => {
    const message = args[0]

    if (
      typeof message === "string" &&
      message.includes("Encountered a script tag while rendering React component")
    ) {
      return
    }

    originalConsoleError(...args)
  }

  themeConsole.__nextThemesScriptWarningPatched = true
}

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
