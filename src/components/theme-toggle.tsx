"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FiMoon, FiSun } from "react-icons/fi"

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("theme:dark")
    const prefers = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldDark = stored ? stored === "true" : prefers
    setIsDark(shouldDark)
    document.documentElement.classList.toggle("dark", shouldDark)
  }, [])

  function toggle() {
    setIsDark((d) => {
      const next = !d
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem("theme:dark", String(next))
      return next
    })
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
      {isDark ? <FiSun className="size-5" /> : <FiMoon className="size-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
